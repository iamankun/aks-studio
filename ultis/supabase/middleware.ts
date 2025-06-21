//Tôi là An Kun
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = (request: NextRequest) => {
  // This function will be used by the actual middleware to create a Supabase client.
  // The response object will be handled by the middleware itself.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the set method is called from a Server Component, ignore it
          // This is an example of how to handle this scenario.
          // The actual response object to set cookies on will be managed by the middleware.
          // For now, this utility doesn't directly modify the response.
          // The middleware using this client will handle setting cookies on the actual response.
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // Similar to set, the middleware will handle removing cookies from the actual response.
          request.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
};
