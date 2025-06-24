"use client"

import { useState, useEffect } from "react"
import LoginView from "@/components/auth/login-view"
import RegistrationView from "@/components/auth/registration-view"
import MainAppView from "@/components/main-app-view"
import type { User } from "@/types/user"
import { createClient } from "@/ultis/supabase/client" // Import Supabase client cho phía client

interface AuthFlowClientProps {
  initialUser: User | null;
}

export default function AuthFlowClient({ initialUser }: Readonly<AuthFlowClientProps>) {
  const [currentView, setCurrentView] = useState<"login" | "registration" | "main">(
    initialUser ? "main" : "login"
  )
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)

  useEffect(() => {
    // Tạo một Supabase client phía client
    const supabase = createClient();

    // Lắng nghe các thay đổi về trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Người dùng đã đăng nhập
        const user: User = {
          id: session.user.id,
          email: session.user.email ?? '',
          role: session.user.user_metadata?.role ?? 'user',
        };
        setCurrentUser(user);
        setCurrentView("main");
      } else {
        // Người dùng đã đăng xuất
        setCurrentUser(null);
        // Sử dụng functional update để truy cập state mới nhất mà không cần đưa vào dependency array
        // Điều này giúp tránh chuyển hướng người dùng khỏi trang đăng ký một cách không mong muốn.
        setCurrentView((prevView) => {
          if (prevView === 'registration') {
            return 'registration';
          }
          return 'login';
        });
      }
    });

    // Dọn dẹp subscription khi component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Dependency rỗng đảm bảo effect chỉ chạy một lần khi component được mount

  return (
    <main className="min-h-screen bg-background">
      {currentView === "login" && (
        <LoginView onShowRegister={() => setCurrentView("registration")} />
      )}

      {currentView === "registration" && (
        <RegistrationView onRegistrationSuccess={() => setCurrentView("login")} onShowLogin={() => setCurrentView("login")} />
      )}

      {currentView === "main" && currentUser && <MainAppView currentUser={currentUser} />}
    </main>
  )
}

// Tôi là An Kun