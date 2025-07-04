"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SoundSystem } from "@/components/sound-system"
import { BackgroundSettingsPanel } from "@/components/background-settings-panel"
import { SystemStatusProvider } from "@/components/system-status-provider"
import { AuthProvider } from "@/components/auth-provider"

interface ClientWrapperProps {
  readonly children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing client...</p>
        </div>
      </div>
    )
  }

  return (
    <SystemStatusProvider>
      <AuthProvider>
        {/* BackgroundSettingsPanel provides settings panel for background customization */}
        <BackgroundSettingsPanel />
        <div className="relative z-10">{children}</div>
        <SoundSystem />
      </AuthProvider>
    </SystemStatusProvider>
  )
}
