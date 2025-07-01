// Storage service for file upload
import path from "path"
import fs from "fs/promises"
import sharp from "sharp" // Thêm thư viện sharp để xử lý ảnh

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

// Constants for file limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg'];
const ALLOWED_AUDIO_TYPES = ['audio/wav'];

// Helper to sanitize file/folder names
function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9-_]/g, "_")
}

// Validate file type and size
function validateFile(file: File, type: 'audio' | 'image'): { valid: boolean; error?: string } {
  if (type === 'image') {
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: `Kích thước ảnh vượt quá giới hạn (tối đa ${MAX_IMAGE_SIZE / 1024 / 1024}MB)` };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: `Loại file ảnh không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
    }
  } else if (type === 'audio') {
    if (file.size > MAX_AUDIO_SIZE) {
      return { valid: false, error: `Kích thước file âm thanh vượt quá giới hạn (tối đa ${MAX_AUDIO_SIZE / 1024 / 1024}MB)` };
    }
    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && file.type !== '') {
      return { valid: false, error: `Loại file âm thanh không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_AUDIO_TYPES.join(', ')}` };
    }
  }
  return { valid: true };
}

// Check if directory exists and create if it doesn't
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Hàm xử lý crop ảnh về tỷ lệ 1:1
async function cropImageToSquare(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    // Lấy kích thước nhỏ nhất (chiều rộng hoặc chiều cao)
    const size = Math.min(metadata.width || 0, metadata.height || 0);

    // Nếu ảnh đã là hình vuông, không cần crop
    if ((metadata.width === metadata.height) || size === 0) {
      return inputBuffer;
    }

    // Tính toán vị trí cắt để giữ phần giữa của ảnh
    const left = metadata.width && metadata.width > size
      ? Math.floor((metadata.width - size) / 2)
      : 0;

    const top = metadata.height && metadata.height > size
      ? Math.floor((metadata.height - size) / 2)
      : 0;

    // Crop ảnh thành hình vuông
    return await image
      .extract({ left, top, width: size, height: size })
      .toBuffer();
  } catch (error) {
    console.error("Error cropping image:", error);
    // Nếu có lỗi, trả về buffer gốc
    return inputBuffer;
  }
}

// file: File (from Next.js API route), userId: string, artistName: string, songTitle: string, isrc: string
export async function uploadAudioFile(file: File, userId: string, artistName?: string, songTitle?: string, isrc?: string): Promise<UploadResult> {
  try {
    // Validate inputs
    if (!artistName || !songTitle || !isrc) {
      return { success: false, error: "Missing required fields: artistName, songTitle, or isrc" };
    }

    // Validate file
    const validation = validateFile(file, 'audio');
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create directory structure
    const artistDir = safeName(artistName);
    const songDir = safeName(songTitle);
    const baseDir = path.join(process.cwd(), "public", "uploads", artistDir, songDir);

    try {
      await ensureDirectoryExists(baseDir);
    } catch (error) {
      console.error("Error creating directory:", error);
      return { success: false, error: `Không thể tạo thư mục lưu trữ: ${(error as Error).message}` };
    }

    // Determine file extension from file type or default to .wav
    let ext = '.wav';
    if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
      ext = '.mp3';
    }

    const fileName = `${isrc}${ext}`;
    const filePath = path.join(baseDir, fileName);

    // Write file
    try {
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("Error writing file:", error);
      return { success: false, error: `Không thể lưu file: ${(error as Error).message}` };
    }

    const url = `/uploads/${artistDir}/${songDir}/${fileName}`;
    return { success: true, url, key: url };
  } catch (error) {
    console.error("Upload audio error:", error);
    return { success: false, error: `Lỗi không xác định: ${(error as Error).message}` };
  }
}

export async function uploadImageFile(file: File, userId: string, artistName?: string, songTitle?: string, isrc?: string): Promise<UploadResult> {
  try {
    // Validate inputs
    if (!artistName || !songTitle || !isrc) {
      return { success: false, error: "Missing required fields: artistName, songTitle, or isrc" };
    }

    // Validate file
    const validation = validateFile(file, 'image');
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Create directory structure
    const artistDir = safeName(artistName);
    const songDir = safeName(songTitle);
    const baseDir = path.join(process.cwd(), "public", "uploads", artistDir, songDir);

    try {
      await ensureDirectoryExists(baseDir);
    } catch (error) {
      console.error("Error creating directory:", error);
      return { success: false, error: `Không thể tạo thư mục lưu trữ: ${(error as Error).message}` };
    }

    // Determine file extension from file type or default to .jpg
    let ext = '.jpg';
    if (file.type === 'image/png') {
      ext = '.png';
    }

    const fileName = `${isrc}${ext}`;
    const filePath = path.join(baseDir, fileName);

    // Write file
    try {
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    } catch (error) {
      console.error("Error writing file:", error);
      return { success: false, error: `Không thể lưu file: ${(error as Error).message}` };
    }

    // Crop image to square
    try {
      const inputBuffer = await fs.readFile(filePath);
      const croppedBuffer = await cropImageToSquare(inputBuffer);
      await fs.writeFile(filePath, croppedBuffer);
    } catch (error) {
      console.error("Error processing image:", error);
      return { success: false, error: `Không thể xử lý ảnh: ${(error as Error).message}` };
    }

    const url = `/uploads/${artistDir}/${songDir}/${fileName}`;
    return { success: true, url, key: url };
  } catch (error) {
    console.error("Upload image error:", error);
    return { success: false, error: `Lỗi không xác định: ${(error as Error).message}` };
  }
}

// Upload user avatar: lưu vào /uploads/@artist/Avatar/avatar1.jpg, avatar2.jpg,...
// Không giới hạn kích thước avatar và tự động crop về 1:1
export async function uploadUserAvatar(file: File, artistName: string): Promise<UploadResult> {
  try {
    if (!artistName) {
      return { success: false, error: "Missing artistName" };
    }

    // Validate file type only, không validate kích thước
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: `Loại file ảnh không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
    }

    const artistDir = safeName(artistName);
    const avatarDir = path.join(process.cwd(), "public", "uploads", artistDir, "Avatar");

    try {
      await ensureDirectoryExists(avatarDir);
    } catch (error) {
      console.error("Error creating avatar directory:", error);
      return { success: false, error: `Không thể tạo thư mục lưu trữ avatar: ${(error as Error).message}` };
    }

    // Tìm số thứ tự file mới
    let index = 1;
    let fileName = `avatar${index}.jpg`;
    let filePath = path.join(avatarDir, fileName);

    while (true) {
      try {
        await fs.access(filePath);
        index++;
        fileName = `avatar${index}.jpg`;
        filePath = path.join(avatarDir, fileName);
      } catch {
        break;
      }
    }

    // Convert file to buffer and crop to square
    try {
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Crop ảnh thành hình vuông 1:1
      console.log(`🔄 Cropping avatar to 1:1 ratio (original size: ${file.size} bytes)`);
      const croppedBuffer = await cropImageToSquare(inputBuffer);
      console.log(`✂️ Avatar cropped successfully (size after crop: ${croppedBuffer.length} bytes)`);

      // Lưu file đã crop
      await fs.writeFile(filePath, croppedBuffer);
    } catch (error) {
      console.error("Error processing or writing avatar file:", error);
      return { success: false, error: `Không thể xử lý hoặc lưu file avatar: ${(error as Error).message}` };
    }

    const url = `/uploads/${artistDir}/Avatar/${fileName}`;
    return { success: true, url, key: url };
  } catch (error) {
    console.error("Upload avatar error:", error);
    return { success: false, error: `Lỗi không xác định: ${(error as Error).message}` };
  }
}
