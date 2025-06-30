"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

interface SoundControlProps {
    enableSound: boolean
    onSoundToggle: (enabled: boolean) => void
}

export function SoundControl({ enableSound, onSoundToggle }: SoundControlProps) {
    const [userInteracted, setUserInteracted] = useState(false)
    const [showSoundPrompt, setShowSoundPrompt] = useState(false)

    useEffect(() => {
        // Kiểm tra nếu user đã tương tác trước đó
        const hasInteracted = localStorage.getItem("user_audio_interaction")
        if (hasInteracted) {
            setUserInteracted(true)
        }

        // Hiện prompt âm thanh nếu enableSound = true nhưng chưa có interaction
        if (enableSound && !hasInteracted) {
            setShowSoundPrompt(true)
        }
    }, [enableSound])

    const handleEnableSound = () => {
        setUserInteracted(true)
        localStorage.setItem("user_audio_interaction", "true")
        setShowSoundPrompt(false)

        // Trigger a background update để reload video với âm thanh
        window.dispatchEvent(new CustomEvent("backgroundUpdate", {
            detail: { enableSound: true }
        }))
    }

    const toggleSound = () => {
        const newSoundState = !enableSound
        onSoundToggle(newSoundState)

        if (newSoundState && !userInteracted) {
            setShowSoundPrompt(true)
        }
    }

    if (showSoundPrompt) {
        return (
            <div className="fixed top-20 right-4 z-50 bg-gray-900/95 backdrop-blur-md border border-yellow-500 rounded-lg p-4 w-80">
                <div className="text-yellow-400 text-sm mb-3">
                    <Volume2 className="inline h-4 w-4 mr-2" />
                    Bạn có muốn bật âm thanh cho video background không?
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleEnableSound}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Bật âm thanh
                    </Button>
                    <Button
                        onClick={() => {
                            setShowSoundPrompt(false)
                            onSoundToggle(false)
                        }}
                        size="sm"
                        variant="outline"
                        className="text-gray-300 border-gray-600"
                    >
                        Không
                    </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Âm thanh sẽ chỉ phát sau khi bạn click để tuân thủ browser policies
                </p>
            </div>
        )
    }

    // Floating sound control button
    return (
        <button
            onClick={toggleSound}
            data-testid="sound-control"
            className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${enableSound
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-gray-300"
                }`}
            title={enableSound ? "Tắt âm thanh" : "Bật âm thanh"}
        >
            {enableSound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
    )
}
