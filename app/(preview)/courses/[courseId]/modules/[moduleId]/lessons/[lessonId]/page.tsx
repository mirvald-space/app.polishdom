"use client";

import { LessonContent } from "@/components/shared/lesson-content";
import { getCourseWithModules } from "@/lib/db-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Course, Module, Lesson } from "@/lib/schemas/lms";
import { useParams } from "next/navigation";

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем данные о курсе
        const courseData = await getCourseWithModules(courseId);
        
        if (!courseData) {
          setIsLoading(false);
          return;
        }
        
        // Находим модуль и урок
        const moduleData = courseData.modules.find(m => m.id === moduleId);
        
        if (!moduleData) {
          setIsLoading(false);
          return;
        }
        
        const lessonData = moduleData.lessons.find(l => l.id === lessonId);
        
        if (!lessonData) {
          setIsLoading(false);
          return;
        }
        
        setCourse(courseData);
        setModule(moduleData);
        setLesson(lessonData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных урока:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, moduleId, lessonId]);
  
  // Если данные еще загружаются, показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Загрузка урока...</p>
        </div>
      </div>
    );
  }
  
  // Если данные не найдены, возвращаем 404
  if (!course || !module || !lesson) {
    notFound();
  }
  
  // Находим предыдущий и следующий уроки для навигации
  const findAdjacentLesson = (direction: "prev" | "next") => {
    // Находим индекс текущего модуля
    const currentModuleIndex = course.modules.findIndex((m) => m.id === moduleId);
    
    // Находим индекс текущего урока в модуле
    const currentLessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
    
    if (direction === "prev") {
      // Если это не первый урок в модуле, возвращаем предыдущий урок
      if (currentLessonIndex > 0) {
        const prevLesson = module.lessons[currentLessonIndex - 1];
        return {
          moduleId,
          lessonId: prevLesson.id,
          title: prevLesson.title,
        };
      } 
      // Если это первый урок в модуле и не первый модуль, возвращаем последний урок предыдущего модуля
      else if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
        return {
          moduleId: prevModule.id,
          lessonId: lastLesson.id,
          title: lastLesson.title,
        };
      }
      // Если это первый урок первого модуля, возвращаем null
      return null;
    } else {
      // Если это не последний урок в модуле, возвращаем следующий урок
      if (currentLessonIndex < module.lessons.length - 1) {
        const nextLesson = module.lessons[currentLessonIndex + 1];
        return {
          moduleId,
          lessonId: nextLesson.id,
          title: nextLesson.title,
        };
      } 
      // Если это последний урок в модуле и не последний модуль, возвращаем первый урок следующего модуля
      else if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        const firstLesson = nextModule.lessons[0];
        return {
          moduleId: nextModule.id,
          lessonId: firstLesson.id,
          title: firstLesson.title,
        };
      }
      // Если это последний урок последнего модуля, возвращаем null
      return null;
    }
  };
  
  const prevLesson = findAdjacentLesson("prev");
  const nextLesson = findAdjacentLesson("next");

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Хлебные крошки */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div className="flex flex-wrap items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground">
            Курсы
          </Link>
          <span>/</span>
          <Link href={`/courses/${courseId}`} className="hover:text-foreground">
            {course.title}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{lesson.title}</span>
        </div>
        
        <Link href={`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/edit`}>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Редактировать урок
          </Button>
        </Link>
      </div>
      
      {/* Содержимое урока */}
      <div className="mb-8">
        <LessonContent 
          lesson={lesson} 
          onComplete={() => {
            toast.success("Урок завершен");
            return Promise.resolve(true);
          }}
          isCompleted={false}
        />
      </div>
      
      {/* Навигация между уроками */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <div>
          {prevLesson ? (
            <Link href={`/courses/${courseId}/modules/${prevLesson.moduleId}/lessons/${prevLesson.lessonId}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Предыдущий урок</span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="flex items-center space-x-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Предыдущий урок</span>
            </Button>
          )}
        </div>
        
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost">К содержанию курса</Button>
        </Link>
        
        <div>
          {nextLesson ? (
            <Link href={`/courses/${courseId}/modules/${nextLesson.moduleId}/lessons/${nextLesson.lessonId}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Следующий урок</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="flex items-center space-x-2">
              <span>Следующий урок</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 