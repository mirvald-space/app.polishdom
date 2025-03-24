import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60; // Увеличиваем максимальное время выполнения до 60 секунд

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log("Received request for audio generation");
    const { text } = await request.json();
    console.log("Text length:", text.length);

    if (!text) {
      console.log("No text provided");
      return new Response("Text is required", { status: 400 });
    }

    // Разбиваем текст на более мелкие части, если он слишком длинный
    const maxLength = 4000; // Максимальная длина для одного запроса
    const chunks = text.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [text];
    
    console.log("Text chunks:", chunks.length);
    
    // Генерируем аудио для каждой части
    const audioBuffers = await Promise.all(
      chunks.map(async (chunk: string, index: number) => {
        console.log(`Generating audio for chunk ${index + 1}/${chunks.length}`);
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: chunk,
        });
        return await response.arrayBuffer();
      })
    );

    // Объединяем все буферы
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of audioBuffers) {
      combinedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    console.log("Combined buffer size:", combinedBuffer.length);
    
    // Создаем Blob URL
    const blob = new Blob([combinedBuffer], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(blob);
    
    console.log("Generated audio URL");

    return NextResponse.json({ 
      audioUrl,
      size: combinedBuffer.length,
      chunks: chunks.length
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