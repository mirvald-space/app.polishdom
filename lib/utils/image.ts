/**
 * Generates an image using x.ai API
 * @param prompt - The prompt to generate the image from
 * @returns The URL of the generated image, or undefined if generation fails
 */
export async function generateImage(prompt: string) {
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Image generation failed:", response.statusText, errorData);
      return undefined;
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined;
  }
} 