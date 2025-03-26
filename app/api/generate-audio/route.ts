import { NextResponse } from "next/server";
import OpenAI from "openai";

// Максимальное время выполнения запроса (30 секунд)
// Уменьшено, так как обрабатываем короткие тексты
export const maxDuration = 30;

// Инициализация клиента OpenAI с API ключом из переменных окружения
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Инструкции для польского акцента
const voiceInstructions = `Voice: Medium-pitched and melodic, with distinctive nasal quality and stressed consonants, characteristic of native Polish speakers.
Tone: Patient and encouraging, balancing academic authority with warmth, creating comfortable learning environment.
Dialect: Polish-influenced English with characteristic word stress patterns and simplified consonant clusters.
Pronunciation: Emphasizes "sz", "cz" sounds, rolls "r"s strongly, stresses first syllables, and pronounces "w" as "v".
Features: Uses occasional Polish expressions ("Dobrze!", "Rozumiem"), elongates certain vowels, adds rising intonation for questions, and maintains formal but supportive teaching cadence.`;

/**
 * POST endpoint для генерации аудио из текста
 * @param request - HTTP запрос, содержащий JSON с полем text
 * @returns NextResponse с аудио данными в формате base64
 */
export async function POST(request: Request) {
  try {
    // Получаем текст из тела запроса
    const { text } = await request.json();

    // Проверяем наличие текста
    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // Генерируем аудио с помощью OpenAI TTS API
    // Используем модель gpt-4o-mini-tts и голос "nova"
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "nova",
      input: text,
      instructions: voiceInstructions,
    });

    // Преобразуем ответ в ArrayBuffer
    const buffer = await response.arrayBuffer();
    
    // Конвертируем буфер в base64 строку для передачи
    const base64Audio = Buffer.from(buffer).toString('base64');

    // Возвращаем аудио данные и тип контента
    return NextResponse.json({ 
      audioData: base64Audio,
      contentType: 'audio/mp3'
    });
  } catch (error) {
    // Логируем ошибку в консоль
    console.error("Error generating audio:", error);
    
    // Возвращаем ошибку с деталями
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
} 