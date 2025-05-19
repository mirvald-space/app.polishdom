import { supabase } from './supabase-client';
import { Course, Module, Lesson } from './schemas/lms';
import type { Database } from './database.types';

// Временная переменная с URL и ключом Supabase (обычно должны быть в .env)
const SUPABASE_URL = 'https://ocuahynnjsixrukpaazu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdWFoeW5uanNpeHJ1a3BhYXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Njc1ODYsImV4cCI6MjA2MzI0MzU4Nn0.eHn6I4it99FwULlv6ZX7jYSRbRYYbX11CjdhkGozXU4';

// Инициализация клиента Supabase
import { createClient } from '@supabase/supabase-js';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==== API для работы с курсами ====

/**
 * Получить все курсы
 */
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Ошибка при получении курсов:', error);
    throw error;
  }
  
  // Преобразуем данные в формат, соответствующий схеме Course
  return data.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.image_url || undefined,
    level: course.level,
    tags: course.tags || [],
    modules: [], // Пустой массив модулей, так как мы их не загружаем
    createdAt: new Date(course.created_at),
    updatedAt: new Date(course.updated_at)
  }));
}

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

/**
 * Получить курс по ID
 */
export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Ошибка при получении курса с ID ${id}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Получить модули курса
 */
export async function getCourseModules(courseId: string) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });
  
  if (error) {
    console.error(`Ошибка при получении модулей для курса ${courseId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Получить уроки модуля
 */
export async function getModuleLessons(moduleId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_number', { ascending: true });
  
  if (error) {
    console.error(`Ошибка при получении уроков для модуля ${moduleId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Получить урок по ID с информацией о курсе и модуле
 */
export async function getLessonById(courseId: string, moduleId: string, lessonId: string) {
  // Получаем урок
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .single();
  
  if (lessonError) {
    console.error(`Ошибка при получении урока ${lessonId}:`, lessonError);
    throw lessonError;
  }
  
  // Получаем модуль
  const { data: module, error: moduleError } = await supabase
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .eq('course_id', courseId)
    .single();
  
  if (moduleError) {
    console.error(`Ошибка при получении модуля ${moduleId}:`, moduleError);
    throw moduleError;
  }
  
  // Получаем курс
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (courseError) {
    console.error(`Ошибка при получении курса ${courseId}:`, courseError);
    throw courseError;
  }
  
  return {
    lesson,
    module,
    course
  };
} 