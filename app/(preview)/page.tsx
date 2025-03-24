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
import { Link } from "@/components/ui/link";
import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { VercelIcon, GitIcon } from "@/components/icons";

export default function ChatWithFiles() {
  const [topic, setTopic] = useState<string>("");
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>([]);
  const [title, setTitle] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setProgress(0);
    setTitle(`Polski Quiz: ${topic}`);

    try {
      const formData = new FormData();
      formData.append("topic", topic);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      setQuestions(data);
      setProgress(100);
    } catch (error) {
      toast.error("Failed to generate quiz. Please try again.");
      setTopic("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearQuiz = () => {
    setTopic("");
    setQuestions([]);
  };

  if (questions.length === 4) {
    return (
      <Quiz title={title ?? "Quiz"} questions={questions} clearPDF={clearQuiz} />
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
              Polski Quiz Generator
            </CardTitle>
            <CardDescription className="text-base">
              Enter a topic to generate an interactive Polish language quiz for your students.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-primary-foreground rounded-md text-sm">
            <p className="font-medium mb-2">Topic Ideas for Polish Language Learning:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Basic Polish greetings (Dzień dobry, Do widzenia)</li>
              <li>Numbers in Polish (1-20)</li>
              <li>Days of the week (Dni tygodnia)</li>
              <li>Food vocabulary (Jedzenie)</li>
              <li>Family members (Rodzina)</li>
              <li>Polish case system introduction</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter a Polish language topic (e.g. Basic greetings, Numbers, Colors, Family members)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!topic}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Quiz...</span>
                </span>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="w-full space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isLoading ? "bg-yellow-500/50 animate-pulse" : "bg-muted"
                  }`}
                />
                <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                  {questions.length > 0 ? `Tworzenie pytania ${questions.length + 1} z 4` : "Generowanie pytań po polsku"}
                </span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      <motion.div
        className="flex flex-row gap-4 items-center justify-between fixed bottom-6 text-xs "
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex flex-row gap-2 items-center border px-2 py-1.5 rounded-md bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
          Polski Tutor - Narzędzie dla nauczycieli języka polskiego
        </div>
      </motion.div>
    </div>
  );
}
