import { z } from "zod";

// Base question schema with common properties
const baseQuestionSchema = z.object({
  question: z.string(),
  imageUrl: z.string().nullable().optional().describe("Опциональный URL изображения, связанного с вопросом"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  hint: z.string().optional(),
  timeLimit: z.number().optional().describe("Временной лимит в секундах для этого вопроса"),
  type: z.enum(["multipleChoice", "fillInBlank", "trueFalse"]),
});

// Multiple choice question
const multipleChoiceSchema = baseQuestionSchema.extend({
  type: z.literal("multipleChoice"),
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
});

// Fill in the blank question
const fillInBlankSchema = baseQuestionSchema.extend({
  type: z.literal("fillInBlank"),
  blanks: z.array(z.string()).describe("Правильные ответы для заполнения пропусков"),
  context: z.string().describe("Текст предложения с пропусками, обозначенными через [BLANK]"),
});

// True/False question
const trueFalseSchema = baseQuestionSchema.extend({
  type: z.literal("trueFalse"),
  statement: z.string().describe("Утверждение, которое нужно оценить как верное или неверное"),
  answer: z.boolean().describe("Верно (true) или неверно (false) данное утверждение"),
});

// Union type of all question types
export const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  fillInBlankSchema,
  trueFalseSchema,
]);

export type Question = z.infer<typeof questionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceSchema>;
export type FillInBlankQuestion = z.infer<typeof fillInBlankSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseSchema>;

export const questionsSchema = z.array(questionSchema).length(4);
