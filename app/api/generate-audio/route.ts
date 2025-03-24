import { NextResponse } from "next/server";
import OpenAI from "openai";

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

    console.log("Calling OpenAI TTS API...");
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    console.log("Received response from OpenAI");

    // Convert the response to a buffer
    const buffer = await response.arrayBuffer();
    console.log("Buffer size:", buffer.byteLength);
    
    // Convert buffer to base64
    const base64Audio = Buffer.from(buffer).toString('base64');
    console.log("Base64 length:", base64Audio.length);
    
    // Create a data URL
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    console.log("Generated audio URL");

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Error generating audio:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate audio", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 