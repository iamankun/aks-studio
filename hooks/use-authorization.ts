// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { AuthorizationService } from "@/lib/authorization-service"
import type { User } from "@/types/user"
import type { SimpleSubmission } from "@/types/submission"

export interface UseAuthorizationReturn {
    // User info
    user: User | null
    isAuthenticated: boolean
    isLabelManager: boolean
    isArtist: boolean

    // Permission checks
    canViewSubmission: (submission: SimpleSubmission) => boolean
    canEditSubmission: (submission: SimpleSubmission) => boolean
    canDeleteSubmission: () => boolean
    canApproveRejectSubmission: () => boolean
    canAccessSystemSettings: () => boolean
    canUseDebugTools: () => boolean
    canViewFullStatistics: () => boolean
    canResubmitAfterRejection: (submission: SimpleSubmission) => boolean

    // Helper functions
    getFilteredSubmissions: (submissions: SimpleSubmission[]) => SimpleSubmission[]
    getPermissionReason: (permission: string, submission?: SimpleSubmission) => string | undefined
}

export function useAuthorization(): UseAuthorizationReturn {
    const { user } = useAuth()

    const permissions = useMemo(() => {
        if (!user) {
            return {
                isAuthenticated: false,
                isLabelManager: false,
                isArtist: false,
                canViewSubmission: () => false,
                canEditSubmission: () => false,
                canDeleteSubmission: () => false,
                canApproveRejectSubmission: () => false,
                canAccessSystemSettings: () => false,
                canUseDebugTools: () => false,
                canViewFullStatistics: () => false,
                canResubmitAfterRejection: () => false,
                getFilteredSubmissions: () => [],
                getPermissionReason: () => "User not authenticated"
            }
        }

        const isLabelManager = user.role === "Label Manager"
        const isArtist = user.role === "Artist"

        return {
            isAuthenticated: true,
            isLabelManager,
            isArtist,

            canViewSubmission: (submission: SimpleSubmission) =>
                AuthorizationService.canViewSubmission(user, submission).allowed,

            canEditSubmission: (submission: SimpleSubmission) =>
                AuthorizationService.canEditSubmission(user, submission).allowed,

            canDeleteSubmission: () =>
                AuthorizationService.canDeleteSubmission(user).allowed,

            canApproveRejectSubmission: () =>
                AuthorizationService.canApproveRejectSubmission(user).allowed,

            canAccessSystemSettings: () =>
                AuthorizationService.canAccessSystemSettings(user).allowed,

            canUseDebugTools: () =>
                AuthorizationService.canUseDebugTools(user).allowed,

            canViewFullStatistics: () =>
                AuthorizationService.canViewFullStatistics(user).allowed,

            canResubmitAfterRejection: (submission: SimpleSubmission) =>
                AuthorizationService.canResubmitAfterRejection(user, submission).allowed,

            getFilteredSubmissions: (submissions: SimpleSubmission[]) =>
                AuthorizationService.filterSubmissionsForUser(user, submissions),

            getPermissionReason: (permission: string, submission?: SimpleSubmission) => {
                switch (permission) {
                    case 'view':
                        return submission ? AuthorizationService.canViewSubmission(user, submission).reason : undefined
                    case 'edit':
                        return submission ? AuthorizationService.canEditSubmission(user, submission).reason : undefined
                    case 'delete':
                        return AuthorizationService.canDeleteSubmission(user).reason
                    case 'approve':
                        return AuthorizationService.canApproveRejectSubmission(user).reason
                    case 'settings':
                        return AuthorizationService.canAccessSystemSettings(user).reason
                    case 'debug':
                        return AuthorizationService.canUseDebugTools(user).reason
                    case 'stats':
                        return AuthorizationService.canViewFullStatistics(user).reason
                    case 'resubmit':
                        return submission ? AuthorizationService.canResubmitAfterRejection(user, submission).reason : undefined
                    default:
                        return undefined
                }
            }
        }
    }, [user])

    return {
        user,
        ...permissions
    }
}
