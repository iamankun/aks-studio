// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useUser } from "@/hooks/use-user"
import { AuthorizationService } from "@/lib/authorization-service"
import type { SimpleSubmission } from "@/types/submission"
import type { ReactNode } from "react"

interface AuthorizedComponentProps {
    readonly children: ReactNode
    readonly requireRole?: "Label Manager" | "Artist"
    readonly requirePermission?: "systemSettings" | "debugTools" | "fullStatistics" | "approveReject"
    readonly fallbackComponent?: ReactNode
    readonly fallbackMessage?: string
}

export function AuthorizedComponent({
    children,
    requireRole,
    requirePermission,
    fallbackComponent,
    fallbackMessage = "You don't have permission to access this feature."
}: AuthorizedComponentProps) {
    const { user } = useUser()

    // Nếu không có user, không hiển thị gì
    if (!user) {
        return null
    }

    // Kiểm tra role nếu được yêu cầu
    if (requireRole && user.role !== requireRole) {
        return fallbackComponent || (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">{fallbackMessage}</p>
                <p className="text-xs text-yellow-600 mt-1">Required role: {requireRole}</p>
            </div>
        )
    }

    // Kiểm tra permission cụ thể
    if (requirePermission) {
        let hasPermission = false

        switch (requirePermission) {
            case "systemSettings":
                hasPermission = AuthorizationService.canAccessSystemSettings(user).allowed
                break
            case "debugTools":
                hasPermission = AuthorizationService.canUseDebugTools(user).allowed
                break
            case "fullStatistics":
                hasPermission = AuthorizationService.canViewFullStatistics(user).allowed
                break
            case "approveReject":
                hasPermission = AuthorizationService.canApproveRejectSubmission(user).allowed
                break
        }

        if (!hasPermission) {
            return fallbackComponent || (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">{fallbackMessage}</p>
                    <p className="text-xs text-yellow-600 mt-1">Required permission: {requirePermission}</p>
                </div>
            )
        }
    }

    // Nếu đủ quyền, hiển thị children
    return <>{children}</>
}

// Hook để kiểm tra quyền trong component
export function useAuthorization() {
    const { user } = useUser()

    const checkPermission = (permission: "systemSettings" | "debugTools" | "fullStatistics" | "approveReject") => {
        if (!user) return false

        switch (permission) {
            case "systemSettings":
                return AuthorizationService.canAccessSystemSettings(user).allowed
            case "debugTools":
                return AuthorizationService.canUseDebugTools(user).allowed
            case "fullStatistics":
                return AuthorizationService.canViewFullStatistics(user).allowed
            case "approveReject":
                return AuthorizationService.canApproveRejectSubmission(user).allowed
            default:
                return false
        }
    }

    const checkRole = (role: "Label Manager" | "Artist") => {
        return user?.role === role
    }

    const canViewSubmission = (submission: SimpleSubmission) => {
        if (!user) return false
        return AuthorizationService.canViewSubmission(user, submission).allowed
    }

    const canEditSubmission = (submission: SimpleSubmission) => {
        if (!user) return false
        return AuthorizationService.canEditSubmission(user, submission).allowed
    }

    const canDeleteSubmission = () => {
        if (!user) return false
        return AuthorizationService.canDeleteSubmission(user).allowed
    }

    const canResubmitAfterRejection = (submission: SimpleSubmission) => {
        if (!user) return false
        return AuthorizationService.canResubmitAfterRejection(user, submission).allowed
    }

    return {
        user,
        checkPermission,
        checkRole,
        canViewSubmission,
        canEditSubmission,
        canDeleteSubmission,
        canResubmitAfterRejection,
        isLabelManager: user?.role === "Label Manager",
        isArtist: user?.role === "Artist"
    }
}
