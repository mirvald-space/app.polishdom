import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Volume2, Loader2 } from "lucide-react";
import { Markdown } from './markdown';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom/client';

interface TheoryProps {
  content: string;
  onStartQuiz: () => void;
}

function AudioButton({ word }: { word: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = async () => {
    if (isLoading) return;

    if (audioUrl && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing cached audio:', error);
        toast.error("Failed to play audio");
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const data = await response.json();
      
      // Создаем Blob из base64 данных
      const audioData = atob(data.audioData);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        uint8Array[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([uint8Array], { type: data.contentType });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      
      // Создаем и загружаем аудио
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Ждем загрузки аудио
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
    } finally {
      setIsLoading(false);
    }
  };

  // Очищаем аудио при размонтировании
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center w-6 h-6 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </button>
  );
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contentRef.current || !mounted) return;

    // Находим все польские слова в тексте
    const strongElements = contentRef.current.querySelectorAll('strong');
    strongElements.forEach(strong => {
      const text = strong.textContent;
      if (!text) return;

      // Проверяем, является ли это польским словом (ищем следующий элемент em с переводом)
      const nextEm = strong.nextElementSibling as HTMLElement;
      if (nextEm?.tagName === 'EM') {
        // Создаем кнопку аудио
        const audioButton = document.createElement('span');
        audioButton.className = 'inline-flex mx-1';
        audioButton.id = `audio-button-${text}`;
        
        // Вставляем кнопку между словом и переводом
        strong.parentNode?.insertBefore(audioButton, nextEm);

        // Рендерим React компонент в созданный контейнер
        const root = ReactDOM.createRoot(audioButton);
        root.render(<AudioButton word={text} />);
      }
    });
  }, [mounted, content]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Theory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none" ref={contentRef}>
          <Markdown>{content}</Markdown>
        </div>
        <div className="flex justify-center mt-8">
          <Button onClick={onStartQuiz} size="lg" className="gap-2">
          Начать викторину <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 