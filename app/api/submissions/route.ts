// Ví dụ: c:\Users\admin\aksstudio\app\api\submissions\route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Submission } from '@/types/submission'; // Đảm bảo type này khớp với DB

// Khởi tạo Supabase client (sử dụng service role key để có toàn quyền truy cập DB từ server)
// Bạn nên lưu các key này trong biến môi trường phía server, không phải NEXT_PUBLIC_

export async function GET(request: Request) {
  const supabaseUrl = process.env.aksstudio_SUPABASE_URL;
  const supabaseServiceKey = process.env.aksstudio_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Key is not defined in environment variables.');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi cấu hình server: Supabase URL hoặc Service Key không được định nghĩa.', 
        error: 'Missing Supabase credentials on the server.' 
      },
      { status: 500 }
    );
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { data, error } = await supabase
      .from('submissions') // Tên bảng submissions của bạn
      .select('*')
      .order('created_at', { ascending: false }); // Sử dụng cột 'created_at' hoặc tên cột ngày tháng đúng của bạn

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ success: false, message: 'Lỗi lấy dữ liệu submissions.', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data as Submission[] });
  } catch (error: any) {
    console.error('API Error fetching submissions:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lấy submissions.', error: error.message }, { status: 500 });
  }
}
