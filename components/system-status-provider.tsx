import React, { createContext, useContext, useState, useEffect } from "react"

interface SystemStatus {
  smtp: "connected" | "disconnected" | "checking"
  database: "connected" | "disconnected" | "checking"
  localStorage: "available" | "unavailable" | "checking"
}

interface SystemStatusContextType {
  status: SystemStatus
  checkAllSystems: () => Promise<void>
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined)

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>({
    smtp: "checking",
    database: "checking",
    localStorage: "checking"
  })

  const checkAllSystems = async () => {
    // Check localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("test", "test")
        localStorage.removeItem("test")
        setStatus(prev => ({ ...prev, localStorage: "available" }))
      }
    } catch {
      setStatus(prev => ({ ...prev, localStorage: "unavailable" }))
    }

    // Check SMTP (simplified)
    const smtpSettings = typeof window !== 'undefined' ? localStorage.getItem("emailSettings_v2") : null
    if (smtpSettings) {
      setStatus(prev => ({ ...prev, smtp: "connected" }))
    } else {
      setStatus(prev => ({ ...prev, smtp: "disconnected" }))
    }

    // Check Database (demo mode)
    setStatus(prev => ({ ...prev, database: "disconnected" }))
  }

  useEffect(() => {
    checkAllSystems()
  }, [])

  return (
    <SystemStatusContext.Provider value={{ status, checkAllSystems }}>
      {children}
    </SystemStatusContext.Provider>
  )
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext)
  if (context === undefined) {
    throw new Error("useSystemStatus must be used within a SystemStatusProvider")
  }
  return context
}
