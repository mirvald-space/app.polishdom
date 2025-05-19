"use client";

import { createClient } from '@supabase/supabase-js';
import { Course, Module, Lesson } from './schemas/lms';
import type { Database } from './database.types';

// Инициализация клиента Supabase на стороне клиента
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Получить один курс с модулями и уроками
 */
export async function getCourseWithModules(courseId: string): Promise<Course | null> {
  // Получаем курс
  const { data: courseData, error: courseError } = await supabaseClient
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (courseError) {
    console.error(`Ошибка при получении курса ${courseId}:`, courseError);
    throw courseError;
  }
  
  if (!courseData) {
    return null;
  }
  
  // Получаем модули курса
  const { data: modulesData, error: modulesError } = await supabaseClient
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });
  
  if (modulesError) {
    console.error(`Ошибка при получении модулей для курса ${courseId}:`, modulesError);
    throw modulesError;
  }
  
  // Трансформируем данные модулей и получаем уроки для каждого модуля
  const modules: Module[] = await Promise.all(
    modulesData.map(async moduleData => {
      // Получаем уроки для текущего модуля
      const { data: lessonsData, error: lessonsError } = await supabaseClient
        .from('lessons')
        .select('*')
        .eq('module_id', moduleData.id)
        .order('order_number', { ascending: true });
      
      if (lessonsError) {
        console.error(`Ошибка при получении уроков для модуля ${moduleData.id}:`, lessonsError);
        throw lessonsError;
      }
      
      // Получаем тесты для каждого урока
      const lessons: Lesson[] = await Promise.all(
        lessonsData.map(async lessonData => {
          // Проверяем, есть ли тест для этого урока
          const { data: quizData, error: quizError } = await supabaseClient
            .from('quizzes')
            .select('*, quiz_questions(*)')
            .eq('lesson_id', lessonData.id)
            .single();
          
          if (quizError && quizError.code !== 'PGRST116') { // PGRST116 - Not Found
            console.error(`Ошибка при получении теста для урока ${lessonData.id}:`, quizError);
            throw quizError;
          }
          
          let quiz = undefined;
          
          if (quizData) {
            // Получаем вопросы теста с вариантами ответов
            const { data: questionsData, error: questionsError } = await supabaseClient
              .from('quiz_questions')
              .select('*, quiz_options(*)')
              .eq('quiz_id', quizData.id);
            
            if (questionsError) {
              console.error(`Ошибка при получении вопросов для теста ${quizData.id}:`, questionsError);
              throw questionsError;
            }
            
            // Трансформируем вопросы теста
            const questions = questionsData.map(questionData => {
              const options = questionData.quiz_options ? questionData.quiz_options.map((option: any) => ({
                id: option.id,
                text: option.text,
                isCorrect: option.is_correct
              })) : [];
              
              return {
                id: questionData.id,
                text: questionData.text,
                type: questionData.type,
                options: options,
                correctAnswer: questionData.correct_answer || undefined
              };
            });
            
            quiz = {
              questions: questions,
              passingScore: quizData.passing_score
            };
          }
          
          return {
            id: lessonData.id,
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: lessonData.video_url || undefined,
            duration: lessonData.duration || undefined,
            order: lessonData.order_number,
            quiz: quiz
          };
        })
      );
      
      return {
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order_number,
        lessons: lessons
      };
    })
  );
  
  // Собираем итоговый объект курса
  return {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    imageUrl: courseData.image_url || undefined,
    level: courseData.level,
    tags: courseData.tags || [],
    modules: modules,
    createdAt: new Date(courseData.created_at),
    updatedAt: new Date(courseData.updated_at)
  };
} 