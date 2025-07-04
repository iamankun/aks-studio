import { Liveblocks } from "@liveblocks/node";

// Liveblocks secret key
export const SECRET_API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

export const liveblocks = new Liveblocks({
    secret: SECRET_API_KEY
});

// Kiểm tra nếu code đang chạy trên client
if (typeof window !== "undefined") {
    console.error(
        "CẢNH BÁO: Bạn đang sử dụng dữ liệu từ /liveblocks.server.config.ts trên client"
    );
    console.error("Điều này có thể làm lộ secret key của bạn");
}

// Kiểm tra secret key
if (!SECRET_API_KEY) {
    console.warn(`Bạn nên thêm Liveblocks secret key vào .env.local để sử dụng Liveblocks

Ví dụ .env.local:
LIVEBLOCKS_SECRET_KEY=sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
LIVEBLOCKS_PUBLIC_KEY=pk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Bạn có thể tìm secret key tại https://liveblocks.io/dashboard/apikeys
`);
}
