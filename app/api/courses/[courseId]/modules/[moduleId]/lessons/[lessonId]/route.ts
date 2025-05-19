import { getLessonById, mockCourses } from "@/lib/data/mock-courses";
import { createApiResponse, formatErrorResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    const { courseId, moduleId, lessonId } = params;
    const lesson = getLessonById(courseId, moduleId, lessonId);

    if (!lesson) {
      return formatErrorResponse(
        new Error(`Lesson with id ${lessonId} not found`),
        404,
        "Урок не найден"
      );
    }

    return createApiResponse({ lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return formatErrorResponse(error, 500, "Ошибка при получении урока");
  }
}

// PUT /api/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]
export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; moduleId: string; lessonId: string } }
) {
  try {
    const { courseId, moduleId, lessonId } = params;
    
    // Находим курс
    const courseIndex = mockCourses.findIndex(course => course.id === courseId);
    
    if (courseIndex === -1) {
      return formatErrorResponse(
        new Error(`Course with id ${courseId} not found`),
        404,
        "Курс не найден"
      );
    }
    
    // Находим модуль
    const moduleIndex = mockCourses[courseIndex].modules.findIndex(
      module => module.id === moduleId
    );
    
    if (moduleIndex === -1) {
      return formatErrorResponse(
        new Error(`Module with id ${moduleId} not found`),
        404,
        "Модуль не найден"
      );
    }
    
    // Находим урок
    const lessonIndex = mockCourses[courseIndex].modules[moduleIndex].lessons.findIndex(
      lesson => lesson.id === lessonId
    );
    
    if (lessonIndex === -1) {
      return formatErrorResponse(
        new Error(`Lesson with id ${lessonId} not found`),
        404,
        "Урок не найден"
      );
    }
    
    // Получаем данные для обновления
    const updatedLessonData = await req.json();
    
    // Обновляем урок
    mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex] = {
      ...mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex],
      title: updatedLessonData.title || mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex].title,
      content: updatedLessonData.content || mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex].content,
      videoUrl: updatedLessonData.videoUrl || mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex].videoUrl,
      duration: updatedLessonData.duration !== undefined 
        ? updatedLessonData.duration 
        : mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex].duration,
      // Если передана структура теста, обновляем и ее
      ...(updatedLessonData.quiz && { quiz: updatedLessonData.quiz }),
    };
    
    return createApiResponse({ 
      lesson: mockCourses[courseIndex].modules[moduleIndex].lessons[lessonIndex],
      message: "Урок успешно обновлен" 
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return formatErrorResponse(error, 500, "Ошибка при обновлении урока");
  }
} 