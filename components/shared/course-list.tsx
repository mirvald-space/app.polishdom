"use client";

import { Course } from "@/lib/schemas/lms";
import { CourseCard } from "./course-card";

interface CourseListProps {
  courses: Course[];
  emptyMessage?: string;
}

export function CourseList({ courses, emptyMessage = "Курсы не найдены" }: CourseListProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
} 