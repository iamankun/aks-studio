"use client";

import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider } from "@/liveblocks.config";
import { LiveMap } from "@liveblocks/client";

// Liveblocks client key (public)
const PUBLIC_KEY = process.env.LIVEBLOCKS_PUBLIC_KEY || "pk_dev_123";

interface LiveblocksProviderWrapperProps {
    children: ReactNode;
}

export function LiveblocksProviderWrapper({ children }: LiveblocksProviderWrapperProps) {
    return (
        <LiveblocksProvider
            publicApiKey={PUBLIC_KEY}
            throttle={16} // 60fps
        >
            {children}
        </LiveblocksProvider>
    );
}

interface LiveblocksRoomProps {
    roomId: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function LiveblocksRoom({ roomId, children, fallback }: LiveblocksRoomProps) {
    // Mặc định sử dụng ID người dùng ẩn danh nếu không có xác thực
    const defaultUserInfo = {
        name: "Người dùng ẩn danh",
        avatar: `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };

    return (
        <RoomProvider
            id={roomId}
            // @ts-ignore - Ignore type errors due to our simple configuration
            initialPresence={{ cursor: null }}
            // @ts-ignore - Ignore type errors due to our simple configuration
            initialStorage={{ notes: new LiveMap() }}
            // Thêm thông tin người dùng để hiển thị trong giao diện cộng tác
            // Trong thực tế, bạn nên lấy thông tin từ hệ thống xác thực
            defaultUserInfo={defaultUserInfo}
        >
            <ClientSideSuspense fallback={fallback || <div>Đang tải...</div>}>
                {() => children}
            </ClientSideSuspense>
        </RoomProvider>
    );
}
