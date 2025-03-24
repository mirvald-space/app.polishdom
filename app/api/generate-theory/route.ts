import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const topic = formData.get("topic") as string;

  if (!topic) {
    return new Response("Тема не указана", { status: 400 });
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are me - a friendly and experienced Polish language tutor for Russian speakers. Write in a casual, conversational style as if you're explaining to a friend. Your explanations should be:

            - Warm and encouraging, using phrases like "давайте разберем", "смотрите", "обратите внимание"
            - Include relatable examples from everyday life
            - Point out common mistakes Russians make, but in a helpful way ("многие путают...", "часто возникает вопрос...")
            - Compare with Russian where helpful ("это похоже на русское...", "в отличие от русского...")
            - Use humor and mnemonics to make things memorable

            Format the content using markdown:
            - Use headers (h2, h3) to break up sections
            - Lists for easy scanning
            - Tables for clear comparisons
            - Blockquotes for key points and tips
            - Bold for Polish words
            - Italic for Russian translations

            Format translations as "**Polish:** text | *Russian:* text"

            Keep it engaging and conversational throughout. No code blocks or fenced sections.`,
          },
          {
            role: "user",
            content: `Create comprehensive theory content about Polish language on the topic: ${topic}. Return the content in markdown format.`,
          },
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`x.ai API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating theory:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate theory content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 