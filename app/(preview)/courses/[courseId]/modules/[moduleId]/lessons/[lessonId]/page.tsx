"use client";

import { LessonContent } from "@/components/shared/lesson-content";
import { getCourseById, getModuleById, getLessonById } from "@/lib/data/mock-courses";
import { getCompletedLessons } from "@/lib/data/mock-progress";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";

interface LessonPageProps {
  params: Promise<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>;
}

// Поскольку компонент client-side, асинхронный подход отличается от server компонентов
export default function LessonPage({ params }: LessonPageProps) {
  // Используем React.use для распаковки параметров маршрута
  const { courseId, moduleId, lessonId } = use(params);
  
  const [course, setCourse] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = () => {
      // Получаем данные о курсе, модуле и уроке
      const courseData = getCourseById(courseId);
      const moduleData = courseData ? getModuleById(courseId, moduleId) : undefined;
      const lessonData = moduleData ? getLessonById(courseId, moduleId, lessonId) : undefined;
      
      // Временно используем фиксированный userId для демонстрации
      const userId = "user-1";
      const completedLessonsData = getCompletedLessons(userId, courseId);
      
      setCourse(courseData);
      setModule(moduleData);
      setLesson(lessonData);
      setCompletedLessons(completedLessonsData);
      setIsLoading(false);
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
  
  // Проверяем, завершен ли урок
  const isLessonCompleted = completedLessons.includes(lessonId);
  
  // Находим предыдущий и следующий уроки для навигации
  const findAdjacentLesson = (direction: "prev" | "next") => {
    // Находим индекс текущего модуля
    const currentModuleIndex = course.modules.findIndex((m: any) => m.id === moduleId);
    
    // Находим индекс текущего урока в модуле
    const currentLessonIndex = module.lessons.findIndex((l: any) => l.id === lessonId);
    
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
  
  // Функция для обновления прогресса урока
  const handleCompleteLesson = async () => {
    try {
      // Временно используем фиксированный userId для демонстрации
      const userId = "user-1";
      
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId,
          moduleId,
          lessonId,
          completed: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update lesson progress");
      }
      
      const data = await response.json();
      setCompletedLessons(data.completedLessons);
      
      return data;
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      toast.error("Не удалось обновить прогресс урока");
      throw error;
    }
  };

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
          onComplete={handleCompleteLesson}
          isCompleted={isLessonCompleted}
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