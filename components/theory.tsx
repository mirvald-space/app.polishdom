import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Markdown } from './markdown';
import PolishWord from './polish-word';

interface TheoryProps {
  content: string;
  onStartQuiz: () => void;
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  // Функция для обработки markdown контента и замены польских слов на компоненты
  const processContent = (content: string) => {
    // Разбиваем контент на части, сохраняя разделители
    const parts = content.split(/(\*\*.*?\*\*\s*\|[^|]*\|)/);
    
    return parts.map((part, index) => {
      // Проверяем, является ли часть польским словом с переводом
      const match = part.match(/\*\*(.*?)\*\*\s*\|\s*(.*?)\s*\|/);
      if (match) {
        const [, word, translation] = match;
        return <PolishWord key={index} word={word} translation={translation} />;
      }
      // Если это обычный текст, возвращаем его как есть
      return part;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Theory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none space-y-4">
          {processContent(content)}
        </div>
        <div className="flex justify-center mt-8">
          <Button onClick={onStartQuiz} size="lg" className="gap-2">
            Start Quiz <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 