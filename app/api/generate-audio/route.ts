import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30; // Уменьшаем таймаут, так как теперь обрабатываем меньше текста

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    // Генерируем аудио для одного слова/фразы
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Получаем буфер
    const buffer = await response.arrayBuffer();
    
    // Создаем Blob URL
    const blob = new Blob([buffer], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(blob);

    return NextResponse.json({ 
      audioUrl,
      size: buffer.byteLength
    });
  } catch (error) {
    console.error("Error generating audio:", error);
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