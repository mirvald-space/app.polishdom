import { XAIClient } from '@/lib/api';
import { generateImagePrompt } from '@/lib/prompts/image';

/**
 * Generates an image using x.ai API
 * @param prompt - The prompt to generate the image from
 * @returns The URL of the generated image, or undefined if generation fails
 */
export async function generateImage(prompt: string) {
  try {
    return await XAIClient.generateImage(generateImagePrompt(prompt));
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined;
  }
} 