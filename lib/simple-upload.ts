import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

type UploadResult = {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
};

// Đảm bảo tên file an toàn cho hệ thống tệp
function safeName(name: string): string {
    return name
        .replace(/[^\w\s-]/g, "") // Loại bỏ ký tự đặc biệt
        .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng gạch ngang
        .toLowerCase();
}

// Đảm bảo thư mục tồn tại
async function ensureDirectoryExists(dir: string): Promise<void> {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Tải lên avatar đơn giản - không xử lý phức tạp
export async function simpleUploadAvatar(file: File, artistName: string): Promise<UploadResult> {
    try {
        const fileName = `avatar-${Date.now()}.jpg`;
        const publicDir = path.join(process.cwd(), "public");
        const uploadDir = path.join(publicDir, "uploads");
        const artistDir = path.join(uploadDir, safeName(artistName));
        const avatarDir = path.join(artistDir, "Avatar");

        console.log(`Creating directory: ${avatarDir}`);
        await ensureDirectoryExists(avatarDir);

        const filePath = path.join(avatarDir, fileName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Lưu file gốc trước
        await fs.writeFile(filePath, buffer);
        console.log(`Raw file saved to ${filePath}`);

        // Cố gắng tạo bản thu nhỏ
        try {
            const resizedImage = await sharp(buffer)
                .resize(300, 300, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Ghi đè lên file gốc với bản đã resize
            await fs.writeFile(filePath, resizedImage);
            console.log("Image resized successfully");
        } catch (resizeError) {
            console.error("Resize failed, keeping original:", resizeError);
            // Giữ nguyên file gốc nếu resize thất bại
        }

        const relativePath = path.join("uploads", safeName(artistName), "Avatar", fileName);
        const url = "/" + relativePath.replace(/\\/g, "/");

        return {
            success: true,
            url,
            key: url
        };
    } catch (error) {
        console.error("Simple upload avatar error:", error);
        return {
            success: false,
            error: `Lỗi không xác định: ${(error as Error).message}`
        };
    }
}
