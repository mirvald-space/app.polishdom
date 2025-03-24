import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Четыре возможных ответа на вопрос. Только один должен быть правильным. Все ответы должны быть одинаковой длины.",
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "Правильный ответ, где A - первый вариант, B - второй и так далее.",
    ),
  imageUrl: z.string().optional().describe("Опциональный URL изображения, связанного с вопросом"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  hint: z.string().optional(),
  timeLimit: z.number().optional().describe("Временной лимит в секундах для этого вопроса"),
});

export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z.array(questionSchema).length(4);
