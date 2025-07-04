"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import "@/components/awesome/css/all.min.css"

interface ComponentLoadingProps {
    readonly isFullScreen?: boolean
    readonly showLogo?: boolean
    readonly showProgress?: boolean
    readonly message?: string
    readonly size?: 'sm' | 'md' | 'lg'
}

export function ComponentLoading({
    isFullScreen = false,
    showLogo = true,
    showProgress = true,
    message = "Đang tải dữ liệu...",
    size = 'md'
}: ComponentLoadingProps) {
    const [progress, setProgress] = useState(0)

    // Simulate progress
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + (Math.random() * 8 + 2)
            })
        }, 200)

        return () => clearInterval(interval)
    }, [])

    // Size classes
    const sizeClasses = {
        sm: {
            container: "p-4",
            logo: "w-12 h-12",
            text: "text-sm"
        },
        md: {
            container: "p-6",
            logo: "w-16 h-16",
            text: "text-base"
        },
        lg: {
            container: "p-8",
            logo: "w-20 h-20",
            text: "text-lg"
        }
    }

    const containerClass = isFullScreen
        ? "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        : `relative ${sizeClasses[size].container} flex flex-col items-center justify-center`

    return (
        <div className={containerClass}>
            <div className="flex flex-col items-center justify-center text-center">
                {showLogo && (
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary-foreground/30 rounded-full blur-lg animate-pulse"></div>
                        <div className={`relative ${sizeClasses[size].logo}`}>
                            <Image
                                src="/loading.webm"
                                alt="An Kun Studio"
                                width={80}
                                height={80}
                                className="w-full h-full object-contain rounded-full animate-pulse"
                            />
                        </div>
                    </div>
                )}

                <p className={`${sizeClasses[size].text} text-white/90 font-medium mb-3 flex items-center`}>
                    <i className="fas fa-spinner fa-spin mr-2 text-primary"></i>
                    {message}
                </p>

                {showProgress && (
                    <div className="w-full max-w-[200px] mb-2">
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary-foreground rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">{Math.round(progress)}%</p>
                    </div>
                )}
            </div>
        </div>
    )
}
