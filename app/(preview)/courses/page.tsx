import { CourseList } from "@/components/shared/course-list";
import { getAllCourses } from "@/lib/db";

export const metadata = {
  title: "Курсы | PolishDOM LMS",
  description: "Список доступных курсов для изучения польского языка",
};

export const revalidate = 3600; // Ревалидация кэша каждый час

export default async function CoursesPage() {
  // Загружаем курсы из Supabase
  const courses = await getAllCourses();
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Доступные курсы</h1>
        <p className="text-muted-foreground">
          Выберите курс из списка доступных для начала обучения
        </p>
      </div>
      
      <CourseList courses={courses} />
    </div>
  );
} 