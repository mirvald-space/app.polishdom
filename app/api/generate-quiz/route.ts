import { questionsSchema } from "@/lib/schemas";

export const maxDuration = 60;

async function generateImage(prompt: string) {
  try {
    const response = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
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
            content: `You are a Polish language teacher specializing in teaching Russian speakers. Your job is to create a multiple choice quiz (with 4 questions) specifically for Russian speakers learning Polish. Questions should test vocabulary, grammar, pronunciation, or cultural knowledge about Poland, with a focus on common mistakes Russian speakers make when learning Polish. Each option should be roughly equal in length. You must return ONLY valid JSON array matching this schema: [{
              question: string,
              options: string[],
              answer: 'A'|'B'|'C'|'D',
              difficulty: 'easy'|'medium'|'hard',
              hint: string (optional),
              timeLimit: number (optional, in seconds)
            }]. Questions can include Polish vocabulary with Russian translations. Do not include any other text in your response.`,
          },
          {
            role: "user",
            content: `Create a multiple choice quiz about Polish language on the topic: ${topic}. Remember to return ONLY the JSON array.`,
          },
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`x.ai API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Remove markdown code block markers if present
    if (typeof content === 'string') {
      content = content.replace(/^```json\n|\n```$/g, '').trim();
      try {
        content = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse response:", content);
        throw new Error("Invalid JSON response from AI");
      }
    }

    // Generate images for each question
    const questionsWithImages = await Promise.all(
      content.map(async (question: any) => {
        const imageUrl = await generateImage(`An illustration related to Polish language or culture representing: ${question.question}`);
        return {
          ...question,
          imageUrl,
        };
      })
    );

    const result = questionsSchema.safeParse(questionsWithImages);
    if (!result.success) {
      console.error("Ошибка валидации:", result.error);
      throw new Error("Ответ не соответствует ожидаемому формату");
    }

    return new Response(JSON.stringify(questionsWithImages), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: "Не удалось сгенерировать тест" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
