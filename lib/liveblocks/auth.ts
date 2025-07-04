"use server";

import { liveblocks } from "@/liveblocks.server.config";
import { cookies } from "next/headers";

export async function authorizeLiveblocks() {
    try {
        // Lấy thông tin người dùng từ localStorage (client-side)
        // Lưu ý: Đây là server component nên chúng ta cần tìm cách khác để lấy thông tin người dùng
        // Ví dụ: có thể sử dụng cookies hoặc session

        // Đây là một ví dụ đơn giản, bạn nên thay đổi để phù hợp với hệ thống xác thực của bạn
        const cookieStore = cookies();
        const userCookie = cookieStore.get('currentUser');

        if (!user) {
            return {
                error: {
                    code: 401,
                    message: "Unauthorized",
                    suggestion: "Bạn cần đăng nhập để sử dụng tính năng này",
                },
            };
        }

        // Lấy thông tin cơ bản của người dùng
        const userInfo = {
            name: user.name || user.email?.split("@")[0] || "Người dùng",
            avatar: user.avatar || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`,
            color: user.color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };

        // Tạo access token cho người dùng
        const session = liveblocks.prepareSession(user.id, {
            userInfo,
        });

        // Cho phép truy cập vào tất cả các phòng mà người dùng có quyền
        // Trong thực tế, bạn nên kiểm tra quyền truy cập cho từng phòng
        session.allow("*", session.FULL_ACCESS);

        // Tạo token
        const { token } = await session.authorize();

        return {
            data: {
                token,
            },
        };
    } catch (error) {
        console.error("Lỗi khi authorize Liveblocks:", error);
        return {
            error: {
                code: 500,
                message: "Internal Server Error",
                suggestion: "Vui lòng thử lại sau",
            },
        };
    }
}
