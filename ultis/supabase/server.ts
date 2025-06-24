import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be set in environment variables.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(setCookies) {
          const cookieStore = await cookies();
          for (const { name, value, options } of setCookies) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error("Error setting cookie in server component:", error);
            }
          }
        },
      },
    }
  );
};