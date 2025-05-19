import { CourseProgress } from "../schemas/lms";

// Моковые данные для прогресса обучения
const mockProgressData: Record<string, CourseProgress[]> = {
  // Прогресс для пользователя с ID "user-1"
  "user-1": [
    {
      courseId: "course-1",
      userId: "user-1",
      modulesProgress: [
        {
          moduleId: "module-1-1",
          lessonsProgress: [
            {
              lessonId: "lesson-1-1-1",
              completed: true,
              completedAt: new Date("2023-06-10T14:30:00Z"),
            },
            {
              lessonId: "lesson-1-1-2",
              completed: true,
              completedAt: new Date("2023-06-11T16:45:00Z"),
            },
            {
              lessonId: "lesson-1-1-3",
              completed: false,
              completedAt: undefined,
            },
          ],
          completed: false,
          completedAt: undefined,
        },
        {
          moduleId: "module-1-2",
          lessonsProgress: [
            {
              lessonId: "lesson-1-2-1",
              completed: false,
              completedAt: undefined,
            },
            {
              lessonId: "lesson-1-2-2",
              completed: false,
              completedAt: undefined,
            },
          ],
          completed: false,
          completedAt: undefined,
        },
      ],
      startedAt: new Date("2023-06-10T14:00:00Z"),
      completedAt: undefined,
      lastAccessedAt: new Date("2023-06-11T16:45:00Z"),
    },
  ],
  // Прогресс для пользователя с ID "user-2"
  "user-2": [
    {
      courseId: "course-2",
      userId: "user-2",
      modulesProgress: [
        {
          moduleId: "module-2-1",
          lessonsProgress: [
            {
              lessonId: "lesson-2-1-1",
              completed: true,
              completedAt: new Date("2023-07-05T10:15:00Z"),
            },
            {
              lessonId: "lesson-2-1-2",
              completed: false,
              completedAt: undefined,
            },
          ],
          completed: false,
          completedAt: undefined,
        },
      ],
      startedAt: new Date("2023-07-05T10:00:00Z"),
      completedAt: undefined,
      lastAccessedAt: new Date("2023-07-05T10:15:00Z"),
    },
  ],
};

// Функция для получения прогресса курса пользователя
export function getUserCourseProgress(userId: string, courseId: string): CourseProgress | undefined {
  const userProgress = mockProgressData[userId] || [];
  return userProgress.find(progress => progress.courseId === courseId);
}

// Функция для получения всех завершенных уроков пользователя для конкретного курса
export function getCompletedLessons(userId: string, courseId: string): string[] {
  const courseProgress = getUserCourseProgress(userId, courseId);
  
  if (!courseProgress) {
    return [];
  }
  
  const completedLessons: string[] = [];
  
  courseProgress.modulesProgress.forEach(moduleProgress => {
    moduleProgress.lessonsProgress.forEach(lessonProgress => {
      if (lessonProgress.completed) {
        completedLessons.push(lessonProgress.lessonId);
      }
    });
  });
  
  return completedLessons;
}

// Функция для обновления прогресса урока
export function updateLessonProgress(
  userId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  completed: boolean
): boolean {
  // Проверяем, есть ли прогресс для данного пользователя
  if (!mockProgressData[userId]) {
    mockProgressData[userId] = [];
  }
  
  // Проверяем, есть ли прогресс для данного курса
  let courseProgress = mockProgressData[userId].find(progress => progress.courseId === courseId);
  
  // Если нет, создаем новый прогресс курса
  if (!courseProgress) {
    courseProgress = {
      courseId,
      userId,
      modulesProgress: [],
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      completedAt: undefined,
    };
    mockProgressData[userId].push(courseProgress);
  }
  
  // Обновляем время последнего доступа
  courseProgress.lastAccessedAt = new Date();
  
  // Проверяем, есть ли прогресс для данного модуля
  let moduleProgress = courseProgress.modulesProgress.find(
    progress => progress.moduleId === moduleId
  );
  
  // Если нет, создаем новый прогресс модуля
  if (!moduleProgress) {
    moduleProgress = {
      moduleId,
      lessonsProgress: [],
      completed: false,
      completedAt: undefined,
    };
    courseProgress.modulesProgress.push(moduleProgress);
  }
  
  // Проверяем, есть ли прогресс для данного урока
  let lessonProgress = moduleProgress.lessonsProgress.find(
    progress => progress.lessonId === lessonId
  );
  
  // Если нет, создаем новый прогресс урока
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      completed: false,
      completedAt: undefined,
    };
    moduleProgress.lessonsProgress.push(lessonProgress);
  }
  
  // Обновляем статус завершения урока
  lessonProgress.completed = completed;
  lessonProgress.completedAt = completed ? new Date() : undefined;
  
  // Проверяем, все ли уроки модуля завершены
  const allLessonsCompleted = moduleProgress.lessonsProgress.every(
    progress => progress.completed
  );
  
  // Обновляем статус завершения модуля
  moduleProgress.completed = allLessonsCompleted;
  moduleProgress.completedAt = allLessonsCompleted ? new Date() : undefined;
  
  // Проверяем, все ли модули курса завершены
  const allModulesCompleted = courseProgress.modulesProgress.every(
    progress => progress.completed
  );
  
  // Обновляем статус завершения курса
  courseProgress.completedAt = allModulesCompleted ? new Date() : undefined;
  
  return true;
}

// Экспортируем моковые данные для тестирования
export { mockProgressData }; 