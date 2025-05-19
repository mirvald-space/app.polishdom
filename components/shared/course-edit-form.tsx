"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/schemas/lms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { AlertCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface CourseEditFormProps {
  course: Course;
}

export function CourseEditForm({ course }: CourseEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editedCourse, setEditedCourse] = useState<Course>({ ...course });
  const [newTag, setNewTag] = useState('');

  // Обработчик изменения базовых полей формы
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedCourse(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Добавление нового тега
  const handleAddTag = () => {
    if (newTag.trim() && !editedCourse.tags?.includes(newTag.trim())) {
      setEditedCourse(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // Удаление тега
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedCourse(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedCourse.title,
          description: editedCourse.description,
          level: editedCourse.level,
          tags: editedCourse.tags,
          imageUrl: editedCourse.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось обновить курс');
      }

      toast.success("Курс был успешно обновлен");

      // Обновляем клиентскую кэш-страницу
      router.refresh();
      
      // Редирект на страницу курса
      router.push(`/courses/${course.id}`);
    } catch (error) {
      console.error('Error updating course:', error);
      setFormError(error instanceof Error ? error.message : 'Произошла ошибка при обновлении курса');
      
      toast.error("Не удалось обновить курс");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название курса</Label>
            <Input
              id="title"
              name="title"
              value={editedCourse.title}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание курса</Label>
            <Textarea
              id="description"
              name="description"
              value={editedCourse.description}
              onChange={handleFormChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Уровень сложности</Label>
            <Select 
              id="level"
              name="level"
              value={editedCourse.level}
              onChange={handleFormChange}
            >
              <SelectItem value="beginner">Начинающий</SelectItem>
              <SelectItem value="intermediate">Средний</SelectItem>
              <SelectItem value="advanced">Продвинутый</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL изображения курса</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={editedCourse.imageUrl || ''}
              onChange={handleFormChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Теги</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedCourse.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Новый тег"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Добавить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          className="mr-2"
          onClick={() => router.back()}
        >
          Отмена
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
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
    </form>
  );
} 