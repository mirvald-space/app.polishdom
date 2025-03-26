"use client";

import { useState } from "react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa6";
import { FaSchoolFlag } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Quiz from "@/components/quiz";
import Theory from "@/components/theory";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

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
    setTitle(`Освоение теории: ${topic}`);
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
    <div className="min-h-[100dvh] w-full flex justify-center">
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
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
              <Input
                placeholder="Введите тему (например, 'Основные польские приветствия', 'Польские числа 1-10')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="rounded-2xl"
              />
            </div>
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
