"use client";

import { Module } from "@/lib/schemas/lms";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CourseModuleProps {
  courseId: string;
  module: Module;
  isActive?: boolean;
  completedLessons?: string[];
}

export function CourseModule({ 
  courseId, 
  module, 
  isActive = false, 
  completedLessons = [] 
}: CourseModuleProps) {
  const { id, title, description, lessons } = module;
  
  // Проверка, завершен ли модуль полностью
  const isModuleCompleted = lessons.every(lesson => 
    completedLessons.includes(lesson.id)
  );
  
  // Подсчет завершенных уроков в модуле
  const completedCount = lessons.filter(lesson => 
    completedLessons.includes(lesson.id)
  ).length;
  
  // Процент завершения модуля
  const completionPercentage = lessons.length > 0 
    ? Math.round((completedCount / lessons.length) * 100) 
    : 0;

  return (
    <Accordion type="single" collapsible defaultValue={isActive ? id : undefined}>
      <AccordionItem value={id} className="border-b">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isModuleCompleted 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {isModuleCompleted ? "✓" : module.order}
              </div>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{completedCount}/{lessons.length} уроков</span>
              <div className="h-2 w-20 rounded-full bg-gray-200">
                <div 
                  className="h-2 rounded-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-2 text-sm text-muted-foreground">
            {description}
          </div>
          <div className="space-y-2 pl-8">
            {lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              
              return (
                <Link 
                  key={lesson.id} 
                  href={`/courses/${courseId}/modules/${id}/lessons/${lesson.id}`}
                >
                  <div 
                    className={cn(
                      "flex items-center justify-between rounded-md p-2 transition-colors",
                      isCompleted 
                        ? "bg-green-50 hover:bg-green-100" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                          isCompleted 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {isCompleted ? "✓" : lesson.order}
                      </div>
                      <span className={cn(
                        "text-sm",
                        isCompleted && "font-medium"
                      )}>
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration} мин
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 