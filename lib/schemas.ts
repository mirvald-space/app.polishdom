import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths.",
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on.",
    ),
  imageUrl: z.string().optional().describe("Optional URL of an image related to the question"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  hint: z.string().optional(),
  timeLimit: z.number().optional().describe("Time limit in seconds for this question"),
});

export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z.array(questionSchema).length(4);
