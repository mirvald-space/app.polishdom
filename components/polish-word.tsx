import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PolishWordProps {
  word: string;
  translation: string;
}

export default function PolishWord({ word, translation }: PolishWordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateAudio = async () => {
    if (audioUrl) {
      // Если аудио уже есть, просто проигрываем его
      const audio = new Audio(audioUrl);
      audio.play();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: word }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      // Проигрываем аудио сразу после получения
      const audio = new Audio(data.audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error("Failed to generate audio");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1 font-medium">
      <span className="text-primary">{word}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 rounded-full"
        onClick={generateAudio}
        disabled={isLoading}
      >
        <Volume2 className="h-3 w-3" />
      </Button>
      <span className="text-muted-foreground italic">({translation})</span>
    </span>
  );
} 