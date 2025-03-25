"use client";

import { useState } from "react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Quiz from "@/components/quiz";
import Theory from "@/components/theory";
import { Link } from "@/components/ui/link";
import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { VercelIcon, GitIcon } from "@/components/icons";

export default function ChatWithFiles() {
  const [topic, setTopic] = useState<string>("");
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>([]);
  const [theory, setTheory] = useState<string>("");
  const [title, setTitle] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setProgress(0);
    setTitle(`Polski Quiz: ${topic}`);
    setShowQuiz(false);

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
        <div className="w-full max-w-4xl h-full mt-12 px-4">
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
    <div className="min-h-[100dvh] w-full flex justify-center">
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <Loader2 className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Польский язык для русскоговорящих
            </CardTitle>
            <CardDescription>
              Интерактивные уроки польского языка с теорией и тестами
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Введите тему (например, 'Основные польские приветствия', 'Польские числа 1-10')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-1" />
                <p className="text-sm text-muted-foreground text-center">
                  Генерация контента... {progress}%
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !topic}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          Польский язык для русскоговорящих - Инструмент для изучения польского языка
        </div>
      </motion.div>
    </div>
  );
}
