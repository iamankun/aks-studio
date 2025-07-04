"use client";

import React from "react";
import { LiveblocksProviderWrapper, LiveblocksRoom } from "@/components/liveblocks/liveblocks-providers";
import { Whiteboard } from "@/components/liveblocks/whiteboard";

export default function WhiteboardPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Bảng ghi chú cộng tác</h1>
            <p className="mb-4">
                Đây là một bảng ghi chú cộng tác thời gian thực. Bạn có thể thấy con trỏ chuột của người dùng khác và các ghi chú mà họ tạo.
            </p>

            <LiveblocksProviderWrapper>
                <LiveblocksRoom roomId="whiteboard-demo">
                    <Whiteboard />
                </LiveblocksRoom>
            </LiveblocksProviderWrapper>

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Hướng dẫn sử dụng</h2>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Nhấn "Tạo ghi chú mới" để thêm ghi chú</li>
                    <li>Nhấn dấu "×" để xóa ghi chú</li>
                    <li>Bạn có thể thấy con trỏ chuột của người dùng khác trên bảng</li>
                </ul>
            </div>
        </div>
    );
}
