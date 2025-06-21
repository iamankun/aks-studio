// Tôi là An Kun
"use server";
import { neon } from "@neondatabase/serverless"
import { createClient } from '@supabase/supabase-js';
import { ensureDefaultAdminUser } from "@/lib/data/user";

// Định nghĩa một interface cho dữ liệu đầu vào của postData
interface SongInputData {
  title: string;
  artistId: string; // Hoặc một kiểu ID cụ thể hơn
  filePathUrl: string;
  // Thêm các trường bắt buộc khác ở đây
}

// Sử dụng biến môi trường đúng cho aksstudio
export async function getData() {
  // Tôi là An Kun
  const sql = neon(process.env.DATABASE_URL ?? process.env.aksstudio_POSTGRES_URL!, { // Ưu tiên DATABASE_URL chuẩn
    disableWarningInBrowsers: true
  })
  const data = await sql`SELECT 1`
  return data
}

export async function postData(data: SongInputData) {
  // Tôi là An Kun

  await ensureDefaultAdminUser()
}
