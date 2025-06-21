import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

export interface UploadFormViewProps {
    currentUser: User
    onSubmissionAdded: (submission: Submission) => void // Tôi là An Kun
    showModal: (title: string, messages: string[], type?: "success" | "error") => void // Tôi là An Kun
    // ...existing props...
}