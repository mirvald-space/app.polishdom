import { questionsSchema } from "@/lib/schemas";
import { QUIZ_SYSTEM_PROMPT } from '@/lib/prompts/quiz';
import { generateImagePrompt } from '@/lib/prompts/image';
import { generateImage } from '@/app/api/generete-image/route';

export const maxDuration = 60;

export async function POST(req: Request) {
  const formData = await req.formData();
  const topic = formData.get("topic") as string;
  const theory = formData.get("theory") as string;
  
  if (!topic) {
    return new Response("Тема не указана", { status: 400 });
  }

  if (!theory) {
    return new Response("Теоретический материал не предоставлен", { status: 400 });
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
            content: QUIZ_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Create an interactive quiz about Polish language on the topic: ${topic} based on this theory material: 

${theory}

Remember to return ONLY the JSON array.`,
          },
        ],
        model: "grok-3-beta",
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
        let promptContent;
        
        switch (question.type) {
          case 'multipleChoice':
            promptContent = question.question;
            break;
          case 'fillInBlank':
            promptContent = question.context.replace(/\[BLANK\]/g, '___');
            break;
          case 'trueFalse':
            promptContent = question.statement;
            break;
          default:
            promptContent = "Polish language learning concept";
        }
        
        const imageUrl = await generateImage(promptContent);
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
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate quiz",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
