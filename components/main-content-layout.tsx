"use client"

import React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export function MainContentLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();

    // Always use bg-background to inherit theme, and text-foreground for text
    return (
        <main className={`relative z-10 ${isMobile ? 'pt-[7rem]' : 'pt-[6rem]'} min-h-screen bg-background text-foreground transition-colors duration-300 overflow-auto`}>
            {children}
        </main>
    )
}
