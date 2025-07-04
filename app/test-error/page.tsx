"use client"

import { DynamicBackground } from "@/components/dynamic-background"

export default function TestErrorPage() {
    const triggerError = () => {
        throw new Error("Test error for 505 page")
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Dynamic Background System */}
            <DynamicBackground />

            <div className="relative z-10 text-center text-white backdrop-blur-sm bg-black/20 p-8 rounded-lg">
                <h1 className="text-4xl font-bold mb-4">Test Error Page</h1>
                <p className="mb-8">Click button below to test 505 error page</p>
                <button
                    onClick={triggerError}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                    Trigger Error (Test 505)
                </button>
                <div className="mt-6">
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                        ← Về trang chủ
                    </a>
                </div>
            </div>
        </div>
    )
}
