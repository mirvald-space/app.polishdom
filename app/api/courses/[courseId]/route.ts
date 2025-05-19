import { getCourseById } from "@/lib/db";
import { createApiResponse, formatErrorResponse } from "@/lib/utils";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase-client";

// GET /api/courses/[courseId] - получение информации о конкретном курсе
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await getCourseById(courseId);

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
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await getCourseById(courseId);

    if (!course) {
      return formatErrorResponse(
        new Error(`Course with id ${courseId} not found`),
        404,
        "Курс не найден"
      );
    }

    const updatedCourseData = await req.json();

    // Обновляем только разрешенные поля курса
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        title: updatedCourseData.title || course.title,
        description: updatedCourseData.description || course.description,
        level: updatedCourseData.level || course.level,
        tags: updatedCourseData.tags || course.tags,
        image_url: updatedCourseData.imageUrl || course.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // Если есть модули для обновления
    if (updatedCourseData.modules && Array.isArray(updatedCourseData.modules)) {
      // Обновляем каждый модуль
      for (const module of updatedCourseData.modules) {
        if (module.id) {
          // Обновляем существующий модуль
          const { error: moduleError } = await supabase
            .from('modules')
            .update({
              title: module.title,
              description: module.description,
              order_number: module.order,
              updated_at: new Date().toISOString()
            })
            .eq('id', module.id)
            .eq('course_id', courseId);
          
          if (moduleError) {
            throw moduleError;
          }
          
          // Обновляем уроки модуля
          if (module.lessons && Array.isArray(module.lessons)) {
            for (const lesson of module.lessons) {
              if (lesson.id) {
                // Обновляем существующий урок
                const { error: lessonError } = await supabase
                  .from('lessons')
                  .update({
                    title: lesson.title,
                    content: lesson.content,
                    video_url: lesson.videoUrl,
                    duration: lesson.duration,
                    order_number: lesson.order,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', lesson.id)
                  .eq('module_id', module.id);
                
                if (lessonError) {
                  throw lessonError;
                }
              } else {
                // Создаем новый урок
                const { error: lessonError } = await supabase
                  .from('lessons')
                  .insert({
                    module_id: module.id,
                    title: lesson.title,
                    content: lesson.content,
                    video_url: lesson.videoUrl,
                    duration: lesson.duration,
                    order_number: lesson.order
                  });
                
                if (lessonError) {
                  throw lessonError;
                }
              }
            }
          }
        } else {
          // Создаем новый модуль
          const { data: newModule, error: moduleError } = await supabase
            .from('modules')
            .insert({
              course_id: courseId,
              title: module.title,
              description: module.description,
              order_number: module.order
            })
            .select()
            .single();
          
          if (moduleError) {
            throw moduleError;
          }
          
          // Создаем уроки для нового модуля
          if (module.lessons && Array.isArray(module.lessons)) {
            for (const lesson of module.lessons) {
              const { error: lessonError } = await supabase
                .from('lessons')
                .insert({
                  module_id: newModule.id,
                  title: lesson.title,
                  content: lesson.content,
                  video_url: lesson.videoUrl,
                  duration: lesson.duration,
                  order_number: lesson.order
                });
              
              if (lessonError) {
                throw lessonError;
              }
            }
          }
        }
      }
    }

    return createApiResponse({ 
      course: updatedCourse,
      message: "Курс успешно обновлен" 
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return formatErrorResponse(error, 500, "Ошибка при обновлении курса");
  }
} 