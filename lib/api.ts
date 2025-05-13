import { API_RESPONSE_HEADERS, formatErrorResponse } from "./utils";

/**
 * Клиент для работы с x.ai API
 */
export class XAIClient {
  private static API_KEY = process.env.X_AI_API_KEY;
  private static BASE_URL = "https://api.x.ai/v1";

  /**
   * Отправляет запрос к Chat Completions API
   * @param messages - Массив сообщений для запроса
   * @param options - Дополнительные параметры запроса
   * @returns - Результат запроса
   */
  static async chatCompletions(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ) {
    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          messages,
          model: options.model || "grok-3-beta",
          stream: options.stream ?? false,
          temperature: options.temperature ?? 0.7,
          ...(options.max_tokens && { max_tokens: options.max_tokens }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`x.ai API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("XAIClient chatCompletions error:", error);
      throw error;
    }
  }

  /**
   * Генерирует изображение по заданному промпту
   * @param prompt - Промпт для генерации изображения
   * @returns - URL сгенерированного изображения или undefined при ошибке
   */
  static async generateImage(prompt: string): Promise<string | undefined> {
    try {
      const response = await fetch(`${this.BASE_URL}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-2-image",
          prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Image generation failed:", response.statusText, errorData);
        return undefined;
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error("Image generation error:", error);
      return undefined;
    }
  }
}

/**
 * Клиент для работы с OpenAI API
 */
export class OpenAIClient {
  private static API_KEY = process.env.OPENAI_API_KEY;
  private static BASE_URL = "https://api.openai.com/v1";

  /**
   * Создает аудио из текста с помощью TTS модели
   * @param text - Текст для генерации аудио
   * @param options - Дополнительные параметры (модель, голос, формат и т.д.)
   * @returns - Объект с аудиоданными в формате base64
   */
  static async textToSpeech(
    text: string,
    options: {
      model?: string;
      voice?: string;
      format?: string;
      instructions?: string;
    } = {}
  ) {
    try {
      const response = await fetch(`${this.BASE_URL}/audio/speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          model: options.model || "tts-1",
          voice: options.voice || "alloy",
          input: text,
          response_format: options.format || "mp3",
          ...(options.instructions && { instructions: options.instructions }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return {
        audioData: base64,
        contentType: options.format === "wav" ? "audio/wav" : "audio/mpeg",
      };
    } catch (error) {
      console.error("OpenAIClient textToSpeech error:", error);
      throw error;
    }
  }
}

/**
 * Создает стандартизированный API-ответ
 * @param data - Данные для включения в ответ
 * @returns - Response объект с данными и стандартными заголовками
 */
export function createApiResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { headers: API_RESPONSE_HEADERS.json }
  );
} 