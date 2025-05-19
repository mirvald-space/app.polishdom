import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Создает Blob из строки Base64
 * @param base64Data - закодированные данные в формате base64
 * @param contentType - MIME-тип данных (например, "audio/mpeg")
 * @returns {Blob} - Blob-объект и URL для доступа к нему
 */
export function createBlobFromBase64(base64Data: string, contentType: string): { blob: Blob, url: string } {
  const binaryData = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(binaryData.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }
  
  const blob = new Blob([uint8Array], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  return { blob, url };
}

/**
 * Стандартные заголовки для API-ответов
 */
export const API_RESPONSE_HEADERS = {
  json: {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
  },
  error: {
    "Content-Type": "application/json"
  }
};

/**
 * Создает стандартный API ответ
 * @param data - Данные для ответа
 * @param status - HTTP статус ответа (по умолчанию 200)
 * @returns {Response} - Стандартизированный ответ API
 */
export function createApiResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: API_RESPONSE_HEADERS.json
    }
  );
}

/**
 * Форматирует ответ с ошибкой API
 * @param error - Ошибка, которую нужно форматировать
 * @param status - HTTP статус ответа (по умолчанию 500)
 * @param message - Сообщение об ошибке (опционально)
 * @returns {Response} - Ответ с ошибкой
 */
export function formatErrorResponse(error: unknown, status = 500, message?: string): Response {
  console.error(`API Error (${status}):`, error);
  
  return new Response(
    JSON.stringify({
      error: message || "Произошла ошибка при обработке запроса",
      details: error instanceof Error ? error.message : "Unknown error"
    }),
    { 
      status, 
      headers: API_RESPONSE_HEADERS.error
    }
  );
}
