import { mockCourses } from "@/lib/data/mock-courses";
import { createApiResponse, formatErrorResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// GET /api/courses - получение списка всех курсов
export async function GET(req: NextRequest) {
  try {
    return createApiResponse({ courses: mockCourses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return formatErrorResponse(error, 500, "Ошибка при получении курсов");
  }
} 