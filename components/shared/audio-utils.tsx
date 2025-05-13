"use client";

import { useState, useEffect, useRef } from 'react';
import { FaVolumeHigh, FaSpinner } from "react-icons/fa6";
import { toast } from 'sonner';
import { createBlobFromBase64 } from '@/lib/utils';

/**
 * Хук для создания и управления экземпляром Audio
 * @param url - URL аудиофайла или null
 * @returns - Методы управления аудио и состояние проигрывания
 */
export function useAudio(url: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;

    // Создаем новый Audio элемент
    audioRef.current = new Audio(url);
    
    // Добавляем обработчики событий
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      toast.error('Ошибка воспроизведения аудио');
    };

    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError as EventListener);

    // Очистка при размонтировании
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError as EventListener);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  const play = async () => {
    if (!audioRef.current || !url) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast.error('Ошибка воспроизведения аудио');
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const toggle = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  return {
    isPlaying,
    play,
    pause,
    toggle,
    audio: audioRef.current
  };
}

/**
 * Компонент кнопки воспроизведения аудио
 */
interface AudioButtonProps {
  audioUrl?: string;
  word?: string;
  className?: string;
}

export function AudioButton({ audioUrl, word, className = "" }: AudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(audioUrl || null);
  const { isPlaying, toggle } = useAudio(url);

  // Генерация аудио по тексту, если не передан URL
  const generateAndPlayAudio = async () => {
    if (!word || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const data = await response.json();
      const { url } = createBlobFromBase64(data.audioData, data.contentType);
      setUrl(url);
      
      // Дождемся следующего рендера для обновления хука
      setTimeout(() => {
        toggle();
      }, 100);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Не удалось сгенерировать аудио");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (url) {
      toggle();
    } else if (word) {
      await generateAndPlayAudio();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {isLoading ? (
        <FaSpinner className="h-3 w-3 animate-spin" />
      ) : (
        <FaVolumeHigh className="h-3 w-3" />
      )}
    </button>
  );
}

/**
 * Хук для создания аудио из base64 данных
 * @param base64Data - Base64 закодированные аудиоданные
 * @param contentType - MIME-тип аудио
 * @returns - URL для воспроизведения аудио и функции управления
 */
export function useBase64Audio(base64Data: string | null, contentType: string = 'audio/mpeg') {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!base64Data) return;
    
    try {
      const { url } = createBlobFromBase64(base64Data, contentType);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error creating audio from base64:', error);
    }
  }, [base64Data, contentType]);
  
  const audioControls = useAudio(audioUrl);
  
  return {
    audioUrl,
    ...audioControls
  };
} 