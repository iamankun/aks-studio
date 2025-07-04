// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5732@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

import type { User } from "@/types/user"
import type { SimpleSubmission, SubmissionStats } from "@/types/submission"

export enum UserRole {
    LABEL_MANAGER = "Label Manager",
    ARTIST = "Artist"
}

export enum SubmissionStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    PUBLISHED = "published",
    CANCELLED = "cancelled"
}

export interface PermissionResult {
    allowed: boolean
    reason?: string
}

export class AuthorizationService {
    // Kiểm tra quyền truy cập submissions
    static canViewSubmission(user: User, submission: SimpleSubmission): PermissionResult {
        // Label Manager có quyền xem tất cả submissions
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        // Artist chỉ được xem submissions của mình
        if (user.role === UserRole.ARTIST) {
            if (submission.artist_id === user.id || submission.user_id === user.id) {
                return { allowed: true }
            }
            return {
                allowed: false,
                reason: "Artists can only view their own submissions"
            }
        }

        return {
            allowed: false,
            reason: "Unauthorized role"
        }
    }

    // Kiểm tra quyền chỉnh sửa submissions
    static canEditSubmission(user: User, submission: SimpleSubmission): PermissionResult {
        // Label Manager có quyền chỉnh sửa tất cả submissions
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        // Artist chỉ được chỉnh sửa submissions của mình khi còn status "pending"
        if (user.role === UserRole.ARTIST) {
            // Kiểm tra xem có phải submission của artist này không
            if (submission.artist_id !== user.id && submission.user_id !== user.id) {
                return {
                    allowed: false,
                    reason: "Artists can only edit their own submissions"
                }
            }

            // Kiểm tra status - chỉ cho phép chỉnh sửa khi còn "pending"
            if (submission.status !== SubmissionStatus.PENDING) {
                return {
                    allowed: false,
                    reason: "Artists can only edit submissions that are still pending approval"
                }
            }

            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Unauthorized role"
        }
    }

    // Kiểm tra quyền xóa submissions
    static canDeleteSubmission(user: User): PermissionResult {
        // Chỉ Label Manager mới có quyền xóa
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Only Label Managers can delete submissions"
        }
    }

    // Kiểm tra quyền truy cập system settings
    static canAccessSystemSettings(user: User): PermissionResult {
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Only Label Managers can access system settings"
        }
    }

    // Kiểm tra quyền sử dụng Debug Tools
    static canUseDebugTools(user: User): PermissionResult {
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Only Label Managers can use debug tools"
        }
    }

    // Kiểm tra quyền xem thống kê tổng quan
    static canViewFullStatistics(user: User): PermissionResult {
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Only Label Managers can view full statistics"
        }
    }

    // Kiểm tra quyền approve/reject submissions
    static canApproveRejectSubmission(user: User): PermissionResult {
        if (user.role === UserRole.LABEL_MANAGER) {
            return { allowed: true }
        }

        return {
            allowed: false,
            reason: "Only Label Managers can approve or reject submissions"
        }
    }

    // Kiểm tra quyền resubmit sau khi bị reject
    static canResubmitAfterRejection(user: User, submission: SimpleSubmission): PermissionResult {
        // Chỉ artist và submission phải ở trạng thái rejected
        if (user.role !== UserRole.ARTIST) {
            return {
                allowed: false,
                reason: "Only artists can resubmit rejected submissions"
            }
        }

        if (submission.artist_id !== user.id && submission.user_id !== user.id) {
            return {
                allowed: false,
                reason: "Artists can only resubmit their own submissions"
            }
        }

        if (submission.status !== SubmissionStatus.REJECTED) {
            return {
                allowed: false,
                reason: "Can only resubmit rejected submissions"
            }
        }

        return { allowed: true }
    }

    // Kiểm tra ngày phát hành hợp lệ
    static validateReleaseDate(user: User, submission: SimpleSubmission, releaseDate: string): PermissionResult {
        const submissionDate = new Date(submission.submission_date ?? submission.created_at ?? new Date())
        const requestedDate = new Date(releaseDate)

        // Nếu là bản đã phát hành (published), cho phép chọn ngày trong quá khứ
        if (submission.status === SubmissionStatus.PUBLISHED) {
            return { allowed: true }
        }

        // Nếu là bản mới, chỉ cho phép từ ngày submit đến +2 ngày
        const minDate = submissionDate
        const maxDate = new Date(submissionDate.getTime() + (2 * 24 * 60 * 60 * 1000)) // +2 ngày

        if (requestedDate < minDate || requestedDate > maxDate) {
            return {
                allowed: false,
                reason: `Release date must be between ${minDate.toDateString()} and ${maxDate.toDateString()}`
            }
        }

        return { allowed: true }
    }

    // Filter submissions dựa trên quyền của user
    static filterSubmissionsForUser(user: User, submissions: SimpleSubmission[]): SimpleSubmission[] {
        if (user.role === UserRole.LABEL_MANAGER) {
            // Label Manager xem được tất cả
            return submissions
        }

        if (user.role === UserRole.ARTIST) {
            // Artist chỉ xem được submissions của mình
            return submissions.filter(submission =>
                submission.artist_id === user.id || submission.user_id === user.id
            )
        }

        return []
    }

    // Generate statistics cho user dựa trên quyền
    static generateUserStatistics(user: User, submissions: SimpleSubmission[]): SubmissionStats {
        const userSubmissions = this.filterSubmissionsForUser(user, submissions)

        const stats = {
            total: userSubmissions.length,
            pending: userSubmissions.filter(s => s.status === SubmissionStatus.PENDING).length,
            approved: userSubmissions.filter(s => s.status === SubmissionStatus.APPROVED).length,
            rejected: userSubmissions.filter(s => s.status === SubmissionStatus.REJECTED).length,
            published: userSubmissions.filter(s => s.status === SubmissionStatus.PUBLISHED).length,
            cancelled: userSubmissions.filter(s => s.status === SubmissionStatus.CANCELLED).length
        }

        if (user.role === UserRole.LABEL_MANAGER) {
            // Label Manager có thêm thống kê tổng quan
            return {
                ...stats,
                userRole: "Label Manager",
                canViewAll: true,
                totalArtists: [...new Set(submissions.map(s => s.artist_id ?? s.user_id))].length,
                recentSubmissions: submissions.slice(0, 10)
            }
        }

        return {
            ...stats,
            userRole: "Artist",
            canViewAll: false,
            artistName: user.fullName
        }
    }
}
