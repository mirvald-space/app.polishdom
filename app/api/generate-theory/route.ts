import { THEORY_SYSTEM_PROMPT } from '@/lib/prompts/theory';

// Максимальное время выполнения API-запроса (60 секунд)
export const maxDuration = 60;

/**
 * API endpoint для генерации теоретического материала по польскому языку
 * Принимает POST-запрос с темой в formData
 * Возвращает сгенерированный контент в формате markdown
 */
export async function POST(request: Request) {
  // Получаем тему из formData запроса
  const formData = await request.formData();
  const topic = formData.get("topic") as string;

  // Проверяем наличие темы
  if (!topic) {
    return new Response("Тема не указана", { status: 400 });
  }

  try {
    console.log("Generating theory for topic:", topic);
    
    // Отправляем запрос к API x.ai для генерации контента
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
            content: THEORY_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: `Create comprehensive theory content about Polish language on the topic: ${topic}. Return the content in markdown format.`,
          },
        ],
        model: "grok-3-beta",
        stream: false,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    // Обработка ошибок API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("x.ai API error:", response.statusText, errorData);
      throw new Error(`x.ai API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    // Получаем и обрабатываем успешный ответ
    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log("Generated theory content");

    // Возвращаем сгенерированный контент с настройками кэширования
    return new Response(JSON.stringify({ content }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      },
    });
  } catch (error) {
    // Обработка ошибок при генерации контента
    console.error("Error generating theory:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate theory content",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
} 