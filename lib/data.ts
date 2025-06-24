import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

const USERS_STORAGE_KEY = "users_v2"
const SUBMISSIONS_STORAGE_KEY = "submissions_v3"

// User management functions
export const loadUsersFromLocalStorage = (): User[] => {
  if (typeof window !== "undefined") {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    const defaultAdminUser: User = {
      id: "admin-001",
      username: "ankunstudio",
      password: "admin",
      email: "admin@ankun.dev",
      role: "Label Manager",
      fullName: "An Kun Studio",
      createdAt: new Date().toISOString(),
    }
    const defaultArtistUser: User = {
      id: "artist-001",
      username: "artist",
      password: "123",
      email: "artist@ankun.dev",
      role: "Artist",
      fullName: "Artist User",
      createdAt: new Date().toISOString(),
    }
    return savedUsers ? JSON.parse(savedUsers) : [defaultAdminUser, defaultArtistUser]
  }
  return []
}

export const saveUsersToLocalStorage = (users: User[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }
}

export const fetchUsersFromClient = (): Promise<User[]> => {
  return Promise.resolve(loadUsersFromLocalStorage())
}

// Submission management functions
export const loadSubmissionsFromLocalStorage = (): Submission[] => {
  if (typeof window !== "undefined") {
    const savedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
    return savedSubmissions ? JSON.parse(savedSubmissions) : []
  }
  return []
}

export const saveSubmissionsToLocalStorage = (submissions: Submission[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions))
  }
}

export const fetchSubmissionsFromClient = (): Promise<Submission[]> => {
  return Promise.resolve(loadSubmissionsFromLocalStorage())
}

export const saveSubmissionsToClient = (submissions: Submission[]): void => {
  saveSubmissionsToLocalStorage(submissions)
}

// Authentication function
export function loginUser(username: string, password_input: string): User | null {
  const users = loadUsersFromLocalStorage()
  const user = users.find((u) => u.username === username && u.password === password_input)

  if (user) {
    return user
  }

  return null
}

// Deprecated functions for backward compatibility
export const saveUsersToDatabase_DEPRECATED = (users: User[]): void => {
  saveUsersToLocalStorage(users)
}
