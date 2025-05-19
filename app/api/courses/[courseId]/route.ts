import { getCourseById, mockCourses } from "@/lib/data/mock-courses";
import { createApiResponse, formatErrorResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/courses/[courseId] - получение информации о конкретном курсе
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const course = getCourseById(courseId);

    if (!course) {
      return formatErrorResponse(
        new Error(`Course with id ${courseId} not found`),
        404,
        "Курс не найден"
      );
    }

    return createApiResponse({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return formatErrorResponse(error, 500, "Ошибка при получении курса");
  }
}

// PUT /api/courses/[courseId] - обновление информации о курсе
export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const courseIndex = mockCourses.findIndex(course => course.id === courseId);

    if (courseIndex === -1) {
      return formatErrorResponse(
        new Error(`Course with id ${courseId} not found`),
        404,
        "Курс не найден"
      );
    }

    const updatedCourseData = await req.json();

    // Обновляем только разрешенные поля
    mockCourses[courseIndex] = {
      ...mockCourses[courseIndex],
      title: updatedCourseData.title || mockCourses[courseIndex].title,
      description: updatedCourseData.description || mockCourses[courseIndex].description,
      level: updatedCourseData.level || mockCourses[courseIndex].level,
      tags: updatedCourseData.tags || mockCourses[courseIndex].tags,
      imageUrl: updatedCourseData.imageUrl || mockCourses[courseIndex].imageUrl,
      // Если передана структура модулей, обновляем и ее
      ...(updatedCourseData.modules && { modules: updatedCourseData.modules }),
      updatedAt: new Date(),
    };

    return createApiResponse({ 
      course: mockCourses[courseIndex],
      message: "Курс успешно обновлен" 
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return formatErrorResponse(error, 500, "Ошибка при обновлении курса");
  }
} 