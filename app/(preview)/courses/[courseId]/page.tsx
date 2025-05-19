import { CourseModule } from "@/components/shared/course-module";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/lib/data/mock-courses";
import { getCompletedLessons } from "@/lib/data/mock-progress";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Edit } from "lucide-react";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  // Используем React.use() для получения параметров
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const course = getCourseById(courseId);
  
  // Временно используем фиксированный userId для демонстрации
  const userId = "user-1";
  const completedLessons = getCompletedLessons(userId, courseId);
  
  if (!course) {
    notFound();
  }
  
  // Находим первый модуль и первый урок для кнопки "Начать обучение"
  const firstModule = course.modules[0];
  const firstLesson = firstModule?.lessons[0];
  
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
  
  // Определение цвета бейджа уровня сложности
  const levelColor = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  // Перевод уровня сложности
  const levelText = {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 grid gap-8 md:grid-cols-3">
        {/* Информация о курсе */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            
            <Link href={`/courses/${courseId}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Редактировать
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${levelColor[course.level]}`}>
              {levelText[course.level]}
            </span>
            
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {course.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground">{course.description}</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Прогресс:</span>
              <div className="h-2 w-40 rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            
            {firstModule && firstLesson && (
              <Link href={`/courses/${courseId}/modules/${firstModule.id}/lessons/${firstLesson.id}`}>
                <Button>
                  {completedLessons.length > 0 ? "Продолжить обучение" : "Начать обучение"}
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Изображение курса */}
        <div className="relative h-48 overflow-hidden rounded-lg md:h-full">
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-gray-500">Изображение курса</span>
          </div>
        </div>
      </div>
      
      {/* Содержание курса */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Содержание курса</h2>
        
        <div className="space-y-4">
          {course.modules.map((module) => (
            <CourseModule
              key={module.id}
              courseId={courseId}
              module={module}
              completedLessons={completedLessons}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 