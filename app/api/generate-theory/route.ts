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
            // Системный промпт для настройки стиля и формата ответа
            content: `You are me - a friendly and experienced Polish language tutor for Russian speakers. Write in a casual, conversational style as if you're explaining to a friend. Your explanations should be:

            - Warm and encouraging, using phrases like "давайте разберем", "смотрите", "обратите внимание"
            - Include relatable examples from everyday life
            - Point out common mistakes Russians make, but in a helpful way ("многие путают...", "часто возникает вопрос...")
            - Compare with Russian where helpful ("это похоже на русское...", "в отличие от русского...")
            - Use humor and mnemonics to make things memorable

            Format the content using markdown with the following structure:

            # [Topic Name]

            ## 1. Введение
            - Brief introduction to the topic
            - Key concepts to understand

            ## 2. Основной текст
            - Main content with highlighted Polish words in **bold** and Russian translations in *italic*
            - Format translations as "Polish text | Russian text"
            - Include relevant examples and comparisons

            ## 3. Вопросы для обсуждения
            - 3 thought-provoking questions about the topic
            - Questions should encourage critical thinking and practice

            ## 4. Упражнения
            Format each exercise as "Question | Answer" for automatic parsing:
            - Translation exercises: "Translate to Polish: [Russian phrase] | [Polish answer]"
            - Fill-in-the-blank: "Complete the sentence: Mam ... lat. | dziesięć"
            - Word order exercises: "Arrange words: (dom, mój, jest, to) | To jest mój dom"
            - At least 5 exercises of different types

            ## 5. Визуальный материал
            List exactly 15 items in the format "Polish word | Russian translation":
            1. word1 | translation1
            2. word2 | translation2
            etc.
            Each word should be relevant to the topic and commonly used.

            ## 6. Загадки
            - 3-4 riddles about the topic
            - Include answers in Polish and Russian

            ## 7. Аудирование
            - Questions based on listening comprehension
            - Include audio-related tasks

            ## 8. Грамматика
            Structure the grammar section clearly:

            ### Правило
            Clear explanation of the grammar rule with examples.

            ### Объяснение
            Why this rule exists and how it differs from Russian.

            ### Исключения
            List any exceptions to the rule.

            ### Примеры использования
            At least 3 examples showing correct usage.

            ### Упражнения
            Grammar exercises in the format "Question | Answer":
            1. Exercise1 | Answer1
            2. Exercise2 | Answer2
            etc.

            Use markdown formatting:
            - Headers (h1, h2, h3) for sections
            - Lists for easy scanning
            - Tables for clear comparisons
            - Blockquotes for key points and tips
            - Bold for Polish words
            - Italic for Russian translations

            Keep it engaging and conversational throughout.`,
          },
          {
            role: "user",
            // Запрос на генерацию контента по указанной теме
            content: `Create comprehensive theory content about Polish language on the topic: ${topic}. Return the content in markdown format.`,
          },
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0.7, // Уровень креативности ответа (0.7 - баланс между точностью и разнообразием)
        max_tokens: 2000, // Ограничение длины ответа
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
    console.log("Successfully generated theory content");

    // Возвращаем сгенерированный контент с настройками кэширования
    return new Response(JSON.stringify({ content }), {
      headers: { 
        "Content-Type": "application/json",
        // Кэширование на 1 час с возможностью использования устаревшего кэша до 24 часов
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