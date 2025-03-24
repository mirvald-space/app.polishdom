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
  Timer,
  Lightbulb,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import QuizScore from "./score";
import QuizReview from "./quiz-overview";
import { Question } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
};

const QuestionCard: React.FC<{
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isSubmitted: boolean;
  showCorrectAnswer: boolean;
  timeLeft: number;
  onHint: () => void;
  hasUsedHint: boolean;
  streak: number;
  isMuted: boolean;
  onToggleSound: () => void;
}> = ({ 
  question, 
  selectedAnswer, 
  onSelectAnswer, 
  showCorrectAnswer,
  timeLeft,
  onHint,
  hasUsedHint,
  streak,
  isMuted,
  onToggleSound
}) => {
  const answerLabels = ["A", "B", "C", "D"];
  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={difficultyColors[question.difficulty]}>
            {question.difficulty === 'easy' ? 'Легкий' : question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </Badge>
          {streak > 0 && (
            <Badge variant="secondary" className="bg-purple-500">
              <Trophy className="w-3 h-3 mr-1" />
              {streak}x
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSound}>
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span>{timeLeft}с</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold leading-tight">
          {question.question}
        </h2>
        {question.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              className="object-cover w-full h-full"
              fill
              priority
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={{ 
              scale: showCorrectAnswer && answerLabels[index] === question.answer ? 1.05 : 1,
              backgroundColor: showCorrectAnswer && answerLabels[index] === question.answer ? "rgb(34 197 94)" : 
                             showCorrectAnswer && selectedAnswer === answerLabels[index] && selectedAnswer !== question.answer ? "rgb(239 68 68)" : 
                             selectedAnswer === answerLabels[index] ? "hsl(var(--secondary))" : "transparent"
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant={selectedAnswer === answerLabels[index] ? "secondary" : "outline"}
              className={`h-auto py-6 px-4 justify-start text-left whitespace-normal w-full ${
                showCorrectAnswer && answerLabels[index] === question.answer
                  ? "bg-green-600 hover:bg-green-700"
                  : showCorrectAnswer &&
                      selectedAnswer === answerLabels[index] &&
                      selectedAnswer !== question.answer
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }`}
              onClick={() => onSelectAnswer(answerLabels[index])}
            >
              <span className="text-lg font-medium mr-4 shrink-0">
                {answerLabels[index]}
              </span>
              <span className="flex-grow">{option}</span>
              {(showCorrectAnswer && answerLabels[index] === question.answer) ||
                (selectedAnswer === answerLabels[index] && (
                  <Check className="ml-2 shrink-0 text-white" size={20} />
                ))}
              {showCorrectAnswer &&
                selectedAnswer === answerLabels[index] &&
                selectedAnswer !== question.answer && (
                  <X className="ml-2 shrink-0 text-white" size={20} />
                )}
            </Button>
          </motion.div>
        ))}
      </div>
      {question.hint && !hasUsedHint && !showCorrectAnswer && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onHint}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Подсказка
        </Button>
      )}
    </div>
  );
};

export default function Quiz({
  questions,
  clearPDF,
  title = "Тест",
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
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
    
    setTimeLeft(questions[currentQuestionIndex].timeLimit || 30);
    setHasUsedHint(false);
    setShowHint(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, isSubmitted]);

  const handleSelectAnswer = (answer: string) => {
    if (!isSubmitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);
      
      if (answer === questions[currentQuestionIndex].answer) {
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

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (question.answer === answers[index] ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
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
    if (score === 100) return "Отличный результат! Поздравляем!"
    if (score >= 80) return "Отлично! Вы справились на отлично!"
    if (score >= 60) return "Хорошая работа! Вы на правильном пути."
    if (score >= 40) return "Неплохо, но есть куда стремиться."
    return "Продолжайте практиковаться, у вас всё получится!"
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
          {title}
        </h1>
        <div className="text-center mb-6 text-muted-foreground">
          <p>Практикуйте польский язык с помощью этого интерактивного теста!</p>
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
                    <QuestionCard
                      question={currentQuestion}
                      selectedAnswer={answers[currentQuestionIndex]}
                      onSelectAnswer={handleSelectAnswer}
                      isSubmitted={isSubmitted}
                      showCorrectAnswer={false}
                      timeLeft={timeLeft}
                      onHint={handleHint}
                      hasUsedHint={hasUsedHint}
                      streak={streak}
                      isMuted={isMuted}
                      onToggleSound={() => setIsMuted(!isMuted)}
                    />
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
                        disabled={answers[currentQuestionIndex] === null}
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
                      <QuizReview questions={questions} userAnswers={answers} />
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
