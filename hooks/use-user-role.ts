"use client"

import { useEffect, useState } from "react"
import type { User } from "@/types/user"

export function useUserRole() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Giả lập kiểm tra người dùng từ localStorage hoặc một API
        const checkUser = async () => {
            try {
                // Đây chỉ là code mẫu - thay thế bằng logic thực tế của bạn để lấy thông tin người dùng
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                }
            } catch (error) {
                console.error("Error fetching user:", error)
            } finally {
                setLoading(false)
            }
        }

        checkUser()
    }, [])

    const isLabelManager = !!user?.role?.includes('label_manager')
    const isArtist = !!user?.role?.includes('artist')

    return {
        user,
        loading,
        isLabelManager,
        isArtist,
        isLoggedIn: !!user
    }
}
