import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

// Клиент для использования на стороне сервера
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Отсутствуют переменные окружения для Supabase');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Клиент для использования в серверных компонентах
export const supabase = createServerClient();

// Функция для получения строго типизированного клиента
export function getSupabaseClient() {
  return supabase;
} 