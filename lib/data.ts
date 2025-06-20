import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js'
export const users_db: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin",
    role: "Label Manager",
    fullName: "Label manager",
    email: "admin@ankun.dev",
    avatar: "https://placehold.co/100x100/7c3aed/FFFFFF?text=AD",
    bio: "Quản trị viên hệ thống với toàn quyền quản lý.",
    socialLinks: {},
    isrcCodePrefix: "DEMO",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "artist",
    password: "123456",
    role: "Nghệ sĩ",
    fullName: "Demo Artist",
    email: "artist@system.local",
    avatar: "https://placehold.co/100x100/ec4899/FFFFFF?text=AR",
    bio: "Nghệ sĩ demo để test hệ thống.",
    socialLinks: {},
    isrcCodePrefix: "DEMO",
    createdAt: new Date().toISOString(),
  },
]

export const submissions: Submission[] = []

// Database management functions
export const initializeDatabase = () => {
  try {
    if (typeof window !== "undefined") {
      // Create tables structure
      const tables = {
        users: users_db,
        submissions: submissions,
        settings: {
          appName: "AKs Studio",
          version: "1.2.0-beta",
          initialized: true,
          createdAt: new Date().toISOString(),
        },
      }

      // Save initial data if not exists
      if (!localStorage.getItem("musicHubUsers_v4")) {
        localStorage.setItem("musicHubUsers_v4", JSON.stringify(tables.users))
      }
      if (!localStorage.getItem("musicSubmissions_v4")) {
        localStorage.setItem("musicSubmissions_v4", JSON.stringify(tables.submissions))
      }
      if (!localStorage.getItem("systemSettings_v4")) {
        localStorage.setItem("systemSettings_v4", JSON.stringify(tables.settings))
      }

      console.log("Database initialized successfully")
      return true
    }
  } catch (e) {
    console.error("Error initializing database:", e)
    return false
  }
}

// Helper functions for localStorage
export const saveUsersToLocalStorage = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicHubUsers_v4", JSON.stringify(users_db))
    }
  } catch (e) {
    console.error("Error saving users to localStorage:", e)
  }
}

export const loadUsersFromLocalStorage = () => {
  try {
    if (typeof window !== "undefined") {
      const storedUsers = localStorage.getItem("musicHubUsers_v4")
      if (storedUsers) {
        users_db.length = 0
        users_db.push(...JSON.parse(storedUsers))
      } else {
        saveUsersToLocalStorage()
      }
    }
  } catch (e) {
    console.error("Error loading users from localStorage:", e)
  }
}

export const saveSubmissionsToLocalStorage = (submissionsData: Submission[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicSubmissions_v4", JSON.stringify(submissionsData))
    }
  } catch (e) {
    console.error("Error saving submissions to localStorage:", e)
  }
}

export const loadSubmissionsFromLocalStorage = (): Submission[] => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("musicSubmissions_v4")
      if (stored) {
        return JSON.parse(stored)
      }
    }
  } catch (e) {
    console.error("Error loading submissions:", e)
  }
  return []
}

// Additional helper functions
export const addSubmission = (submission: Submission) => {
  submissions.push(submission)
  saveSubmissionsToLocalStorage(submissions)
}

export const updateSubmissionStatus = (submissionId: string, newStatus: string) => {
  const submissionIndex = submissions.findIndex((sub) => sub.id === submissionId)
  if (submissionIndex !== -1) {
    submissions[submissionIndex].status = newStatus
    saveSubmissionsToLocalStorage(submissions)
  }
}

export const getSubmissionById = (id: string): Submission | undefined => {
  return submissions.find((sub) => sub.id === id)
}

export const getUserByUsername = (username: string): User | undefined => {
  return users_db.find((user) => user.username === username)
}

export const authenticateUser = (username: string, password: string): User | null => {
  const user = users_db.find((u) => u.username === username && u.password === password)
  return user || null
}

// Initialize database on load
if (typeof window !== "undefined") {
  initializeDatabase()
  loadUsersFromLocalStorage()
  const loadedSubmissions = loadSubmissionsFromLocalStorage()
  submissions.length = 0
  submissions.push(...loadedSubmissions)
}
