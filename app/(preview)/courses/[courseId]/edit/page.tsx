import { CourseEditForm } from "@/components/shared/course-edit-form";
import { CourseContentEditor } from "@/components/shared/course-content-editor";
import { getCourseById } from "@/lib/data/mock-courses";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourseEditPageProps {
  params: {
    courseId: string
  }
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = params;
  const course = getCourseById(courseId);
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Редактирование курса</h1>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Основная информация</TabsTrigger>
          <TabsTrigger value="content">Модули и уроки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <CourseEditForm course={course} />
        </TabsContent>
        
        <TabsContent value="content">
          <CourseContentEditor course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 