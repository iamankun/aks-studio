// File: c:\Users\admin\aksstudio\app\api\data\route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@neondatabase/neon-js';
import type { FileItem } from '@/types/file-item'; // Hoặc đường dẫn đúng đến type FileItem
import { formatFileSize } from '@/lib/utils'; // Import từ utils

const BUCKET_NAME = 'aksstudio'; // Tên bucket của bạn

// Helper để chuyển đổi định dạng
function toFileItem(Neon: any, basePathParts: string[]): FileItem {
  const isFolder = !Neon.id && Neon.name; // Supabase list() trả về id là null cho folder
  let fileType: FileItem['type'] = 'other';
  if (isFolder) {
    fileType = 'folder';
  } else if (Neon.name.endsWith('.pdf')) {
    fileType = 'pdf';
  } else if (Neon.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
    fileType = 'image';
  } // Thêm các loại khác nếu cần

  return {
    id: Neon.id ?? Neon.name, // Dùng name làm id cho folder nếu id null
    name: Neon.name,
    type: fileType,
    size: Neon.metadata?.size ? formatFileSize(Neon.metadata.size) : '', // Cần hàm formatFileSize
    items: undefined, // Sẽ cần logic riêng để đếm item trong folder nếu muốn hiển thị
    modified: Neon.metadata?.lastModified ? new Date(Neon.metadata.lastModified) : new Date(),
    path: basePathParts,
  };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pathParam = searchParams.get('path') || ''; // Ví dụ: "Home/Documents" hoặc "" cho root

  const neonUrl = process.env.aksstudio_NEON_URL;
  const neonServiceKey = process.env.aksstudio_NEON_SERVICE_ROLE_KEY;

  if (!neonUrl || !neonServiceKey) {
    console.error('Neon URL or Service Key is not defined in environment variables for /api/data.');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi cấu hình server: Neon URL hoặc Service Key không được định nghĩa.',
        error: 'Missing Neon credentials on the server.' 
      },
      { status: 500 }
    );
  }
  const neon = createClient(neonUrl, neonServiceKey);

  try {
    const { data, error } = await neon
      .storage
      .from(BUCKET_NAME)
      .list(pathParam, { // pathParam có thể là "" cho root, hoặc "folderName"
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`Error listing files for path "${pathParam}":`, error);
      return NextResponse.json({ success: false, message: 'Lỗi lấy danh sách file.', error: error.message }, { status: 500 });
    }

    const basePathParts = pathParam ? pathParam.split('/').filter(p => p) : [];
    const fileItems = data ? data.map(file => toFileItem(file, basePathParts)) : [];

    return NextResponse.json({ success: true, data: fileItems });
  } catch (error: any) {
    console.error(`API Error listing files for path "${pathParam}":`, error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lấy danh sách file.', error: error.message }, { status: 500 });
  }
}
