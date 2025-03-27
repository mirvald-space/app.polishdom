import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaChevronRight, FaVolumeHigh, FaSpinner, FaImage, FaRotate, FaArrowRight, FaArrowLeft, FaCheck } from "react-icons/fa6";
import { Markdown } from './markdown';
import { toast } from 'sonner';
import ReactDOM from 'react-dom/client';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
        <FaSpinner className="h-3 w-3 animate-spin" />
      ) : (
        <FaVolumeHigh className="h-3 w-3" />
      )}
    </button>
  );
}

interface FlashCard {
  word: string;
  translation: string;
  imageUrl?: string;
}

function FlashCardComponent({ card }: { card: FlashCard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch('/api/generate-flashcard-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: card.word }),
        });

        if (!response.ok) throw new Error('Failed to generate image');

        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error('Error loading flashcard image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [card.word]);

  return (
    <div 
      className="relative aspect-square cursor-pointer group perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={cn(
        "absolute inset-0 duration-500 preserve-3d",
        isFlipped ? "[transform:rotateY(180deg)]" : ""
      )}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden">
          <div className="h-full bg-card rounded-lg border flex flex-col items-center justify-center p-4">
            {isLoading ? (
              <FaSpinner className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={card.word}
                width={120}
                height={120}
                className="object-contain mb-2"
              />
            ) : (
              <FaImage className="h-12 w-12 text-muted-foreground mb-2" />
            )}
            <p className="font-medium text-center">{card.word}</p>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)]">
          <div className="h-full bg-card rounded-lg border flex items-center justify-center p-4">
            <p className="font-medium text-center">{card.translation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseSection({ content, onComplete }: { content: string; onComplete: () => void }) {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  // Parse exercises from content
  const exercises = content.split('\n')
    .filter(line => line.includes('|'))
    .map(line => {
      const [question, answer] = line.split('|').map(s => s.trim());
      return { question, answer };
    });

  const checkAnswers = () => {
    setShowAnswers(true);
    const allCorrect = exercises.every((exercise, idx) => 
      userAnswers[idx]?.toLowerCase() === exercise.answer.toLowerCase()
    );
    if (allCorrect) {
      setIsCompleted(true);
      onComplete();
    }
  };

  const resetExercises = () => {
    setUserAnswers([]);
    setShowAnswers(false);
    setIsSkipped(false);
  };

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  if (isSkipped) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">Упражнения пропущены</p>
        </div>
        <Button onClick={resetExercises} variant="outline">
          <FaRotate className="mr-2 h-4 w-4" />
          Вернуться к упражнениям
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exercises.map((exercise, idx) => (
        <div key={idx} className="space-y-2">
          <p className="font-medium">{exercise.question}</p>
          <div className="flex gap-4 items-center">
            <Input
              value={userAnswers[idx] || ''}
              onChange={(e) => {
                const newAnswers = [...userAnswers];
                newAnswers[idx] = e.target.value;
                setUserAnswers(newAnswers);
              }}
              placeholder="Ваш ответ..."
              className="max-w-md"
              disabled={showAnswers}
            />
            {showAnswers && (
              <p className={cn(
                "text-sm",
                userAnswers[idx]?.toLowerCase() === exercise.answer.toLowerCase()
                  ? "text-green-500"
                  : "text-red-500"
              )}>
                Правильный ответ: {exercise.answer}
              </p>
            )}
          </div>
        </div>
      ))}
      <div className="flex gap-4">
        {!showAnswers && (
          <>
            <Button onClick={checkAnswers} disabled={userAnswers.length !== exercises.length}>
              Проверить ответы
            </Button>
            <Button onClick={handleSkip} variant="outline">
              Пропустить упражнения
            </Button>
          </>
        )}
        {showAnswers && !isCompleted && (
          <Button onClick={resetExercises} variant="outline">
            <FaRotate className="mr-2 h-4 w-4" />
            Начать заново
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Theory({ content, onStartQuiz }: TheoryProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<'theory' | 'theory-practice' | 'flashcards' | 'grammar' | 'grammar-practice'>('theory');
  const [progress, setProgress] = useState(0);
  const [theoryCompleted, setTheoryCompleted] = useState(false);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);
  const [grammarCompleted, setGrammarCompleted] = useState(false);
  const [stepHistory, setStepHistory] = useState<{
    theory: boolean;
    'theory-practice': boolean;
    flashcards: boolean;
    grammar: boolean;
    'grammar-practice': boolean;
  }>({
    theory: false,
    'theory-practice': false,
    flashcards: false,
    grammar: false,
    'grammar-practice': false,
  });

  const stepOrder = ['theory', 'theory-practice', 'flashcards', 'grammar', 'grammar-practice'] as const;

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

  // Extract sections from content
  const sections = {
    theory: content.split('## 1. Введение')[0],
    introduction: content.split('## 1. Введение')[1]?.split('## 2. Основной текст')[0] || '',
    mainText: content.split('## 2. Основной текст')[1]?.split('## 3. Вопросы для обсуждения')[0] || '',
    discussion: content.split('## 3. Вопросы для обсуждения')[1]?.split('## 4. Упражнения')[0] || '',
    exercises: content.split('## 4. Упражнения')[1]?.split('## 5. Визуальный материал')[0] || '',
    visual: content.split('## 5. Визуальный материал')[1]?.split('## 6. Загадки')[0] || '',
    riddles: content.split('## 6. Загадки')[1]?.split('## 7. Аудирование')[0] || '',
    audio: content.split('## 7. Аудирование')[1]?.split('## 8. Грамматика')[0] || '',
    grammar: content.split('## 8. Грамматика')[1] || ''
  };

  // Parse visual content into flashcards
  const flashcards: FlashCard[] = sections.visual
    .split('\n')
    .filter(line => line.includes('|'))
    .map(line => {
      const [word, translation] = line.split('|').map(s => s.trim());
      return { word, translation };
    });

  const handleStepComplete = () => {
    setStepHistory(prev => ({ ...prev, [currentStep]: true }));
    const currentIndex = stepOrder.indexOf(currentStep);
    setCurrentStep(stepOrder[currentIndex + 1]);
    setProgress((currentIndex + 2) * 20);

    switch (currentStep) {
      case 'theory-practice':
        setTheoryCompleted(true);
        break;
      case 'flashcards':
        setFlashcardsCompleted(true);
        break;
      case 'grammar-practice':
        setGrammarCompleted(true);
        break;
    }
  };

  const handleStepChange = (step: typeof stepOrder[number]) => {
    setCurrentStep(step);
    const currentIndex = stepOrder.indexOf(step);
    setProgress((currentIndex + 1) * 20);
  };

  const renderStepNavigation = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    
    return (
      <div className="flex justify-between items-center mt-6">
        <Button 
          variant="outline"
          onClick={() => handleStepChange(stepOrder[currentIndex - 1])}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <FaArrowLeft className="h-4 w-4" /> Назад
        </Button>

        <div className="flex gap-2">
          {stepOrder.map((step, index) => (
            <button
              key={step}
              onClick={() => handleStepChange(step)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                currentStep === step 
                  ? "bg-primary" 
                  : stepHistory[step]
                    ? "bg-primary/40 hover:bg-primary/60"
                    : "bg-muted hover:bg-muted-foreground/20"
              )}
              disabled={!stepHistory[step] && index > currentIndex}
              title={
                step === 'theory' ? 'Теория' :
                step === 'theory-practice' ? 'Упражнения по теории' :
                step === 'flashcards' ? 'Изучение слов' :
                step === 'grammar' ? 'Грамматика' :
                'Упражнения по грамматике'
              }
            />
          ))}
        </div>

        {currentStep !== 'grammar-practice' ? (
          <Button 
            onClick={handleStepComplete}
            disabled={!stepHistory[currentStep]}
            className="gap-2"
          >
            Вперед <FaArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onStartQuiz}
            disabled={!stepHistory[currentStep]}
            className="gap-2 bg-[#BB4A3D]"
          >
            К тесту <FaChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'theory':
        return (
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none" ref={contentRef}>
              <Markdown>{sections.theory + sections.introduction + sections.mainText + sections.discussion}</Markdown>
            </div>
            <Button onClick={() => setStepHistory(prev => ({ ...prev, theory: true }))} className="mt-4">
              Я прочитал(а) материал <FaCheck className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'theory-practice':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Упражнения по теории</h3>
            <ExerciseSection content={sections.exercises} onComplete={() => setStepHistory(prev => ({ ...prev, 'theory-practice': true }))} />
          </div>
        );

      case 'flashcards':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Изучение слов</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {flashcards.map((card, i) => (
                <FlashCardComponent key={i} card={card} />
              ))}
            </div>
            <Button onClick={() => setStepHistory(prev => ({ ...prev, flashcards: true }))} className="mt-4">
              Я выучил(а) слова <FaCheck className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'grammar':
        return (
          <div className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown>{sections.grammar}</Markdown>
            </div>
            <Button onClick={() => setStepHistory(prev => ({ ...prev, grammar: true }))} className="mt-4">
              Я понял(а) грамматику <FaCheck className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'grammar-practice':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Упражнения по грамматике</h3>
            <ExerciseSection 
              content={sections.grammar.split('### Упражнения')[1] || ''} 
              onComplete={() => setStepHistory(prev => ({ ...prev, 'grammar-practice': true }))} 
            />
          </div>
        );
    }
  };

  return (
    <Card className="w-full rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Теория</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Теория {theoryCompleted && '✓'}</span>
            <span>Слова {flashcardsCompleted && '✓'}</span>
            <span>Грамматика {grammarCompleted && '✓'}</span>
          </div>
        </div>

        {renderCurrentStep()}
        {renderStepNavigation()}
      </CardContent>
    </Card>
  );
} 