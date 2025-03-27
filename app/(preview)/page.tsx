"use client";

import { useState } from "react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa6";
import { FaSchoolFlag } from "react-icons/fa6";
import { FaLightbulb } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Quiz from "@/components/quiz";
import Theory from "@/components/theory";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatWithFiles() {
  const [topic, setTopic] = useState<string>("");
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>([]);
  const [theory, setTheory] = useState<string>("");
  const [title, setTitle] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const learningStructure = [
    { grammar: "Местоимения", topics: ["Знакомство", "Семья", "Друзья", "Личные данные", "Представление"] },
    { grammar: "Настоящее время", topics: ["Хобби", "Повседневные ситуации", "Распорядок дня", "Рабочие обязанности", "Свободное время"] },
    { grammar: "Множественное число", topics: ["Дом", "Еда", "Животные", "Школьные предметы", "Рабочие инструменты", "Одежда"] },
    { grammar: "Именительный падеж", topics: ["Профессии", "Внешность", "Характер", "Национальности", "Учебные заведения"] },
    { grammar: "Винительный падеж", topics: ["Покупки", "Еда", "Одежда", "Сувениры", "Заказ в ресторане", "Транспорт"] },
    { grammar: "Родительный падеж", topics: ["Семья", "Владение", "Даты", "Отрицание", "Количество"] },
    { grammar: "Творительный падеж", topics: ["Транспорт", "Инструменты", "Совместные действия", "Хобби", "Профессиональные навыки"] },
    { grammar: "Дательный падеж", topics: ["Подарки", "Обращения", "Комплименты", "Поздравления", "Возраст"] },
    { grammar: "Предложный падеж", topics: ["Местоположение", "Город", "Страны", "Путешествия", "Рабочее место", "Учёба"] },
    { grammar: "Предлоги", topics: ["Ориентация в пространстве", "Направления", "Время", "Местоположение", "Движение"] },
    { grammar: "Прошедшее время", topics: ["Путешествия", "Опыт", "История", "Биография", "Детство", "Важные события"] },
    { grammar: "Будущее время", topics: ["Планы", "Прогнозы", "Мечты", "Карьера", "Цели", "Путешествия"] },
    { grammar: "Виды глаголов", topics: ["Привычки", "События", "Процессы", "Результаты", "Достижения"] },
    { grammar: "Степени сравнения", topics: ["Погода", "Предпочтения", "Сравнение стран", "Города", "Рейтинги", "Качества людей"] },
    { grammar: "Сослагательное наклонение", topics: ["Желания", "Возможности", "Гипотезы", "Советы", "Условия"] },
    { grammar: "Повелительное наклонение", topics: ["Рецепты", "Инструкции", "Советы", "Правила", "Просьбы", "Команды"] },
    { grammar: "Парафраз", topics: ["Культура", "Искусство", "Новости", "Пересказ текстов", "Интерпретация", "Обобщение"] },
    { grammar: "Числительные", topics: ["Счёт", "Возраст", "Цены", "Даты", "Время", "Телефонные номера"] },
    { grammar: "Прилагательные", topics: ["Описание людей", "Описание мест", "Эмоции", "Качества предметов", "Цвета"] },
    { grammar: "Наречия", topics: ["Качество действий", "Частота", "Время", "Способы передвижения", "Интенсивность"] },
  ];

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setProgress(0);
    setTitle(`Освоение теории: ${topic}`);
    setShowQuiz(false);
    setShowSuggestions(false);

    try {
      // Generate theory first
      const theoryFormData = new FormData();
      theoryFormData.append("topic", topic);

      const theoryResponse = await fetch("/api/generate-theory", {
        method: "POST",
        body: theoryFormData,
      });

      if (!theoryResponse.ok) {
        throw new Error("Failed to generate theory");
      }

      const theoryData = await theoryResponse.json();
      setTheory(theoryData.content);
      setProgress(50);

      // Then generate quiz based on the theory content
      const quizFormData = new FormData();
      quizFormData.append("topic", topic);
      quizFormData.append("theory", theoryData.content);

      const quizResponse = await fetch("/api/generate-quiz", {
        method: "POST",
        body: quizFormData,
      });

      if (!quizResponse.ok) {
        throw new Error("Failed to generate quiz");
      }

      const quizData = await quizResponse.json();
      setQuestions(quizData);
      setProgress(100);
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
      setTopic("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearQuiz = () => {
    setTopic("");
    setQuestions([]);
    setTheory("");
    setShowQuiz(false);
  };

  if (questions.length === 4 && theory) {
    return (
      <div className="min-h-[100dvh] w-full flex justify-center">
        <div className="w-full max-w-3xl h-full">
          <AnimatePresence mode="wait">
            {!showQuiz ? (
              <motion.div
                key="theory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Theory content={theory} onStartQuiz={() => setShowQuiz(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Quiz title={title ?? "Quiz"} questions={questions} clearPDF={clearQuiz} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex justify-center items-center bg-[#FAFAFA]">
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-2xl bg-primary/5 p-2">
              <FaSchoolFlag className="h-6 w-6 text-[#BB4A3D]" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Польский язык
            </CardTitle>
            <CardDescription>
              Создавай интерактивные уроки польского языка с теорией и тестами, напиши тему и создай урок
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Введите тему (например, 'Основные польские приветствия', 'Польские числа 1-10')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  disabled={isLoading}
                  className="rounded-2xl pr-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        type="button" 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                      >
                        <FaLightbulb className="h-4 w-4 text-amber-500" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Показать рекомендуемые темы</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-md border p-2 bg-white shadow-sm max-h-80 overflow-y-auto"
              >
                <div className="mb-2 px-2 py-1 bg-slate-50 rounded text-sm font-medium">
                  Рекомендуемая структура изучения:
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {learningStructure.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-sm py-2 hover:no-underline">
                        <span className="font-medium">{item.grammar}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-1 py-1">
                          {item.topics.map((topicItem, topicIndex) => (
                            <button
                              key={topicIndex}
                              type="button"
                              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                              onClick={() => handleTopicClick(`${item.grammar}: ${topicItem}`)}
                            >
                              {topicItem}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            )}
            
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-1 " />
                <p className="text-sm text-muted-foreground text-center">
                  Генерация контента подождите... {progress}%
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#BB4A3D] rounded-2xl"
              disabled={isLoading || !topic}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Генерация...
                </>
              ) : (
                "Создать урок"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <motion.div
        className="flex flex-row gap-4 items-center justify-between fixed bottom-6 text-xs "
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-row gap-2 items-center border px-2 py-1.5 rounded-md bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
          ❤️ С любовью от<Link href="http://mirvald.space">mirvald.space</Link>
        </div>
      </motion.div>
    </div>
  );
}
