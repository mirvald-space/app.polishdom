import { getCourseById } from "@/lib/data/mock-courses";
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