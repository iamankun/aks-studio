import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const createClient = (request: NextRequest) => {
  // Tạo một đối tượng response để có thể sửa đổi cookie
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Chỉ sửa đổi cookie trên response
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // Chỉ sửa đổi cookie trên response
          response.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
};