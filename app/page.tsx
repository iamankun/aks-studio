// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"
import MainAppView from "@/components/main-app-view"
import FallbackView from "@/components/fallback-view"
import { AuthProvider } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import React from "react"

export default function HomePage() {
  const [hasFailed, setHasFailed] = useState(false);

  // Debug code - check localStorage and display any errors
  useEffect(() => {
    try {
      // Check if localStorage is corrupted
      const storedUser = localStorage.getItem('currentUser')
      console.log("🔍 DEBUG - Stored user:", storedUser)

      if (storedUser) {
        try {
          // Try to parse the JSON
          const userData = JSON.parse(storedUser)
          console.log("✅ DEBUG - User data parsed successfully:", userData)
        } catch (parseError) {
          console.error("❌ DEBUG - Error parsing stored user:", parseError)
          // Clear the corrupted data
          localStorage.removeItem('currentUser')
          console.log("🧹 DEBUG - Cleared corrupted localStorage")
          // Set failure state to use fallback
          setHasFailed(true);
        }
      } else {
        console.log("ℹ️ DEBUG - No user data in localStorage")
      }
    } catch (error) {
      console.error("❌ DEBUG - Error accessing localStorage:", error)
      setHasFailed(true);
    }
  }, [])

  // Check if the page is running in a minimal mode for debugging
  const urlParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const fallbackMode = urlParams.get('mode') === 'fallback';

  // Use fallback view if debugging or if an error occurred
  if (fallbackMode || hasFailed) {
    return <FallbackView />;
  }

  // Otherwise use normal view with error boundary
  return (
    <ErrorBoundary fallback={<FallbackView />}>
      <AuthProvider>
        <MainAppView />
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("❌ ERROR BOUNDARY CAUGHT ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
