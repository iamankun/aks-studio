//Tôi là An Kun
"use client"
import { useState, useEffect } from "react"
import { DynamicBackground } from "@/components/dynamic-background"

export default function VideoBackgroundTest() {
    const [testResults, setTestResults] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const addTestResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
    }

    useEffect(() => {
        // Test 1: Check if YouTube iframe loads
        const timer1 = setTimeout(() => {
            const iframe = document.querySelector('iframe[title="YouTube Background Video"]')
            if (iframe) {
                addTestResult("✅ YouTube iframe detected")

                // Test 2: Check iframe src
                const src = iframe.getAttribute('src')
                if (src && src.includes('autoplay=1')) {
                    addTestResult("✅ Autoplay parameter enabled")
                } else {
                    addTestResult("❌ Autoplay parameter missing")
                }

                // Test 3: Check iframe permissions
                const allow = iframe.getAttribute('allow')
                if (allow && allow.includes('autoplay')) {
                    addTestResult("✅ Autoplay permission granted")
                } else {
                    addTestResult("❌ Autoplay permission missing")
                }
            } else {
                addTestResult("❌ YouTube iframe not found")
            }
            setIsLoading(false)
        }, 2000)

        // Test 4: Check for sound control
        const timer2 = setTimeout(() => {
            const soundControl = document.querySelector('[data-testid="sound-control"]')
            if (soundControl) {
                addTestResult("✅ Sound control component loaded")
            } else {
                addTestResult("⚠️ Sound control not detected (may be hidden)")
            }
        }, 3000)

        // Test 5: Simulate user interaction
        const timer3 = setTimeout(() => {
            addTestResult("🤖 Simulating user click for autoplay...")
            document.body.click()
        }, 1000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [])

    const testVideoChange = () => {
        // Force reload by triggering background update
        const event = new CustomEvent("backgroundUpdate", {
            detail: {
                type: "video",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll for testing
                randomVideo: false,
                enableSound: false,
                opacity: 0.5,
                videoList: []
            }
        })
        window.dispatchEvent(event)
        addTestResult("🔄 Video changed to test video")
    }

    const testSoundToggle = () => {
        const event = new CustomEvent("backgroundUpdate", {
            detail: {
                type: "video",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                randomVideo: false,
                enableSound: true, // Enable sound
                opacity: 0.5,
                videoList: []
            }
        })
        window.dispatchEvent(event)
        addTestResult("🔊 Sound enabled for testing")
    }

    return (
        <div className="min-h-screen relative">
            <DynamicBackground />

            <div className="relative z-10 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">
                        Video Background Auto-Play Test
                    </h1>

                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-4">Test Controls</h2>
                        <div className="flex gap-4 flex-wrap">
                            <button
                                onClick={testVideoChange}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Change Video
                            </button>
                            <button
                                onClick={testSoundToggle}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                Enable Sound
                            </button>
                            <button
                                onClick={() => setTestResults([])}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Clear Results
                            </button>
                        </div>
                    </div>

                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            Test Results {isLoading && "(Running...)"}
                        </h2>
                        <div className="space-y-2">
                            {testResults.length === 0 ? (
                                <p className="text-gray-400">No test results yet...</p>
                            ) : (
                                testResults.map((result) => (
                                    <div
                                        key={result}
                                        className="text-sm font-mono text-white bg-gray-900/50 p-2 rounded"
                                    >
                                        {result}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-6 bg-black/80 backdrop-blur-sm rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-white mb-4">Notes</h2>
                        <ul className="text-white space-y-2 text-sm">
                            <li>• Video should auto-play after 2 seconds or user interaction</li>
                            <li>• YouTube controls should be completely hidden</li>
                            <li>• Sound control should appear when video is playing</li>
                            <li>• Video should loop seamlessly</li>
                            <li>• Background should be responsive and maintain aspect ratio</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
