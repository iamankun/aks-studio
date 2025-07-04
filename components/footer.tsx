"use client"

import { useState, useEffect } from "react"

export function Footer() {
  const [footerSettings, setFooterSettings] = useState({
    companyName: "AKs Studio",
    version: "1.2.0-beta",
    logoUrl: "/favicon.ico",
    websiteUrl: "/",
    description: "Phân phối Nhạc Kỹ thuật số",
  })

  useEffect(() => {
    // Load footer settings from localStorage
    const savedSettings = localStorage.getItem("footerSettings_v2")
    if (savedSettings) {
      setFooterSettings(JSON.parse(savedSettings))
    }

    // Listen for footer updates
    const handleFooterUpdate = (event: CustomEvent) => {
      setFooterSettings(event.detail)
    }

    window.addEventListener("footerUpdate", handleFooterUpdate as EventListener)
    return () => {
      window.removeEventListener("footerUpdate", handleFooterUpdate as EventListener)
    }
  }, [])

  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <img
            src={footerSettings.logoUrl || "/placeholder.svg"}
            alt="Logo"
            className="h-8 w-8 mr-2 rounded object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "https://placehold.co/32x32/8b5cf6/FFFFFF?text=AK"
            }}
          />
          <p className="text-gray-400 text-sm font-dosis">
            Bản quyền © 2025{" "}
            <a
              href={footerSettings.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors font-dosis-medium"
            >
              {footerSettings.companyName}
            </a>{" "}
            ({footerSettings.version})
          </p>
        </div>
        <p className="text-gray-500 text-xs font-dosis-light">
          Được phát triển bởi{" "}
          <a
            href={footerSettings.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {footerSettings.description}
          </a>
        </p>
      </div>
    </footer>
  )
}
