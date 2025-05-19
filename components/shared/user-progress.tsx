"use client";

import { Course } from "@/lib/schemas/lms";
import { Progress } from "@/components/ui/progress";

interface UserProgressProps {
  course: Course;
  completedLessons: string[];
}

export function UserProgress({ course, completedLessons }: UserProgressProps) {
  // Вычисляем общее количество уроков
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  
  // Вычисляем процент завершения курса
  const completionPercentage = 
    totalLessons > 0 
      ? Math.round((completedLessons.length / totalLessons) * 100) 
      : 0;
  
  // Находим последний завершенный урок
  const findLastCompletedLesson = () => {
    if (completedLessons.length === 0) {
      return null;
    }
    
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (completedLessons.includes(lesson.id)) {
          return {
            moduleTitle: module.title,
            lessonTitle: lesson.title,
            moduleId: module.id,
            lessonId: lesson.id,
          };
        }
      }
    }
    
    return null;
  };
  
  const lastCompleted = findLastCompletedLesson();

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-2 font-semibold">Ваш прогресс</h3>
      
      <div className="mb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Завершено: {completedLessons.length} из {totalLessons} уроков
          </span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      {lastCompleted ? (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">Последний завершенный урок:</p>
          <p className="font-medium">{lastCompleted.lessonTitle}</p>
          <p className="text-xs text-muted-foreground">
            Модуль: {lastCompleted.moduleTitle}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Вы еще не завершили ни одного урока
        </p>
      )}
    </div>
  );
} 