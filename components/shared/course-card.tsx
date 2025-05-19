import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/schemas/lms";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const { id, title, description, imageUrl, level, modules } = course;
  
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

  // Количество уроков в курсе
  const lessonsCount = modules && modules.length > 0 
    ? modules.reduce(
        (count, module) => count + (module.lessons?.length || 0),
        0
      )
    : 0;

  return (
    <Link href={`/courses/${id}`}>
      <div 
        className={cn(
          "flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
          className
        )}
      >
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <div className={`flex h-full w-full items-center justify-center bg-primary/10`}>
            <span className="text-xl font-bold text-primary/70">{title.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className={cn("rounded-full px-2 py-1 text-xs font-medium", levelColor[level])}>
              {levelText[level]}
            </span>
            <span className="text-sm text-muted-foreground">
              {modules?.length || 0} {modules?.length === 1 ? "модуль" : 
              modules?.length > 1 && modules?.length < 5 ? "модуля" : "модулей"}
            </span>
          </div>
          
          <h3 className="line-clamp-2 text-lg font-semibold">{title}</h3>
          
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {lessonsCount} {lessonsCount === 1 ? "урок" : 
              lessonsCount > 1 && lessonsCount < 5 ? "урока" : "уроков"}
            </span>
            <span className="text-sm font-medium text-primary">
              Подробнее →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 