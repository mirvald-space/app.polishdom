import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { Markdown } from './markdown';
import AudioPlayer from './audio-player';
import { toast } from "sonner";

interface TheoryProps {
  content: string;
  onStartQuiz: () => void;
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateAudio = async () => {
      setIsLoading(true);
      try {
        console.log("Generating audio for content length:", content.length);
        const response = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: content }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to generate audio');
        }

        const data = await response.json();
        console.log("Received audio URL");
        setAudioUrl(data.audioUrl);
      } catch (error) {
        console.error('Error generating audio:', error);
        toast.error("Failed to generate audio. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generateAudio();
  }, [content]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Theory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Generating audio...</span>
            </div>
          ) : audioUrl ? (
            <AudioPlayer audioUrl={audioUrl} />
          ) : null}
        </div>
        <Markdown>{content}</Markdown>
        <div className="flex justify-center mt-8">
          <Button onClick={onStartQuiz} size="lg" className="gap-2">
            Start Quiz <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 