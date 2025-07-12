"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    type BackgroundSettings,
    BACKGROUND_SETTINGS_KEY,
    DEFAULT_BACKGROUND_SETTINGS,
} from "@/lib/constants"

const DEFAULT_VIDEOS = [
    "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
    "kJQP7kiw5Fk", // Despacito
    "fJ9rUzIMcZQ", // Bohemian Rhapsody
    "9bZkp7q19f0", // Gangnam Style
    "hTWKbfoikeg", // Smells Like Teen Spirit
    "YQHsXMglC9A", // Hello - Adele
    "CevxZvSJLk8", // Katy Perry - Roar
    "JGwWNGJdvx8", // Shape of You
    "RgKAFK5djSk", // Wiz Khalifa - See You Again
    "OPf0YbXqDm0", // Mark Ronson - Uptown Funk
]

interface BackgroundSettingsPanelProps {
    onClose?: () => void;
}

export function BackgroundSettingsPanel({ onClose }: Readonly<BackgroundSettingsPanelProps>) {
    const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS)
    const [showCustomPanel, setShowCustomPanel] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [overlayOpacity, setOverlayOpacity] = useState("0.5")

    useEffect(() => {
        // Load background settings
        const saved = localStorage.getItem(BACKGROUND_SETTINGS_KEY)
        if (saved) {
            const settings = JSON.parse(saved)
            // Ensure all required properties have default values
            const mergedSettings = {
                ...DEFAULT_BACKGROUND_SETTINGS,
                ...settings
            }
            setBackgroundSettings(mergedSettings)
            setYoutubeUrl(mergedSettings.videoUrl ?? "")
            setOverlayOpacity(mergedSettings.opacity?.toString() ?? "0.5")
        }
    }, [])

    const saveSettings = () => {
        try {
            const newSettings = {
                ...backgroundSettings,
                opacity: parseFloat(overlayOpacity),
                videoUrl: youtubeUrl || backgroundSettings.videoUrl,
            }
            localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(newSettings))
            setBackgroundSettings(newSettings)
            // Gửi sự kiện với tên và dữ liệu chính xác
            window.dispatchEvent(new CustomEvent("backgroundUpdate", { detail: newSettings }))
        } catch (error) {
            console.error("Failed to save background settings:", error)
        }
    }

    // Update video settings when URL changes
    const handleVideoUrlChange = (url: string) => {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        const match = regex.exec(url)
        const videoId = match ? match[1] : url

        if (videoId) {
            setYoutubeUrl(videoId)
            setBackgroundSettings(prev => ({
                ...prev,
                type: "video" as const,
                videoUrl: videoId,
                randomVideo: false
            }))
        }
    }

    // Update background settings when opacity changes
    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newOpacity = e.target.value
        setOverlayOpacity(newOpacity)
        setBackgroundSettings(prev => ({
            ...prev,
            opacity: parseFloat(newOpacity)
        }))
    }

    // Update video random mode and video list
    const updateVideoSettings = (randomVideo: boolean) => {
        setBackgroundSettings(prev => ({
            ...prev,
            randomVideo,
            videoList: randomVideo ? DEFAULT_VIDEOS : []
        }))
    }

    // Update sound settings
    const updateSoundSettings = (enableSound: boolean) => {
        setBackgroundSettings(prev => ({
            ...prev,
            enableSound
        }))
    }

    // Hàm xóa video khỏi danh sách
    const removeVideo = (idToRemove: string) => {
        setBackgroundSettings(prev => ({
            ...prev,
            videoList: prev.videoList.filter(id => id !== idToRemove)
        }))
    }

    return (
        <div className="fixed top-16 right-4 z-50">
            <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Tùy chỉnh nền</h3>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={() => setShowCustomPanel(!showCustomPanel)}
                    >
                        {showCustomPanel ? "Đơn giản" : "Nâng cao"}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="opacity" className="block text-sm font-medium text-gray-200">
                            Độ mờ nền
                            <span className="text-xs text-gray-400 ml-2">&nbsp;({Math.round(Number(overlayOpacity) * 100)}%)</span>
                        </label>
                        <input
                            id="opacity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={overlayOpacity}
                            onChange={handleOpacityChange}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="backgroundType" className="block text-sm font-medium text-gray-200">
                            Loại nền
                        </label>
                        <select
                            id="backgroundType"
                            value={backgroundSettings.type}
                            onChange={(e) => {
                                const newType = e.target.value as "gradient" | "video"
                                setBackgroundSettings(prev => ({ ...prev, type: newType }))
                            }}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
                        >
                            <option value="gradient">Nền gradient</option>
                            <option value="video">Video nền</option>
                        </select>
                    </div>

                    {backgroundSettings.type === "video" && (
                        <div className="space-y-4 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="randomVideo"
                                        type="checkbox"
                                        checked={backgroundSettings.randomVideo}
                                        onChange={(e) => updateVideoSettings(e.target.checked)}
                                        className="rounded border-gray-600"
                                    />
                                    <label htmlFor="randomVideo" className="text-sm text-gray-300">
                                        Video ngẫu nhiên
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="enableSound"
                                        type="checkbox"
                                        checked={backgroundSettings.enableSound}
                                        onChange={(e) => updateSoundSettings(e.target.checked)}
                                        className="rounded border-gray-600"
                                    />
                                    <label htmlFor="enableSound" className="text-sm text-gray-300">
                                        Bật âm thanh
                                    </label>
                                </div>
                            </div>

                            {showCustomPanel && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-200">
                                            YouTube Video ID hoặc URL
                                        </label>
                                        <input
                                            id="youtubeUrl"
                                            type="text"
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                            placeholder="Ví dụ: dQw4w9WgXcQ"
                                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
                                        />
                                        <Button
                                            onClick={() => handleVideoUrlChange(youtubeUrl)}
                                            className="w-full mt-2"
                                            size="sm"
                                        >
                                            Áp dụng video
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="videoList" className="block text-sm font-medium text-gray-200">
                                            Danh sách video ngẫu nhiên
                                        </label>
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {backgroundSettings.videoList.map((id, index) => (
                                                <div key={id} className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-400">{index + 1}.</span>
                                                    <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded flex-1">
                                                        {id}
                                                    </code>
                                                    <button
                                                        onClick={() => removeVideo(id)}
                                                        className="text-red-400 hover:text-red-300 p-1"
                                                        title="Xóa video này"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            onClick={saveSettings}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Lưu cài đặt
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
