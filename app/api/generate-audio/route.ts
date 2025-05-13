import { OpenAIClient, createApiResponse } from '@/lib/api';
import { formatErrorResponse } from '@/lib/utils';
import { AUDIO_VOICE_INSTRUCTIONS } from '@/lib/prompts/audio';

// Максимальное время выполнения запроса (30 секунд)
// Уменьшено, так как обрабатываем короткие тексты
export const maxDuration = 30;

/**
 * POST endpoint для генерации аудио из текста
 * @param request - HTTP запрос, содержащий JSON с полем text
 * @returns Response с аудио данными в формате base64
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return formatErrorResponse(
        new Error("Text is required"),
        400,
        "Необходимо указать текст"
      );
    }

    const audioData = await OpenAIClient.textToSpeech(text, {
      instructions: AUDIO_VOICE_INSTRUCTIONS
    });

    return createApiResponse(audioData);
  } catch (error) {
    return formatErrorResponse(error, 500, "Ошибка генерации аудио");
  }
} 