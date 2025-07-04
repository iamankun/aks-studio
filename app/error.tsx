"use client"

import { DynamicBackground } from "@/components/dynamic-background"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home, AlertTriangle, List } from "lucide-react"
import { useEffect } from "react"
import { logger } from "@/lib/logger"

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    // Log error details using logger service
    logger.error("Application Error", error, {
      component: "ErrorPage",
      digest: error.digest,
    })

    // Store error in localStorage for debugging
    if (typeof window !== "undefined") {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }

      try {
        const existingErrors = JSON.parse(
          localStorage.getItem("aks_errors") || "[]"
        )
        existingErrors.unshift(errorLog)
        if (existingErrors.length > 10) existingErrors.splice(10)
        localStorage.setItem("aks_errors", JSON.stringify(existingErrors))
      } catch (e) {
        logger.error("Failed to store error log", e, { component: "ErrorPage" })
      }
    }
  }, [error])

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950">
      <DynamicBackground />

      <div className="relative z-10 text-center text-white max-w-md mx-auto p-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <AlertTriangle className="h-20 w-20 text-red-500 animate-pulse" />
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              505
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-red-400 mb-4">
          Server Error
        </h1>
        <h2 className="text-xl font-semibold mb-4">
          Oops! Something went wrong
        </h2>

        <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-300 mb-2">Error Details:</p>
          <p className="text-xs text-red-300 font-mono break-words">
            {error.message || "Unknown error occurred"}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 rounded-lg transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>

          <Button
            onClick={() => (window.location.href = "/log-console")}
            variant="link"
            className="w-full text-gray-400 hover:text-gray-300 py-2"
          >
            <List className="mr-2 h-4 w-4" />
            View System Logs
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>If this problem persists, please contact support.</p>
          <p className="mt-1">AKs Studio v2.0.0 &ndash; {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
