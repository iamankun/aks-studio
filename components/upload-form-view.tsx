import type { Submission } from "@/types/submission"
import type { User } from "@/types/user"

export interface UploadFormViewProps {
    currentUser: User
    onSubmissionAdded: (submission: Submission) => void // Tôi là An Kun
    showModal: (title: string, messages: string[], type?: "success" | "error") => void // Tôi là An Kun
}

export default function UploadFormView({ currentUser, onSubmissionAdded, showModal }: UploadFormViewProps) {
    // ...existing code...
}