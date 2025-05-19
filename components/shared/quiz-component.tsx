"use client";

import { useState } from "react";
import { Quiz, QuizQuestion } from "@/lib/schemas/lms";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizComponentProps {
  quiz: Quiz;
  lessonId: string;
  onComplete: () => void;
}

export function QuizComponent({ quiz, lessonId, onComplete }: QuizComponentProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSingleAnswer = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleMultipleAnswer = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    
    if (checked) {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, optionId],
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter(id => id !== optionId),
      });
    }
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers({
      ...answers,
      [questionId]: text,
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];

      if (!userAnswer) return;

      switch (question.type) {
        case "single":
          const selectedOption = question.options?.find(option => option.id === userAnswer);
          if (selectedOption?.isCorrect) {
            correctAnswers++;
          }
          break;
        case "multiple":
          const userAnswerArray = userAnswer as string[];
          const allCorrectOptions = question.options?.filter(option => option.isCorrect).map(option => option.id) || [];
          const allIncorrectOptions = question.options?.filter(option => !option.isCorrect).map(option => option.id) || [];
          
          // Проверяем, что выбраны все правильные и не выбраны неправильные
          const allCorrectSelected = allCorrectOptions.every(id => userAnswerArray.includes(id));
          const noIncorrectSelected = !allIncorrectOptions.some(id => userAnswerArray.includes(id));
          
          if (allCorrectSelected && noIncorrectSelected) {
            correctAnswers++;
          }
          break;
        case "text":
          // Простое сравнение для текстовых ответов
          if (typeof userAnswer === 'string' && 
              userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
            correctAnswers++;
          }
          break;
      }
    });

    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);
    
    return calculatedScore;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setShowResults(true);
    
    // Проверяем, пройден ли тест
    if (finalScore >= quiz.passingScore) {
      setIsCompleted(true);
      // Сохраняем в localStorage информацию о прохождении теста
      const completedQuizzes = JSON.parse(localStorage.getItem('completedQuizzes') || '{}');
      completedQuizzes[lessonId] = {
        completed: true,
        score: finalScore,
        date: new Date().toISOString()
      };
      localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
      
      toast.success(`Тест пройден! Ваш результат: ${finalScore}%`);
      onComplete();
    } else {
      toast.error(`Тест не пройден. Набрано ${finalScore}% из необходимых ${quiz.passingScore}%`);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const renderQuestion = (question: QuizQuestion) => {
    switch (question.type) {
      case "single":
        return (
          <RadioGroup
            value={answers[question.id] as string || ""}
            onValueChange={(value) => handleSingleAnswer(question.id, value)}
            className="space-y-2"
            disabled={showResults}
          >
            {question.options?.map((option) => (
              <div key={option.id} className={`flex items-center space-x-2 ${
                showResults && option.isCorrect ? "bg-green-100 p-2 rounded" : 
                showResults && answers[question.id] === option.id && !option.isCorrect ? "bg-red-100 p-2 rounded" : ""
              }`}>
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
                {showResults && option.isCorrect && (
                  <span className="text-green-600 text-sm ml-2">✓ Правильный ответ</span>
                )}
              </div>
            ))}
          </RadioGroup>
        );
      
      case "multiple":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className={`flex items-center space-x-2 ${
                showResults && option.isCorrect ? "bg-green-100 p-2 rounded" : 
                showResults && (answers[question.id] as string[] || []).includes(option.id) && !option.isCorrect ? "bg-red-100 p-2 rounded" : ""
              }`}>
                <Checkbox 
                  id={option.id} 
                  checked={(answers[question.id] as string[] || []).includes(option.id)}
                  onCheckedChange={(checked: boolean) => 
                    handleMultipleAnswer(question.id, option.id, checked)
                  }
                  disabled={showResults}
                />
                <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
                {showResults && option.isCorrect && (
                  <span className="text-green-600 text-sm ml-2">✓ Правильный ответ</span>
                )}
              </div>
            ))}
          </div>
        );
      
      case "text":
        return (
          <div>
            <Input
              value={(answers[question.id] as string) || ""}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
              className="mt-1"
              placeholder="Введите ответ"
              disabled={showResults}
            />
            {showResults && (
              <div className="mt-2">
                <span className="font-medium">Правильный ответ: </span>
                <span className="text-green-600">{question.correctAnswer}</span>
                {(answers[question.id] as string)?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim() && (
                  <span className="text-green-600 ml-2">✓ Верно</span>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-8 border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Тест для самопроверки</h2>
      
      {showResults && (
        <div className={`mb-6 p-4 rounded-md ${score >= quiz.passingScore ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold text-lg">
            {score >= quiz.passingScore ? 'Тест пройден! 🎉' : 'Тест не пройден'}
          </h3>
          <p className="mt-1">
            Ваш результат: <span className="font-bold">{score}%</span> 
            {score < quiz.passingScore && (
              <span> (необходимо набрать минимум {quiz.passingScore}%)</span>
            )}
          </p>
        </div>
      )}
      
      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="border-b pb-6 last:border-b-0">
            <h3 className="font-semibold text-lg mb-3">
              {index + 1}. {question.text}
            </h3>
            {renderQuestion(question)}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between">
        {showResults ? (
          <Button variant="outline" onClick={resetQuiz} disabled={isCompleted}>
            Пройти тест заново
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.questions.length}>
            Проверить ответы
          </Button>
        )}
      </div>
    </div>
  );
} 