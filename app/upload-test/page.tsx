"use client"

import UploadFormView from "@/components/views/upload-form-view"
import { ThemeProvider } from "@/components/theme-provider"
import type { User } from "@/types/user"

const testUser: User = {
    id: "test123",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    role: "Artist",
    avatar: "",
    password: "",
    createdAt: new Date().toISOString()
}

export default function UploadTestPage() {
    const handleSubmissionAdded = (submission: any) => {
        console.log("Submission added:", submission)
    }

    const showModal = (title: string, messages: string[], type?: "success" | "error") => {
        alert(`${type}: ${title} - ${messages.join(", ")}`)
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen p-4">
                <h1 className="text-2xl mb-4">Upload Form Test</h1>
                <UploadFormView
                    currentUser={testUser}
                    onSubmissionAdded={handleSubmissionAdded}
                    showModal={showModal}
                />
            </div>
        </ThemeProvider>
    )
}
