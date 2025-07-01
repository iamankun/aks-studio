import sharp from "sharp";
import { multiDB } from "./multi-database-service";

type UploadResult = {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
};

// Upload avatar vào cơ sở dữ liệu PostgreSQL
export async function uploadAvatarToDatabase(file: File, userId: string, userRole: string): Promise<UploadResult> {
    try {
        // Xác định bảng người dùng dựa vào role
        const userTable = userRole === "Label Manager" ? "label_manager" : "artist";

        // Đọc và xử lý file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Lấy định dạng MIME của file gốc hoặc mặc định là image/jpeg
        const mimeType = file.type || "image/jpeg";
        console.log(`Uploading file type: ${mimeType}`);

        // Resize ảnh thành 300x300
        let processedBuffer: Buffer;
        try {
            processedBuffer = await sharp(buffer)
                .resize(300, 300, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (resizeError) {
            console.error("Resize failed, using original:", resizeError);
            processedBuffer = buffer; // Sử dụng buffer gốc nếu resize thất bại
        }

        // Lưu vào cơ sở dữ liệu
        const result = await multiDB.updateUserAvatar(
            processedBuffer,
            userId,
            userTable as 'artist' | 'label_manager',
            mimeType
        );
        return result;
    } catch (error) {
        console.error("Database avatar upload error:", error);
        return {
            success: false,
            error: `Lỗi lưu vào database: ${(error as Error).message}`
        };
    }
}
