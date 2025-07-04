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

    const isLabel_Manager = user?.role === 'Label Manager'
    const isArtist = user?.role === 'Artist'

    return {
        user,
        loading,
        isLabel_Manager,
        isArtist,
        isLoggedIn: !!user
    }
}
