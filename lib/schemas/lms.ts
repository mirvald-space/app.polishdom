import { z } from "zod";

// Схема для урока
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(), // в минутах
  order: z.number(),
  quiz: z.object({
    questions: z.array(z.object({
      id: z.string(),
      text: z.string(),
      type: z.enum(['single', 'multiple', 'text']),
      options: z.array(z.object({
        id: z.string(),
        text: z.string(),
        isCorrect: z.boolean(),
      })),
      correctAnswer: z.string().optional(),
    })),
    passingScore: z.number(),
  }).optional(),
});

// Схема для модуля
export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  lessons: z.array(LessonSchema),
});

// Схема для курса
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  modules: z.array(ModuleSchema),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Схема для прогресса по уроку
export const LessonProgressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
  completedAt: z.date().optional(),
});

// Схема для прогресса по модулю
export const ModuleProgressSchema = z.object({
  moduleId: z.string(),
  lessonsProgress: z.array(LessonProgressSchema),
  completed: z.boolean(),
  completedAt: z.date().optional(),
});

// Схема для прогресса по курсу
export const CourseProgressSchema = z.object({
  courseId: z.string(),
  userId: z.string(),
  modulesProgress: z.array(ModuleProgressSchema),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  lastAccessedAt: z.date(),
});

// Типы на основе схем
export type Lesson = z.infer<typeof LessonSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type ModuleProgress = z.infer<typeof ModuleProgressSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;

// Типы для тестов
export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options: QuizOption[];
  correctAnswer?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
} 