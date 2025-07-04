import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

const USERS_STORAGE_KEY = "users_v2"
const SUBMISSIONS_STORAGE_KEY = "submissions_v3"

// User management functions - DEPRECATED: Use database API instead
/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const loadUsersFromLocalStorage = (): User[] => {
  console.warn("DEPRECATED: loadUsersFromLocalStorage is deprecated. Use the API instead.")
  if (typeof window !== "undefined") {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    const defaultAdminUser: User = {
      id: "admin-001",
      username: "admin",
      password: "adminpassword",
      email: "admin@example.com",
      role: "Label Manager",
      fullName: "Administrator",
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

/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const saveUsersToLocalStorage = (users: User[]): void => {
  console.warn("DEPRECATED: saveUsersToLocalStorage is deprecated. Use the API instead.")
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }
}

/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const fetchUsersFromClient = (): Promise<User[]> => {
  console.warn("DEPRECATED: fetchUsersFromClient is deprecated. Use the API instead.")
  return Promise.resolve(loadUsersFromLocalStorage())
}

// Submission management functions - Consider migrating these to database as well
/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const loadSubmissionsFromLocalStorage = (): Submission[] => {
  console.warn("DEPRECATED: loadSubmissionsFromLocalStorage is deprecated. Use the API instead.")
  if (typeof window !== "undefined") {
    const savedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
    return savedSubmissions ? JSON.parse(savedSubmissions) : []
  }
  return []
}

/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const saveSubmissionsToLocalStorage = (submissions: Submission[]): void => {
  console.warn("DEPRECATED: saveSubmissionsToLocalStorage is deprecated. Use the API instead.")
  if (typeof window !== "undefined") {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions))
  }
}

/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const fetchSubmissionsFromClient = (): Promise<Submission[]> => {
  console.warn("DEPRECATED: fetchSubmissionsFromClient is deprecated. Use the API instead.")
  return Promise.resolve(loadSubmissionsFromLocalStorage())
}

/**
 * @deprecated Use database API endpoints instead of localStorage
 */
export const saveSubmissionsToClient = (submissions: Submission[]): void => {
  console.warn("DEPRECATED: saveSubmissionsToClient is deprecated. Use the API instead.")
  saveSubmissionsToLocalStorage(submissions)
}

// Authentication function - DEPRECATED: Use API authentication instead
export function loginUser(username: string, password_input: string): User | null {
  console.warn("DEPRECATED: loginUser using localStorage is deprecated. Please use the /api/auth/login endpoint instead.")
  const users = loadUsersFromLocalStorage()
  const user = users.find((u) => u.username === username && u.password === password_input)

  if (user) {
    return user
  }

  return null
}

// Deprecated functions for backward compatibility
export const saveUsersToDatabase_DEPRECATED = (users: User[]): void => {
  console.warn("DEPRECATED: saveUsersToDatabase_DEPRECATED is deprecated. Use the API instead.")
  saveUsersToLocalStorage(users)
}
