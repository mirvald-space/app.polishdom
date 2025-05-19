import { getCompletedLessons, updateLessonProgress } from "@/lib/data/mock-progress";
import { createApiResponse, formatErrorResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/progress?userId=xxx&courseId=yyy - получение прогресса пользователя по курсу
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const courseId = url.searchParams.get("courseId");

    if (!userId || !courseId) {
      return formatErrorResponse(
        new Error("Missing required parameters"),
        400,
        "Отсутствуют обязательные параметры: userId и courseId"
      );
    }

    const completedLessons = getCompletedLessons(userId, courseId);
    return createApiResponse({ completedLessons });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return formatErrorResponse(error, 500, "Ошибка при получении прогресса");
  }
}

// POST /api/progress - обновление прогресса пользователя
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, courseId, moduleId, lessonId, completed } = body;

    if (!userId || !courseId || !moduleId || !lessonId || completed === undefined) {
      return formatErrorResponse(
        new Error("Missing required parameters"),
        400,
        "Отсутствуют обязательные параметры"
      );
    }

    const result = updateLessonProgress(userId, courseId, moduleId, lessonId, completed);

    if (!result) {
      return formatErrorResponse(
        new Error("Failed to update lesson progress"),
        500,
        "Не удалось обновить прогресс урока"
      );
    }

    const completedLessons = getCompletedLessons(userId, courseId);
    return createApiResponse({ success: true, completedLessons });
  } catch (error) {
    console.error("Error updating progress:", error);
    return formatErrorResponse(error, 500, "Ошибка при обновлении прогресса");
  }
} 