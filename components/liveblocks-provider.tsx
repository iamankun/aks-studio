"use client";

import { useEffect, useState } from "react";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { ClientSideSuspense } from "@liveblocks/react";

interface LiveblocksProviderWrapperProps {
    children: React.ReactNode;
}

export function LiveblocksProviderWrapper({
    children
}: LiveblocksProviderWrapperProps) {
    const { user } = useUser();
    const [hasLoaded, setHasLoaded] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setHasLoaded(true);
    }, []);

    if (!hasLoaded) {
        return null;
    }

    // Chỉ hiển thị Liveblocks khi người dùng đã đăng nhập
    if (!user) {
        return <>{children}</>;
    }

    // Tạo thông tin người dùng cho Liveblocks
    const userInfo = {
        name: user.name ?? user.email?.split("@")[0] ?? "Người dùng",
        avatar: user.avatar ?? `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`,
        color: user.color ?? `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };

    return (
        <LiveblocksProvider
            authEndpoint="/api/liveblocks-auth"
            throttle={16}
        >
            {pathname.includes("/collaborative") ? (
                <RoomProvider
                    id="my-collaborative-room"
                    initialPresence={{
                        cursor: null,
                        activeElement: undefined,
                    }}
                >
                    <ClientSideSuspense fallback={<div>Đang tải...</div>}>
                        {() => children}
                    </ClientSideSuspense>
                </RoomProvider>
            ) : (
                children
            )}
        </LiveblocksProvider>
    );
}
