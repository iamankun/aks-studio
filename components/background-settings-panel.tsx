"use client"

import type React from "react"
import { useEffect, useState } from "react"
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

export function BackgroundSettingsPanel() {
    const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS)
    const [showCustomPanel, setShowCustomPanel] = useState(false)
    const [youtubeUrl, setYoutubeUrl] = useState("")
    const [imageLink, setImageLink] = useState("")

    useEffect(() => {
        // Load background settings
        const saved = localStorage.getItem(BACKGROUND_SETTINGS_KEY)
        if (saved) {
            const settings = JSON.parse(saved)
            setBackgroundSettings(settings)
        }
    }, [])

    const extractYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match ? match[1] : null
    }

    const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setYoutubeUrl(url)

        const videoId = extractYouTubeId(url)
        if (videoId) {
            const updatedSettings = {
                ...backgroundSettings,
                type: "video" as const,
                videoUrl: url,
                randomVideo: false,
            }
            setBackgroundSettings(updatedSettings)
            localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

            // Dispatch event to update background
            window.dispatchEvent(
                new CustomEvent("backgroundUpdate", {
                    detail: updatedSettings,
                }),
            )
        }
    }

    const handleImageLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        setImageLink(url)

        if (url) {
            const updatedSettings = {
                ...backgroundSettings,
                type: "gradient" as const,
                gradient: `url(${url})`,
            }
            setBackgroundSettings(updatedSettings)
            localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

            // Dispatch event to update background
            window.dispatchEvent(
                new CustomEvent("backgroundUpdate", {
                    detail: updatedSettings,
                }),
            )
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // In a real implementation, you would upload this file and get a URL
            alert("Video đã được tải lên và sẽ được xử lý sau")
        }
    }

    const updateGradient = (gradient: string) => {
        const updatedSettings = {
            ...backgroundSettings,
            type: "gradient" as const,
            gradient,
        }
        setBackgroundSettings(updatedSettings)
        localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

        // Dispatch event to update background
        window.dispatchEvent(
            new CustomEvent("backgroundUpdate", {
                detail: updatedSettings,
            }),
        )
    }

    const updateVideoSettings = (randomVideo: boolean, videoList?: string[]) => {
        const updatedSettings = {
            ...backgroundSettings,
            type: "video" as const,
            randomVideo,
            videoList: videoList || backgroundSettings.videoList,
        }
        setBackgroundSettings(updatedSettings)
        localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

        // Dispatch event to update background
        window.dispatchEvent(
            new CustomEvent("backgroundUpdate", {
                detail: updatedSettings,
            }),
        )
    }

    const updateOpacity = (opacity: number) => {
        const updatedSettings = {
            ...backgroundSettings,
            opacity,
        }
        setBackgroundSettings(updatedSettings)
        localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

        // Dispatch event to update background
        window.dispatchEvent(
            new CustomEvent("backgroundUpdate", {
                detail: updatedSettings,
            }),
        )
    }

    const updateSoundSettings = (enableSound: boolean) => {
        const updatedSettings = {
            ...backgroundSettings,
            enableSound,
        }
        setBackgroundSettings(updatedSettings)
        localStorage.setItem(BACKGROUND_SETTINGS_KEY, JSON.stringify(updatedSettings))

        // Dispatch event to update background
        window.dispatchEvent(
            new CustomEvent("backgroundUpdate", {
                detail: updatedSettings,
            }),
        )
    }

    return (
        <>
            {/* Custom Panel Button */}
            <button
                onClick={() => setShowCustomPanel(!showCustomPanel)}
                className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                title="Tùy chỉnh giao diện"
            >
                🎨
            </button>

            {/* Custom Panel */}
            {showCustomPanel && (
                <div className="fixed top-16 right-4 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">🎨 Tùy Chỉnh Background</h3>

                    {/* Background Type */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Loại Background</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => updateGradient("linear-gradient(135deg, #667eea 0%, #764ba2 100%)")}
                                className={`w-full p-2 text-left text-sm rounded border ${backgroundSettings.type === "gradient"
                                    ? "bg-purple-600 text-white border-purple-500"
                                    : "bg-gray-800 text-gray-200 border-gray-600"
                                    } hover:bg-purple-700`}
                            >
                                🎨 Gradient
                            </button>
                            <button
                                onClick={() => updateVideoSettings(true)}
                                className={`w-full p-2 text-left text-sm rounded border ${backgroundSettings.type === "video"
                                    ? "bg-purple-600 text-white border-purple-500"
                                    : "bg-gray-800 text-gray-200 border-gray-600"
                                    } hover:bg-purple-700`}
                            >
                                📺 Video
                            </button>
                        </div>
                    </div>

                    {/* Opacity Control */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Độ mờ: {backgroundSettings.opacity}</h4>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={backgroundSettings.opacity}
                            onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                            className="w-full"
                            title="Điều chỉnh độ mờ background"
                        />
                    </div>

                    {/* YouTube Integration */}
                    {backgroundSettings.type === "video" && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">📺 YouTube Background</h4>
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={handleYoutubeUrlChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm mb-2"
                            />
                            <div className="space-y-1">
                                <label className="flex items-center text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={backgroundSettings.randomVideo}
                                        onChange={(e) => updateVideoSettings(e.target.checked)}
                                        className="mr-2"
                                        title="Bật/tắt video ngẫu nhiên"
                                    />
                                    Video ngẫu nhiên từ playlist
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={backgroundSettings.enableSound}
                                        onChange={(e) => updateSoundSettings(e.target.checked)}
                                        className="mr-2"
                                        title="Bật/tắt âm thanh video"
                                    />
                                    🔊 Phát âm thanh video
                                </label>
                                {backgroundSettings.enableSound && (
                                    <p className="text-xs text-yellow-400 mt-1">
                                        ⚠️ Âm thanh chỉ phát khi user tương tác với trang
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Image Link */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">🔗 Link Ảnh Background</h4>
                        <input
                            type="text"
                            value={imageLink}
                            onChange={handleImageLinkChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Link trực tiếp đến file ảnh.</p>
                    </div>

                    {/* Video Upload */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">🎬 Video Background</h4>
                        <input
                            type="file"
                            accept="video/mp4,video/mov,video/avi"
                            onChange={handleVideoChange}
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
                            title="Tải lên video background"
                        />
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI. Tối đa 100MB.</p>
                    </div>

                    {/* Sound Settings */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">🔊 Âm Thanh</h4>
                        <label className="flex items-center text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={backgroundSettings.enableSound}
                                onChange={(e) => updateSoundSettings(e.target.checked)}
                                className="mr-2"
                                title="Bật/tắt âm thanh nền"
                            />
                            Bật âm thanh nền
                        </label>
                    </div>
                </div>
            )}
        </>
    )
}
