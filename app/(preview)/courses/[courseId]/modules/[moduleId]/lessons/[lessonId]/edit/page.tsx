"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Lesson } from "@/lib/schemas/lms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { notFound } from "next/navigation";
import { toast } from "sonner";

export default function LessonEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [editedLesson, setEditedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch course and lesson data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);
        
        // Fetch lesson data
        const lessonResponse = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        if (!lessonResponse.ok) {
          throw new Error("Failed to fetch lesson");
        }
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);
        setEditedLesson(lessonData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Не удалось загрузить данные");
      }
    };
    
    fetchData();
  }, [courseId, moduleId, lessonId]);
  
  // If data is still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }
  
  // If course or lesson not found, return 404
  if (!course || !lesson || !editedLesson) {
    return notFound();
  }
  
  // Обработчик изменения полей формы
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedLesson((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };
  
  // Обработчик сохранения изменений
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedLesson),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось обновить урок");
      }
      
      toast.success("Урок успешно обновлен");
      router.push(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    } catch (error) {
      console.error("Error updating lesson:", error);
      toast.error("Не удалось обновить урок");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Редактирование урока</h1>
        <p className="text-muted-foreground">
          Модуль: {course.modules?.find((m: { id: string }) => m.id === moduleId)?.title || 'Загрузка...'}
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название урока</Label>
            <Input
              id="title"
              name="title"
              value={editedLesson.title}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Содержимое урока (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              value={editedLesson.content}
              onChange={handleFormChange}
              rows={15}
              className="font-mono text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL видео (опционально)</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={editedLesson.videoUrl || ""}
                onChange={handleFormChange}
                placeholder="https://example.com/video.mp4"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (в минутах)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={editedLesson.duration || ""}
                onChange={handleFormChange}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Сохранение...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Сохранить
            </span>
          )}
        </Button>
      </div>
    </div>
  );
} 