import { XAIClient, createApiResponse } from '@/lib/api';
import { formatErrorResponse } from '@/lib/utils';
import { THEORY_SYSTEM_PROMPT } from '@/lib/prompts/theory';

// Максимальное время выполнения API-запроса (60 секунд)
export const maxDuration = 60;

/**
 * API endpoint для генерации теоретического материала по польскому языку
 * Принимает POST-запрос с темой в formData
 * Возвращает сгенерированный контент в формате markdown
 */
export async function POST(request: Request) {
  // Получаем тему из formData запроса
  const formData = await request.formData();
  const topic = formData.get("topic") as string;

  // Проверяем наличие темы
  if (!topic) {
    return formatErrorResponse(
      new Error("Topic is required"),
      400,
      "Тема не указана"
    );
  }

  try {
    console.log("Generating theory for topic:", topic);
    
    const messages = [
      {
        role: "system",
        content: THEORY_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `Create comprehensive theory content about Polish language on the topic: ${topic}. Return the content in markdown format.`,
      },
    ];
    
    // Используем класс XAIClient для запроса к API
    const data = await XAIClient.chatCompletions(messages, {
      model: "grok-3-beta",
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const content = data.choices[0].message.content;
    console.log("Generated theory content");

    // Возвращаем сгенерированный контент
    return createApiResponse({ content });
  } catch (error) {
    return formatErrorResponse(error, 500, "Failed to generate theory content");
  }
} 