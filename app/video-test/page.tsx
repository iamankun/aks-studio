"use client"

import { DynamicBackground } from "@/components/dynamic-background"

export default function VideoTestPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Dynamic Background System with Sound */}
            <DynamicBackground />

            {/* Content */}
            <div className="relative z-10 text-center text-white backdrop-blur-sm bg-black/30 p-8 rounded-lg">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Video Background Test
                </h1>
                <h2 className="text-2xl font-semibold mb-6">Test trang video background với âm thanh</h2>
                <div className="space-y-4 text-lg">
                    <p>✅ Video background sẽ auto play</p>
                    <p>🔊 Click nút âm thanh ở góc phải dưới để bật/tắt sound</p>
                    <p>🎨 Click nút tùy chỉnh ở góc phải trên để thay đổi video</p>
                    <p>📺 Sử dụng YouTube URLs để thay đổi video background</p>
                </div>

                <div className="mt-8 space-x-4">
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                        Về trang chủ
                    </a>
                    <a
                        href="/404"
                        className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        Test 404 Page
                    </a>
                    <a
                        href="/test-error"
                        className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                    >
                        Test 505 Error
                    </a>
                </div>
            </div>
        </div>
    )
}
