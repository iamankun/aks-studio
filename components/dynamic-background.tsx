//Tôi là An Kun
"use client"
import { useState, useEffect, useMemo } from "react"
import {
    type BackgroundSettings,
    BACKGROUND_SETTINGS_KEY,
    DEFAULT_BACKGROUND_SETTINGS,
} from "@/lib/constants" // Import từ file constants

// Khai báo kiểu sự kiện toàn cục để tăng cường type safety
declare global {
    interface WindowEventMap {
        "backgroundUpdate": CustomEvent<BackgroundSettings>;
    }
}

// Hàm lấy ID video ngẫu nhiên từ danh sách
const getRandomVideoId = (videoList: string[]): string => {
    if (!videoList || videoList.length === 0) {
        return "dQw4w9WgXcQ" // Một video mặc định an toàn
    }
    const randomIndex = Math.floor(Math.random() * videoList.length)
    return videoList[randomIndex]
}

// Hàm trích xuất ID từ URL YouTube
const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
}

export function DynamicBackground() {
    const [settings, setSettings] = useState<BackgroundSettings | null>(null)

    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedSettings = localStorage.getItem(BACKGROUND_SETTINGS_KEY)
                if (savedSettings) {
                    setSettings(JSON.parse(savedSettings))
                } else {
                    // Sử dụng cài đặt mặc định từ file constants
                    setSettings(DEFAULT_BACKGROUND_SETTINGS)
                }
            } catch (error) {
                console.error("Failed to load or parse background settings:", error)
                setSettings(DEFAULT_BACKGROUND_SETTINGS) // Fallback về mặc định nếu có lỗi
            }
        }

        loadSettings()

        // Lắng nghe sự kiện cập nhật background từ trang Settings
        const handleBackgroundUpdate = (event: CustomEvent<BackgroundSettings>) => setSettings(event.detail)

    }

        window.addEventListener("backgroundUpdate", handleBackgroundUpdate as EventListener)

    return () => window.removeEventListener("backgroundUpdate", handleBackgroundUpdate)
}, [])

// Memoize giá trị videoId để tránh tính toán lại không cần thiết
const videoId = useMemo(() => {
    if (!settings) return null
    return settings.randomVideo ? getRandomVideoId(settings.videoList) : getYouTubeId(settings.videoUrl)
}, [settings?.randomVideo, settings?.videoUrl, settings?.videoList])

if (!settings) {
    // Render một background tĩnh mặc định trong khi chờ settings được tải.
    return <div className="fixed inset-0 -z-10" style={{ background: DEFAULT_BACKGROUND_SETTINGS.gradient }} />
}
return (
    <div className="fixed inset-0 -z-10">
        {settings.type === "video" && videoId ? (
            <div className="absolute inset-0 overflow-hidden">
                <iframe
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&modestbranding=1&iv_load_policy=3`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    title="YouTube Background Video"
                ></iframe>
            </div>
        ) : (
            <div className="absolute inset-0" style={{ background: settings.gradient }}></div>
        )}
        <div className="absolute inset-0 bg-black" style={{ opacity: 1 - settings.opacity }}></div>
    </div>
)
}
