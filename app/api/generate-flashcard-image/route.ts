import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/utils/image';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { word } = await request.json();

    if (!word) {
      return new Response("Word not provided", { status: 400 });
    }

    const prompt = `A simple, clear illustration representing the word "${word}" in a minimalist style. The image should be easily recognizable and suitable for language learning flashcards. Use a clean, modern style with minimal background.`;
    
    const imageUrl = await generateImage(prompt);

    if (!imageUrl) {
      throw new Error("Failed to generate image");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating flashcard image:', error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate flashcard image",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
} 