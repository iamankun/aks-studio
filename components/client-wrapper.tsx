"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SoundSystem } from "@/components/sound-system"
import { BackgroundSystem } from "@/components/background-system"
import { SystemStatusProvider } from "@/components/system-status-provider"
import { AuthProvider } from "@/components/auth-provider"

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SystemStatusProvider>
      <AuthProvider>
        <BackgroundSystem />
        <div className="relative z-10">{children}</div>
        <SoundSystem />
      </AuthProvider>
    </SystemStatusProvider>
  )
}
