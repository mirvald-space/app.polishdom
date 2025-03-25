import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Question } from '@/lib/schemas'
import { Badge } from '@/components/ui/badge'

interface QuizReviewProps {
  questions: Question[]
  userAnswers: {
    multipleChoice: (string | null)[]
    fillInBlank: string[][]
    trueFalse: (boolean | null)[]
  }
}

export default function QuizReview({ questions, userAnswers }: QuizReviewProps) {
  const answerLabels: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"]

  const renderQuestionReview = (question: Question, questionIndex: number) => {
    switch (question.type) {
      case 'multipleChoice':
        return renderMultipleChoiceReview(question, questionIndex);
      case 'fillInBlank':
        return renderFillInBlankReview(question, questionIndex);
      case 'trueFalse':
        return renderTrueFalseReview(question, questionIndex);
      default:
        return <div>Неподдерживаемый тип вопроса</div>;
    }
  };

  const renderMultipleChoiceReview = (question: Question, questionIndex: number) => {
    if (question.type !== 'multipleChoice') return null;
    
    return (
      <div className="space-y-2">
        <Badge variant="outline" className="mb-2">С выбором ответа</Badge>
        {question.options.map((option, optionIndex) => {
          const currentLabel = answerLabels[optionIndex]
          const isCorrect = currentLabel === question.answer
          const isSelected = currentLabel === userAnswers.multipleChoice[questionIndex]
          const isIncorrectSelection = isSelected && !isCorrect

          return (
            <div
              key={optionIndex}
              className={`flex items-center p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-100 dark:bg-green-700/50'
                  : isIncorrectSelection
                  ? 'bg-red-100 dark:bg-red-700/50'
                  : 'border border-border'
              }`}
            >
              <span className="text-lg font-medium mr-4 w-6">{currentLabel}</span>
              <span className="flex-grow">{option}</span>
              {isCorrect && (
                <Check className="ml-2 text-green-600 dark:text-green-400" size={20} />
              )}
              {isIncorrectSelection && (
                <X className="ml-2 text-red-600 dark:text-red-400" size={20} />
              )}
            </div>
          )
        })}
      </div>
    );
  };

  const renderFillInBlankReview = (question: Question, questionIndex: number) => {
    if (question.type !== 'fillInBlank') return null;
    
    const parts = question.context.split('[BLANK]');
    
    return (
      <div className="space-y-2">
        <Badge variant="outline" className="mb-2">Заполнение пропусков</Badge>
        <div className="p-4 border rounded-lg">
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <span className="inline-block mx-1 py-1 px-2 rounded-md font-medium">
                  <span className={`${
                    userAnswers.fillInBlank[questionIndex][index]?.toLowerCase() === 
                    question.blanks[index]?.toLowerCase()
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300'
                  } py-1 px-2 rounded border`}>
                    {userAnswers.fillInBlank[questionIndex][index] || '___'}
                  </span>
                  {userAnswers.fillInBlank[questionIndex][index]?.toLowerCase() !== 
                   question.blanks[index]?.toLowerCase() && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      ({question.blanks[index]})
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderTrueFalseReview = (question: Question, questionIndex: number) => {
    if (question.type !== 'trueFalse') return null;
    
    const userAnswer = userAnswers.trueFalse[questionIndex];
    const correctAnswer = question.answer;
    const isCorrect = userAnswer === correctAnswer;
    
    return (
      <div className="space-y-2">
        <Badge variant="outline" className="mb-2">Верно/Неверно</Badge>
        <div className="p-4 border rounded-lg mb-2">
          <p className="text-lg mb-2">{question.statement}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`flex justify-between items-center p-4 rounded-lg ${
              correctAnswer === true
                ? 'bg-green-100 dark:bg-green-700/50'
                : userAnswer === true && !isCorrect
                ? 'bg-red-100 dark:bg-red-700/50'
                : 'border border-border'
            }`}
          >
            <span>Верно</span>
            {correctAnswer === true && (
              <Check className="ml-2 text-green-600 dark:text-green-400" size={20} />
            )}
            {userAnswer === true && !isCorrect && (
              <X className="ml-2 text-red-600 dark:text-red-400" size={20} />
            )}
          </div>
          <div
            className={`flex justify-between items-center p-4 rounded-lg ${
              correctAnswer === false
                ? 'bg-green-100 dark:bg-green-700/50'
                : userAnswer === false && !isCorrect
                ? 'bg-red-100 dark:bg-red-700/50'
                : 'border border-border'
            }`}
          >
            <span>Неверно</span>
            {correctAnswer === false && (
              <Check className="ml-2 text-green-600 dark:text-green-400" size={20} />
            )}
            {userAnswer === false && !isCorrect && (
              <X className="ml-2 text-red-600 dark:text-red-400" size={20} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Обзор теста</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
              {renderQuestionReview(question, questionIndex)}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

