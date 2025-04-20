import { NextResponse } from "next/server";
import OpenAI from "openai";
import { AUDIO_VOICE_INSTRUCTIONS } from '@/lib/prompts/audio';

// Максимальное время выполнения запроса (30 секунд)
// Уменьшено, так как обрабатываем короткие тексты
export const maxDuration = 30;

// Инициализация клиента OpenAI с API ключом из переменных окружения
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST endpoint для генерации аудио из текста
 * @param request - HTTP запрос, содержащий JSON с полем text
 * @returns NextResponse с аудио данными в формате base64
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
      instructions: AUDIO_VOICE_INSTRUCTIONS,
    });

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return new Response(
      JSON.stringify({
        audioData: base64,
        contentType: "audio/mpeg",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error generating audio:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 