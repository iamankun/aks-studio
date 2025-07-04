// Tôi là An Kun
"use server";
import { neon } from "@neondatabase/serverless"
import { ensureDefaultAdminUser } from "@/lib/server-actions";

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
  const sql = neon(process.env.DATABASE_URL, {
    disableWarningInBrowsers: true
  })
  const data = await sql`SELECT 1`
  return data
}

export async function postData(data: SongInputData) {
  // Tôi là An Kun

  await ensureDefaultAdminUser()
}
