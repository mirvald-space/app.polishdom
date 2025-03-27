import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaCheck, FaXmark, FaLightbulb, FaVolumeHigh, FaVolumeXmark, FaTrophy } from "react-icons/fa6";
import {
  FillInBlankQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Base props for all question type components
interface BaseQuestionProps {
  timeLeft: number; // Keeping for backward compatibility but not using
  onHint: () => void;
  hasUsedHint: boolean;
  streak: number;
  isMuted: boolean;
  onToggleSound: () => void;
  showCorrectAnswer: boolean;
  className?: string;
}

// Multiple Choice Question Component
interface MultipleChoiceProps extends BaseQuestionProps {
  question: MultipleChoiceQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
}

export function MultipleChoiceCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer,
  onHint,
  hasUsedHint,
  streak,
  isMuted,
  onToggleSound,
  className,
}: MultipleChoiceProps) {
  const answerLabels = ["A", "B", "C", "D"];
  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={difficultyColors[question.difficulty]}>
            {question.difficulty === 'easy' ? 'Легкий' : question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </Badge>
          {streak > 0 && (
            <Badge variant="secondary" className="bg-purple-500">
              <FaTrophy className="w-3 h-3 mr-1" />
              {streak}x
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSound}>
            {isMuted ? <FaVolumeXmark className="w-4 h-4" /> : <FaVolumeHigh className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        
        {question.imageUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              className="object-cover w-full h-full"
              fill
              priority
            />
          </div>
        )}
        
      </div>
      <h2 className="text-lg font-semibold leading-tight">
          {question.question}
        </h2>
      <div className="grid grid-cols-2 gap-4 ">
        
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ scale: 1 }}
            animate={{ 
              scale: showCorrectAnswer && answerLabels[index] === question.answer ? 1.05 : 1,
              backgroundColor: showCorrectAnswer && answerLabels[index] === question.answer ? "rgb(34 197 94)" : 
                             showCorrectAnswer && selectedAnswer === answerLabels[index] && selectedAnswer !== question.answer ? "rgb(239 68 68)" : 
                             selectedAnswer === answerLabels[index] ? "hsl(var(--secondary))" : "transparent"
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant={selectedAnswer === answerLabels[index] ? "secondary" : "outline"}
              className={`h-auto py-6 px-4 justify-start text-left whitespace-normal w-full ${
                showCorrectAnswer && answerLabels[index] === question.answer
                  ? "bg-green-600 hover:bg-green-700"
                  : showCorrectAnswer &&
                      selectedAnswer === answerLabels[index] &&
                      selectedAnswer !== question.answer
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }`}
              onClick={() => onSelectAnswer(answerLabels[index])}
            >
              <span className="text-lg font-medium mr-4 shrink-0">
                {answerLabels[index]}
              </span>
              <span className="flex-grow">{option}</span>
              {(showCorrectAnswer && answerLabels[index] === question.answer) ||
                (selectedAnswer === answerLabels[index] && (
                  <FaCheck className="ml-2 shrink-0 text-white" size={20} />
                ))}
              {showCorrectAnswer &&
                selectedAnswer === answerLabels[index] &&
                selectedAnswer !== question.answer && (
                  <FaXmark className="ml-2 shrink-0 text-white" size={20} />
                )}
            </Button>
          </motion.div>
        ))}
      </div>
      {question.hint && !hasUsedHint && !showCorrectAnswer && (
        <Button
          variant="outline"
          className="w-full bg-[#fafafa] hover:bg-[#fafafa]/80 rounded-2xl gap-0"
          onClick={onHint}
        >
          <FaLightbulb className="w-2 h-2 mr-2 " />
          Подсказка
        </Button>
      )}
    </div>
  );
}

// Fill in the Blank Question Component
interface FillInBlankProps extends BaseQuestionProps {
  question: FillInBlankQuestion;
  answers: string[];
  onUpdateAnswers: (answers: string[]) => void;
}

export function FillInBlankCard({
  question,
  answers,
  onUpdateAnswers,
  showCorrectAnswer,
  onHint,
  hasUsedHint,
  streak,
  isMuted,
  onToggleSound,
}: FillInBlankProps) {
  // Split the context string by [BLANK] placeholders
  const parts = question.context.split("[BLANK]");
  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
  };
  
  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    onUpdateAnswers(newAnswers);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={difficultyColors[question.difficulty]}>
            {question.difficulty === 'easy' ? 'Легкий' : question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </Badge>
          {streak > 0 && (
            <Badge variant="secondary" className="bg-purple-500">
              <FaTrophy className="w-3 h-3 mr-1" />
              {streak}x
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSound}>
            {isMuted ? <FaVolumeXmark className="w-4 h-4" /> : <FaVolumeHigh className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold leading-tight">
          {question.question}
        </h2>
        {question.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              className="object-cover w-full h-full"
              fill
              priority
            />
          </div>
        )}
      </div>
      
      <div className="p-4 border rounded-lg bg-card">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <span className="inline-block mx-1 align-middle">
                <Input 
                  className={`w-32 inline-block ${
                    showCorrectAnswer && answers[index] === question.blanks[index]
                      ? "border-green-500 bg-green-50"
                      : showCorrectAnswer && answers[index] !== question.blanks[index]
                      ? "border-red-500 bg-red-50"
                      : ""
                  }`}
                  value={answers[index] || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  readOnly={showCorrectAnswer}
                />
                {showCorrectAnswer && (
                  <span className="ml-2 text-sm">
                    {answers[index] === question.blanks[index] ? (
                      <FaCheck className="inline text-green-500" size={16} />
                    ) : (
                      <>
                        <FaXmark className="inline text-red-500" size={16} />
                        <span className="ml-1 text-green-600">
                          ({question.blanks[index]})
                        </span>
                      </>
                    )}
                  </span>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {question.hint && !hasUsedHint && !showCorrectAnswer && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onHint}
        >
          <FaLightbulb className="w-4 h-4 mr-2" />
          Подсказка
        </Button>
      )}
    </div>
  );
}

// True/False Question Component
interface TrueFalseProps extends BaseQuestionProps {
  question: TrueFalseQuestion;
  selectedAnswer: boolean | null;
  onSelectAnswer: (answer: boolean) => void;
}

export function TrueFalseCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  showCorrectAnswer,
  onHint,
  hasUsedHint,
  streak,
  isMuted,
  onToggleSound,
}: TrueFalseProps) {
  const difficultyColors = {
    easy: "bg-green-500",
    medium: "bg-yellow-500",
    hard: "bg-red-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={difficultyColors[question.difficulty]}>
            {question.difficulty === 'easy' ? 'Легкий' : question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </Badge>
          {streak > 0 && (
            <Badge variant="secondary" className="bg-purple-500">
              <FaTrophy className="w-3 h-3 mr-1" />
              {streak}x
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSound}>
            {isMuted ? <FaVolumeXmark className="w-4 h-4" /> : <FaVolumeHigh className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold leading-tight">
          {question.question}
        </h2>
        {question.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              className="object-cover w-full h-full"
              fill
              priority
            />
          </div>
        )}
      </div>
      
      <div className="p-4 border rounded-lg bg-card">
        <p className="text-lg mb-4">{question.statement}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              scale: showCorrectAnswer && question.answer === true ? 1.05 : 1,
              backgroundColor: showCorrectAnswer && question.answer === true ? "rgb(34 197 94)" : 
                             showCorrectAnswer && selectedAnswer === true && true !== question.answer ? "rgb(239 68 68)" : 
                             selectedAnswer === true ? "hsl(var(--secondary))" : "transparent"
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant={selectedAnswer === true ? "secondary" : "outline"}
              className={`h-auto py-4 justify-center text-center w-full ${
                showCorrectAnswer && question.answer === true
                  ? "bg-green-600 hover:bg-green-700"
                  : showCorrectAnswer && selectedAnswer === true && true !== question.answer
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }`}
              onClick={() => onSelectAnswer(true)}
            >
              <span className="text-lg font-medium">Верно</span>
              {(showCorrectAnswer && question.answer === true) ||
                (selectedAnswer === true && (
                  <FaCheck className="ml-2 shrink-0 text-white" size={20} />
                ))}
              {showCorrectAnswer &&
                selectedAnswer === true &&
                true !== question.answer && (
                  <FaXmark className="ml-2 shrink-0 text-white" size={20} />
                )}
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              scale: showCorrectAnswer && question.answer === false ? 1.05 : 1,
              backgroundColor: showCorrectAnswer && question.answer === false ? "rgb(34 197 94)" : 
                             showCorrectAnswer && selectedAnswer === false && false !== question.answer ? "rgb(239 68 68)" : 
                             selectedAnswer === false ? "hsl(var(--secondary))" : "transparent"
            }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant={selectedAnswer === false ? "secondary" : "outline"}
              className={`h-auto py-4 justify-center text-center w-full ${
                showCorrectAnswer && question.answer === false
                  ? "bg-green-600 hover:bg-green-700"
                  : showCorrectAnswer && selectedAnswer === false && false !== question.answer
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }`}
              onClick={() => onSelectAnswer(false)}
            >
              <span className="text-lg font-medium">Неверно</span>
              {(showCorrectAnswer && question.answer === false) ||
                (selectedAnswer === false && (
                  <FaCheck className="ml-2 shrink-0 text-white" size={20} />
                ))}
              {showCorrectAnswer &&
                selectedAnswer === false &&
                false !== question.answer && (
                  <FaXmark className="ml-2 shrink-0 text-white" size={20} />
                )}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {question.hint && !hasUsedHint && !showCorrectAnswer && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onHint}
        >
          <FaLightbulb className="w-4 h-4 mr-2" />
          Подсказка
        </Button>
      )}
    </div>
  );
} 