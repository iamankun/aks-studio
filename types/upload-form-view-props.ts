import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

export interface UploadFormViewProps {
    currentUser: User
    onSubmissionAdded: (submission: Submission) => void
    showModal: (title: string, message: string, type?: "success" | "error") => void
}

