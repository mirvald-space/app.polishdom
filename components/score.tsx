
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizScoreProps {
  correctAnswers: number
  totalQuestions: number
}

export default function QuizScore({ correctAnswers, totalQuestions }: QuizScoreProps) {
  const score = (correctAnswers / totalQuestions) * 100
  const roundedScore = Math.round(score)

  const getMessage = () => {
    if (score === 100) return "Отличный результат! Поздравляем!"
    if (score >= 80) return "Отлично! Вы справились на отлично!"
    if (score >= 60) return "Хорошая работа! Вы на правильном пути."
    if (score >= 40) return "Неплохо, но есть куда стремиться."
    return "Продолжайте практиковаться, у вас всё получится!"
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-8">
        <div className="text-center">
          <p className="text-4xl font-bold">{roundedScore}%</p>
          <p className="text-sm text-muted-foreground">
            {correctAnswers} из {totalQuestions} правильных ответов
          </p>
        </div>
        <p className="text-center font-medium">{getMessage()}</p>
      </CardContent>
    </Card>
  )
}
