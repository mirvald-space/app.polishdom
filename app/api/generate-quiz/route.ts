import { questionsSchema } from "@/lib/schemas";
import { generateImage } from '@/lib/utils/image';

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
            content: `You are a Polish language teacher specializing in teaching Russian speakers. Your job is to create an interactive quiz (with 4 questions) specifically for Russian speakers learning Polish based on the provided theory material.

Create a mix of different question types that directly test understanding of the theory content:
1. Multiple choice questions with 4 options (make sure all options are roughly equal in length)
2. Fill in the blank questions where students have to provide the missing word(s)
3. True/False questions where students have to evaluate if a statement is correct

You must return ONLY valid JSON array matching this schema:
[
  // Multiple choice question
  {
    "type": "multipleChoice",
    "question": string,
    "options": string[] (array of 4 options),
    "answer": 'A'|'B'|'C'|'D',
    "difficulty": 'easy'|'medium'|'hard',
    "hint": string (optional)
  },
  
  // Fill in blank question
  {
    "type": "fillInBlank",
    "question": string,
    "context": string (text with [BLANK] placeholders for words),
    "blanks": string[] (array of correct answers for each blank),
    "difficulty": 'easy'|'medium'|'hard',
    "hint": string (optional)
  },
  
  // True/False question
  {
    "type": "trueFalse",
    "question": string,
    "statement": string (statement to evaluate),
    "answer": boolean,
    "difficulty": 'easy'|'medium'|'hard',
    "hint": string (optional)
  }
]

IMPORTANT: The questions MUST test understanding of the theory material provided. Use concepts, vocabulary, and facts directly from the theory. Include at least one of each type of question.
Do not include any other text in your response.`,
          },
          {
            role: "user",
            content: `Create an interactive quiz about Polish language on the topic: ${topic} based on this theory material: 

${theory}

Remember to return ONLY the JSON array.`,
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
        let imagePrompt;
        
        switch (question.type) {
          case 'multipleChoice':
            imagePrompt = `An illustration related to Polish language or culture representing: ${question.question}`;
            break;
          case 'fillInBlank':
            imagePrompt = `An illustration related to Polish language or culture representing: ${question.context.replace(/\[BLANK\]/g, '___')}`;
            break;
          case 'trueFalse':
            imagePrompt = `An illustration related to Polish language or culture representing: ${question.statement}`;
            break;
          default:
            imagePrompt = `An illustration related to Polish language or culture`;
        }
        
        const imageUrl = await generateImage(imagePrompt);
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
