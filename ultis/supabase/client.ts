import { createBrowserClient } from '@supabase/ssr'

// Định nghĩa một hàm để tạo Supabase client cho các hoạt động phía client
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be set in environment variables.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}