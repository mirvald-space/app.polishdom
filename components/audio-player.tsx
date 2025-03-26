import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FaVolumeHigh, FaVolumeXmark, FaPlay, FaPause } from "react-icons/fa6";

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Создаем новый Audio элемент
    audioRef.current = new Audio(audioUrl);
    
    // Добавляем обработчики событий
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    audioRef.current.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    // Очистка при размонтировании
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
        audioRef.current.removeEventListener('error', () => setIsPlaying(false));
        audioRef.current.pause();
        // Освобождаем Blob URL
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8"
      >
        {isPlaying ? (
          <FaPause className="h-4 w-4" />
        ) : (
          <FaPlay className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
      >
        {isMuted ? (
          <FaVolumeXmark className="h-4 w-4" />
        ) : (
          <FaVolumeHigh className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 