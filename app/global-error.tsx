"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function GlobalError({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string }
    reset: () => void
}>) {
    return (
        <html lang="vi">
            <body className="bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950 text-white min-h-screen flex items-center justify-center relative">
                {/* Logo và nhận diện thương hiệu */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <Image src="/face.png" alt="AKs Studio" width={56} height={56} className="rounded-full border-2 border-purple-500 shadow-lg" />
                    <span className="mt-2 text-lg font-bold tracking-wide text-purple-300">AKs Studio</span>
                </div>
                <div className="text-center max-w-md mx-auto p-6 bg-black/60 rounded-xl shadow-2xl border border-gray-800 backdrop-blur-md">
                    <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6 animate-bounce" />
                    <h1 className="text-4xl font-bold text-red-400 mb-4">Đã xảy ra lỗi nghiêm trọng</h1>
                    <p className="text-gray-300 mb-6">
                        Một lỗi không thể phục hồi đã xảy ra. Vui lòng thử lại hoặc quay về trang chủ.
                    </p>

                    {error.digest && (
                        <div className="bg-gray-800/50 rounded p-3 mb-4">
                            <p className="text-xs text-gray-400">Mã lỗi: {error.digest}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={reset}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Thử lại
                        </Button>
                        <Button
                            onClick={() => window.location.href = "/"}
                            variant="outline"
                            className="w-full"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Về trang chủ
                        </Button>
                    </div>

                    <div className="mt-6 text-xs text-gray-500">
                        <p>AKs Studio &copy; {new Date().getFullYear()} &ndash; Digital Music Distribution</p>
                        <p className="mt-1">Phiên bản: v2.0.0</p>
                    </div>
                </div>
            </body>
        </html>
    )
}
