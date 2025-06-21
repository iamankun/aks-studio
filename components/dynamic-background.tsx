//Tôi là An Kun
"use client"

import { useState, useEffect } from "react"

// Định nghĩa kiểu dữ liệu cho cài đặt background để nhất quán với settings-view.tsx
interface BackgroundSettings {
    type: "gradient" | "video"
    gradient: string
    videoUrl: string
    opacity: number
    randomVideo: boolean
    videoList: string[]
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
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)

        const loadSettings = () => {
            const savedSettings = localStorage.getItem("backgroundSettings_v2")
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings))
            } else {
                // Cài đặt mặc định nếu chưa có trong localStorage
                setSettings({
                    type: "gradient",
                    gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    videoUrl: "",
                    opacity: 0.3,
                    randomVideo: true,
                    videoList: ["dQw4w9WgXcQ"],
                })
            }
        }

        loadSettings()

        // Lắng nghe sự kiện cập nhật background từ trang Settings
        const handleBackgroundUpdate = (event: CustomEvent<BackgroundSettings>) => {
            setSettings(event.detail)
        }

        window.addEventListener("backgroundUpdate", handleBackgroundUpdate as EventListener)

        return () => {
            window.removeEventListener("backgroundUpdate", handleBackgroundUpdate as EventListener)
        }
    }, [])

    if (!isClient || !settings) {
        // Render một background tĩnh mặc định để tránh lỗi hydration
        return <div className="fixed inset-0 -z-10 bg-slate-900" />
    }

    const videoId = settings.randomVideo ? getRandomVideoId(settings.videoList) : getYouTubeId(settings.videoUrl)

    return (
        <div className="fixed inset-0 -z-10">
            {settings.type === "video" && videoId ? (
                <div className="absolute inset-0 overflow-hidden">
                    <iframe
                        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&autohide=1&modestbranding=1&iv_load_policy=3`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="YouTube Background Video"
                    ></iframe>
                </div>
            ) : (
                <div className="absolute inset-0" style={{ background: settings.gradient }}></div>
            )}
            {/* Lớp phủ để điều chỉnh độ mờ và ngăn tương tác */}
            <div className="absolute inset-0 bg-black" style={{ opacity: 1 - settings.opacity }}></div>
        </div>
    )
}