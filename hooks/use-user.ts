// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useContext, createContext } from "react"
import type { User } from "@/types/user"

// Import từ AuthProvider để tránh circular dependency
interface AuthContextType {
    user: User | null
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
    loading: boolean
}

// Tạm thời tạo context riêng cho authorization
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface UseUserReturn {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
}

export function useUser(): UseUserReturn {
    const context = useContext(AuthContext)

    if (!context) {
        // Fallback nếu không có AuthProvider
        return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: async () => false,
            logout: () => { }
        }
    }

    return {
        user: context.user,
        isAuthenticated: !!context.user,
        isLoading: context.loading,
        login: context.login,
        logout: context.logout
    }
}
