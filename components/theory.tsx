import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Volume2 } from "lucide-react";
import { Markdown } from './markdown';
import { toast } from "sonner";

interface TheoryProps {
  content: string;
  onStartQuiz: () => void;
}

interface AudioState {
  [key: string]: string | null;
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  const [audioStates, setAudioStates] = useState<AudioState>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const generateAudio = async (text: string) => {
    if (audioStates[text] || isLoading[text]) return;

    setIsLoading(prev => ({ ...prev, [text]: true }));
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      setAudioStates(prev => ({ ...prev, [text]: data.audioUrl }));
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Failed to generate audio");
    } finally {
      setIsLoading(prev => ({ ...prev, [text]: false }));
    }
  };

  // Функция для обработки клика по словам
  const handleWordClick = (text: string) => {
    generateAudio(text);
  };

  // Функция для обработки markdown контента и добавления аудио-кнопок
  const processContent = (content: string) => {
    // Добавляем аудио-кнопки к польским словам (между **)
    return content.replace(/\*\*(.*?)\*\*/g, (match, word) => {
      return `**${word}** <button class="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onclick="window.handleWordClick('${word}')">
        ${isLoading[word] ? 
          '<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>' :
          '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>'
        }
      </button>`;
    });
  };

  // Добавляем обработчик клика в window для работы с markdown
  useEffect(() => {
    (window as any).handleWordClick = handleWordClick;
    return () => {
      delete (window as any).handleWordClick;
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Theory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <Markdown>{processContent(content)}</Markdown>
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