import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Markdown } from './markdown';

interface TheoryProps {
  content: string;
  onStartQuiz: () => void;
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Theory</CardTitle>
      </CardHeader>
      <CardContent>
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