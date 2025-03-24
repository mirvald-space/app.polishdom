import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PolishWordProps {
  word: string;
  translation: string;
}

export default function PolishWord({ word, translation }: PolishWordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleClick = async () => {
    if (isLoading) return;

    if (audioUrl) {
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
      const audio = new Audio(data.audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <strong className="text-primary">{word}</strong>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 p-0.5 rounded-full"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
      </Button>
      <em className="text-muted-foreground">({translation})</em>
    </span>
  );
} 