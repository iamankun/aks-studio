// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"
import MainAppView from "@/components/main-app-view"
import { AuthProvider } from "@/components/auth-provider"

export default function HomePage() {
  return (
    <AuthProvider>
      <MainAppView />
    </AuthProvider>
  );
}
