import { questionsSchema } from "@/lib/schemas";
import { QUIZ_SYSTEM_PROMPT } from '@/lib/prompts/quiz';
import { generateImage } from '@/app/api/generete-image/route';
import { XAIClient, createApiResponse } from '@/lib/api';
import { formatErrorResponse } from '@/lib/utils';

export const maxDuration = 60;

export async function POST(req: Request) {
  const formData = await req.formData();
  const topic = formData.get("topic") as string;
  const theory = formData.get("theory") as string;
  
  if (!topic) {
    return formatErrorResponse(
      new Error("Topic is required"),
      400,
      "Тема не указана"
    );
  }

  if (!theory) {
    return formatErrorResponse(
      new Error("Theory is required"),
      400,
      "Теоретический материал не предоставлен"
    );
  }

  try {
    const messages = [
      {
        role: "system",
        content: QUIZ_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `Create an interactive quiz about Polish language on the topic: ${topic} based on this theory material: 

${theory}

Remember to return ONLY the JSON array.`,
      },
    ];
    
    // Используем класс XAIClient для запроса к API
    const data = await XAIClient.chatCompletions(messages, {
      model: "grok-3-beta",
      temperature: 0
    });
    
    let content = data.choices[0].message.content;
    
    // Remove markdown code block markers if present
    if (typeof content === 'string') {
      content = content.replace(/^```json\n|\n```$/g, '').trim();
      try {
        content = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse response:", content);
        throw new Error("Invalid JSON response from AI");
      }
    }

    // Generate images for each question
    const questionsWithImages = await Promise.all(
      content.map(async (question: any) => {
        let promptContent;
        
        switch (question.type) {
          case 'multipleChoice':
            promptContent = question.question;
            break;
          case 'fillInBlank':
            promptContent = question.context.replace(/\[BLANK\]/g, '___');
            break;
          case 'trueFalse':
            promptContent = question.statement;
            break;
          default:
            promptContent = "Polish language learning concept";
        }
        
        const imageUrl = await generateImage(promptContent);
        return {
          ...question,
          imageUrl,
        };
      })
    );

    const result = questionsSchema.safeParse(questionsWithImages);
    if (!result.success) {
      console.error("Ошибка валидации:", result.error);
      throw new Error("Ответ не соответствует ожидаемому формату");
    }

    return createApiResponse(questionsWithImages);
  } catch (error) {
    return formatErrorResponse(error, 500, "Failed to generate quiz");
  }
}
