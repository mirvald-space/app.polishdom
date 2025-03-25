import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
  Lightbulb,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import QuizScore from "./score";
import QuizReview from "./quiz-overview";
import { Question } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { 
  MultipleChoiceCard, 
  FillInBlankCard, 
  TrueFalseCard 
} from "./question-types";

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
};

export default function Quiz({
  questions,
  clearPDF,
  title = "Тест",
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
  const [fillInBlankAnswers, setFillInBlankAnswers] = useState<string[][]>(
    questions.map(q => q.type === 'fillInBlank' ? Array(q.context?.split('[BLANK]').length - 1 || 0).fill('') : [])
  );
  const [tfAnswers, setTfAnswers] = useState<(boolean | null)[]>(Array(questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isMuted) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [isMuted]);

  const playSound = (frequency: number, duration: number) => {
    if (!audioContextRef.current || isMuted) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const playCorrectSound = () => {
    playSound(880, 0.1); // A5 note
    setTimeout(() => playSound(1108.73, 0.1), 100); // C#6 note
  };

  const playIncorrectSound = () => {
    playSound(220, 0.2); // A3 note
    setTimeout(() => playSound(174.61, 0.2), 100); // F3 note
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (isSubmitted) return;
    
    setHasUsedHint(false);
    setShowHint(false);
    
  }, [currentQuestionIndex, isSubmitted]);

  // Multiple choice handler
  const handleSelectMultipleChoiceAnswer = (answer: string) => {
    if (!isSubmitted) {
      const newAnswers = [...mcAnswers];
      newAnswers[currentQuestionIndex] = answer;
      setMcAnswers(newAnswers);
      
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.type === 'multipleChoice' && answer === currentQuestion.answer) {
        setStreak(prev => prev + 1);
        playCorrectSound();
      } else {
        setStreak(0);
        playIncorrectSound();
      }
    }
  };

  // Fill in blank handler
  const handleUpdateFillInBlankAnswers = (answers: string[]) => {
    if (!isSubmitted) {
      const newAnswers = [...fillInBlankAnswers];
      newAnswers[currentQuestionIndex] = answers;
      setFillInBlankAnswers(newAnswers);
    }
  };

  // True/False handler
  const handleSelectTrueFalseAnswer = (answer: boolean) => {
    if (!isSubmitted) {
      const newAnswers = [...tfAnswers];
      newAnswers[currentQuestionIndex] = answer;
      setTfAnswers(newAnswers);
      
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.type === 'trueFalse' && answer === currentQuestion.answer) {
        setStreak(prev => prev + 1);
        playCorrectSound();
      } else {
        setStreak(0);
        playIncorrectSound();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswered = (questionIndex: number): boolean => {
    const question = questions[questionIndex];
    
    switch (question.type) {
      case 'multipleChoice':
        return mcAnswers[questionIndex] !== null;
      case 'fillInBlank':
        return fillInBlankAnswers[questionIndex].every(answer => answer.trim() !== '');
      case 'trueFalse':
        return tfAnswers[questionIndex] !== null;
      default:
        return false;
    }
  };
  
  const calculateScore = (): number => {
    return questions.reduce((acc, question, index) => {
      switch (question.type) {
        case 'multipleChoice':
          return acc + (question.answer === mcAnswers[index] ? 1 : 0);
        case 'fillInBlank':
          const allBlanksCorrect = question.blanks.every(
            (blank, blankIndex) => blank.toLowerCase() === fillInBlankAnswers[index][blankIndex].toLowerCase()
          );
          return acc + (allBlanksCorrect ? 1 : 0);
        case 'trueFalse':
          return acc + (question.answer === tfAnswers[index] ? 1 : 0);
        default:
          return acc;
      }
    }, 0);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctAnswers = calculateScore();
    setScore(correctAnswers);
  };

  const handleReset = () => {
    setMcAnswers(Array(questions.length).fill(null));
    setFillInBlankAnswers(
      questions.map(q => q.type === 'fillInBlank' ? Array(q.context?.split('[BLANK]').length - 1 || 0).fill('') : [])
    );
    setTfAnswers(Array(questions.length).fill(null));
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setProgress(0);
    setStreak(0);
    setHasUsedHint(false);
    setShowHint(false);
  };

  const handleHint = () => {
    setHasUsedHint(true);
    setShowHint(true);
    toast.info(questions[currentQuestionIndex].hint || "No hint available");
  };

  const currentQuestion = questions[currentQuestionIndex];

  const getMessage = () => {
    if (!score) return "Продолжайте практиковаться, у вас всё получится!"
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Отличный результат! Поздравляем!"
    if (percentage >= 80) return "Отлично! Вы справились на отлично!"
    if (percentage >= 60) return "Хорошая работа! Вы на правильном пути."
    if (percentage >= 40) return "Неплохо, но есть куда стремиться."
    return "Продолжайте практиковаться, у вас всё получится!"
  }

  const renderQuestionCard = () => {
    const question = questions[currentQuestionIndex];
    
    switch (question.type) {
      case 'multipleChoice':
        return (
          <MultipleChoiceCard
            question={question}
            selectedAnswer={mcAnswers[currentQuestionIndex]}
            onSelectAnswer={handleSelectMultipleChoiceAnswer}
            showCorrectAnswer={false}
            timeLeft={0}
            onHint={handleHint}
            hasUsedHint={hasUsedHint}
            streak={streak}
            isMuted={isMuted}
            onToggleSound={() => setIsMuted(!isMuted)}
          />
        );
      case 'fillInBlank':
        return (
          <FillInBlankCard
            question={question}
            answers={fillInBlankAnswers[currentQuestionIndex]}
            onUpdateAnswers={handleUpdateFillInBlankAnswers}
            showCorrectAnswer={false}
            timeLeft={0}
            onHint={handleHint}
            hasUsedHint={hasUsedHint}
            streak={streak}
            isMuted={isMuted}
            onToggleSound={() => setIsMuted(!isMuted)}
          />
        );
      case 'trueFalse':
        return (
          <TrueFalseCard
            question={question}
            selectedAnswer={tfAnswers[currentQuestionIndex]}
            onSelectAnswer={handleSelectTrueFalseAnswer}
            showCorrectAnswer={false}
            timeLeft={0}
            onHint={handleHint}
            hasUsedHint={hasUsedHint}
            streak={streak}
            isMuted={isMuted}
            onToggleSound={() => setIsMuted(!isMuted)}
          />
        );
      default:
        return <div>Неподдерживаемый тип вопроса</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          {title}
        </h1>
        <div className="text-center mb-6 text-muted-foreground">
          <p>Проверьте свои знания польского языка с помощью этого интерактивного теста!</p>
        </div>
        <div className="relative">
          {!isSubmitted && <Progress value={progress} className="h-1 mb-8" />}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSubmitted ? "results" : currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {!isSubmitted ? (
                  <div className="space-y-8">
                    {renderQuestionCard()}
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        variant="ghost"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Предыдущий
                      </Button>
                      <span className="text-sm font-medium">
                        {currentQuestionIndex + 1} / {questions.length}
                      </span>
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered(currentQuestionIndex)}
                        variant="ghost"
                      >
                        {currentQuestionIndex === questions.length - 1
                          ? "Завершить"
                          : "Следующий"}{" "}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <QuizScore
                      correctAnswers={score ?? 0}
                      totalQuestions={questions.length}
                    />
                    <div className="space-y-12">
                      <QuizReview questions={questions} userAnswers={{
                        multipleChoice: mcAnswers,
                        fillInBlank: fillInBlankAnswers,
                        trueFalse: tfAnswers
                      }} />
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="bg-muted hover:bg-muted/80 w-full"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Повторить тест
                      </Button>
                      <Button
                        onClick={clearPDF}
                        className="bg-primary hover:bg-primary/90 w-full"
                      >
                        <FileText className="mr-2 h-4 w-4" /> Новый тест
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
