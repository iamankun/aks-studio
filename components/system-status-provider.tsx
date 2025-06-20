"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface SystemStatus {
  smtp: "connected" | "disconnected" | "checking"
  database: "connected" | "disconnected" | "checking"
  localStorage: "connected" | "disconnected" | "checking"
  isDemo: boolean
}

interface SystemStatusContextType {
  status: SystemStatus
  checkAllSystems: () => void
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined)

export function useSystemStatus() {
  const context = useContext(SystemStatusContext)
  if (!context) {
    throw new Error("useSystemStatus must be used within SystemStatusProvider")
  }
  return context
}

export function SystemStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>({
    smtp: "disconnected",
    database: "disconnected",
    localStorage: "disconnected",
    isDemo: true,
  })

  const checkSMTP = async () => {
    setStatus((prev) => ({ ...prev, smtp: "checking" }))
    try {
      const smtpSettings = localStorage.getItem("emailSettings_v2")
      if (smtpSettings) {
        const settings = JSON.parse(smtpSettings)
        if (settings.smtpServer && settings.smtpUsername && settings.smtpPassword) {
          setStatus((prev) => ({ ...prev, smtp: "connected" }))
          return true
        }
      }
      setStatus((prev) => ({ ...prev, smtp: "disconnected" }))
      return false
    } catch {
      setStatus((prev) => ({ ...prev, smtp: "disconnected" }))
      return false
    }
  }

  const checkDatabase = async () => {
    setStatus((prev) => ({ ...prev, database: "checking" }))
    try {
      // Check if we have database connection settings
      const dbSettings = localStorage.getItem("databaseSettings_v2")
      if (dbSettings) {
        const settings = JSON.parse(dbSettings)
        if (settings.connected) {
          setStatus((prev) => ({ ...prev, database: "connected" }))
          return true
        }
      }
      setStatus((prev) => ({ ...prev, database: "disconnected" }))
      return false
    } catch {
      setStatus((prev) => ({ ...prev, database: "disconnected" }))
      return false
    }
  }

  const checkLocalStorage = async () => {
    setStatus((prev) => ({ ...prev, localStorage: "checking" }))
    try {
      localStorage.setItem("test", "test")
      localStorage.removeItem("test")
      setStatus((prev) => ({ ...prev, localStorage: "connected" }))
      return true
    } catch {
      setStatus((prev) => ({ ...prev, localStorage: "disconnected" }))
      return false
    }
  }

  const checkAllSystems = async () => {
    const [smtpOk, dbOk, localStorageOk] = await Promise.all([checkSMTP(), checkDatabase(), checkLocalStorage()])

    const isDemo = !(smtpOk && dbOk && localStorageOk)
    setStatus((prev) => ({ ...prev, isDemo }))
  }

  useEffect(() => {
    checkAllSystems()
    // Check every 30 seconds
    const interval = setInterval(checkAllSystems, 30000)
    return () => clearInterval(interval)
  }, [])

  return <SystemStatusContext.Provider value={{ status, checkAllSystems }}>{children}</SystemStatusContext.Provider>
}
