"use client";

import React, { useState, useEffect } from "react";
import { Lesson, Quiz } from "@/lib/schemas/lms";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { QuizComponent } from "./quiz-component";

interface LessonContentProps {
  lesson: Lesson;
  onComplete: () => Promise<any>;
  isCompleted: boolean;
}

export function LessonContent({ lesson, onComplete, isCompleted }: LessonContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  useEffect(() => {
    // Проверяем, если тест уже пройден раньше
    if (lesson.quiz) {
      const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '{}');
      if (completedQuizzes[lesson.id] && completedQuizzes[lesson.id].completed) {
        setQuizCompleted(true);
      }
    }
  }, [lesson]);
  
  // Функция для отметки урока как завершенного
  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await onComplete();
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuizComplete = () => {
    setQuizCompleted(true);
    if (!isCompleted) {
      handleComplete();
    }
  };
  
  // Определяем, можно ли отметить урок как завершенный
  const canMarkAsCompleted = () => {
    // Если урок уже завершен, возвращаем false
    if (isCompleted) return false;
    
    // Если есть тест, он должен быть пройден
    if (lesson.quiz && !quizCompleted) return false;
    
    // Если есть видео, оно должно быть просмотрено
    if (lesson.videoUrl && !videoPlayed) return false;
    
    return true;
  };

  // Преобразуем quiz для соответствия типу Quiz, гарантируя наличие questions
  const normalizeQuiz = (quiz: any): Quiz | undefined => {
    if (!quiz) return undefined;
    if (!quiz.questions) return undefined;
    
    return {
      questions: quiz.questions,
      passingScore: quiz.passingScore
    };
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
      
      {/* Видео урока */}
      {lesson.videoUrl && (
        <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {!videoPlayed ? (
              <Button 
                onClick={() => setVideoPlayed(true)} 
                variant="default" 
                size="lg" 
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Смотреть видео
              </Button>
            ) : (
              <video 
                src={lesson.videoUrl} 
                controls 
                className="w-full h-full"
                onEnded={() => console.log("Видео завершено")}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Содержимое урока */}
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>
      
      {/* Тест для самопроверки */}
      {lesson.quiz && lesson.quiz.questions && (
        <QuizComponent 
          quiz={normalizeQuiz(lesson.quiz)!} 
          lessonId={lesson.id}
          onComplete={handleQuizComplete}
        />
      )}
      
      {/* Кнопка "Урок пройден" */}
      <div className="flex justify-end pt-4 border-t">
        {isCompleted ? (
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <CheckCircle className="h-4 w-4 text-green-600" />
            Урок пройден
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={isLoading || !canMarkAsCompleted()} 
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                Сохранение...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {lesson.quiz && !quizCompleted 
                  ? "Пройдите тест для завершения урока" 
                  : lesson.videoUrl && !videoPlayed 
                    ? "Посмотрите видео для завершения урока"
                    : "Отметить урок как пройденный"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 