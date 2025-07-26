"use client"

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import "@/components/awesome/css/all.min.css"

interface LoadingScreenProps {
    duration?: number
    onComplete?: () => void
    title?: string
    subtitle?: string
    logoUrl?: string
    isAnimation?: boolean // Thêm prop để xác định có phải animation không
}

export function LoadingScreen({
    duration = 3000,
    onComplete,
    title = "An Kun Studio",
    subtitle = "Đang chuyển hướng ...",
    logoUrl = "@public/movies.png",
    isAnimation = true
}: Readonly<LoadingScreenProps>) {
    const [progress, setProgress] = useState(0)
    const [visible, setVisible] = useState(true)
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        startProgress()

        // Copy ref values to local variables for cleanup
        const progressInterval = progressIntervalRef.current
        const completeTimeout = completeTimeoutRef.current
        const hideTimeout = hideTimeoutRef.current

        return () => {
            if (progressInterval) clearInterval(progressInterval)
            if (completeTimeout) clearTimeout(completeTimeout)
            if (hideTimeout) clearTimeout(hideTimeout)
        }
    }, [])

    const startProgress = () => {
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (Math.random() * 10 + 2) // 2-12% increment
                if (newProgress >= 100) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
                    completeLoading()
                    return 100
                }
                return newProgress
            })
        }, 150)
    }

    const completeLoading = () => {
        completeTimeoutRef.current = setTimeout(() => {
            setVisible(false)
            if (onComplete) {
                onComplete()
            }
        }, 500)
    }

    if (!visible) return null

    return (
        <div className={`fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-950 via-black to-gray-900 
                     flex flex-col items-center justify-center z-[10000] font-sans
                     ${!visible ? 'opacity-0 transition-opacity duration-500' : ''}`}
        >

            {/* Loading Content */}
            <div className="text-center max-w-[400px]">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-fadeInUp">
                    {title}
                </h1>
                <p className="text-lg text-gray-300 mb-8 animate-fadeInUp">
                    {subtitle}
                </p>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="w-[300px] h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-400 animate-fadeInUp">
                        {Math.round(progress)}%
                    </div>
                </div>

                {/* Loading Dots */}
                <div className="flex justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>

            {/* Loading Info Text */}
            <div className="absolute bottom-4 text-center text-xs text-gray-500">
                <p><i className="fas fa-info-circle mr-1"></i> Digital Music Distribution Platform</p>
                <p className="mt-1">
                    <i className="fas fa-copyright mr-1"></i> An Kun Studio 2025
                </p>
            </div>
        </div>
    )
}

// Tạo thêm keyframes cho animation fadeInUp
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 1s ease-out forwards;
}
`

// Thêm styles vào document khi component được load
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style')
    styleElement.textContent = styles
    document.head.appendChild(styleElement)
}
