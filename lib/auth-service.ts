// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun 
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

import { multiDB } from "./multi-database-service"
import type { User } from "@/types/user"

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
  debug?: any
}

// Mock authentication for demo purposes
// In production, this should integrate with proper auth providers
export async function authenticateUser(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("🔐 Authenticating user:", username)

    // For demo purposes, accept ankunstudio/admin as valid login
    if (username === "ankunstudio" && password === "admin") {
      const user: User = {
        id: "demo-user-1",
        username: "ankunstudio",
        email: "admin@ankunstudio.com",
        fullName: "An Kun Studio Digital Music Distribution",
        role: "Label Manager",
        avatar: "/images/avatar-placeholder.jpg",
        password: "admin", // In production, this should be hashed
        createdAt: new Date().toISOString()
      }

      console.log("✅ Authentication successful for admin user")
      return {
        success: true,
        user,
        message: "Authentication successful"
      }
    }

    // For other users, try to authenticate from database (if available)
    try {
      const dbResult = await multiDB.authenticateUser(username, password)
      if (dbResult.success && dbResult.user) {
        console.log("✅ User authenticated via database:", dbResult.user)
        return dbResult
      }
    } catch (dbError) {
      console.warn("⚠️ Database authentication failed, using fallback auth:", dbError)
    }

    console.log("❌ Authentication failed for user:", username)
    return {
      success: false,
      message: "Invalid username or password"
    }

  } catch (error) {
    console.error("❌ Authentication error:", error)
    return {
      success: false,
      message: "Authentication service error",
      debug: error instanceof Error ? error.message : String(error)
    }
  }
}

// Register new user (demo implementation)
export async function registerUser(userData: Partial<User>, password: string): Promise<AuthResult> {
  try {
    console.log("📝 Registering new user:", userData.username)

    // Basic validation
    if (!userData.username || !userData.email || !password) {
      return {
        success: false,
        message: "Username, email, and password are required"
      }
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email!,
      fullName: userData.fullName || userData.username,
      role: userData.role || "Artist",
      avatar: userData.avatar || "/images/avatar-placeholder.jpg",
      password: password, // In production, this should be hashed
      createdAt: new Date().toISOString()
    }

    // Try to save to database
    try {
      const saveResult = await multiDB.createUser({
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        password: password,
        role: newUser.role
      })

      if (saveResult.success) {
        console.log("✅ User saved to database successfully")
      } else {
        console.warn("⚠️ Could not save user to database, but registration allowed")
      }
    } catch (error) {
      console.warn("⚠️ Database save failed, but registration allowed:", error)
    }

    console.log("✅ User registration successful")
    return {
      success: true,
      user: newUser,
      message: "Registration successful"
    }

  } catch (error) {
    console.error("❌ Registration error:", error)
    return {
      success: false,
      message: "Registration service error",
      debug: error instanceof Error ? error.message : String(error)
    }
  }
}

// Initialize auth system
export async function initializeAuth() {
  try {
    console.log("🔧 Initializing auth system...")

    // Test database connectivity
    const dbStatus = await multiDB.getStatus()
    console.log("📊 Database status:", dbStatus)

    return {
      success: true,
      message: "Auth system initialized",
      debug: { dbStatus }
    }
  } catch (error) {
    console.error("❌ Auth initialization error:", error)
    return {
      success: false,
      message: "Auth initialization failed",
      debug: error instanceof Error ? error.message : String(error)
    }
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<AuthResult> {
  try {
    console.log("👤 Getting user profile:", userId)

    // For demo admin user
    if (userId === "demo-user-1") {
      const user: User = {
        id: "demo-user-1",
        username: "ankunstudio",
        email: "admin@ankunstudio.com",
        fullName: "An Kun Studio Digital Music Distribution",
        role: "Label Manager",
        avatar: "/images/avatar-placeholder.jpg",
        password: "admin", // In production, this should be hashed
        createdAt: new Date().toISOString()
      }
      return {
        success: true,
        user,
        message: "Profile retrieved"
      }
    }

    // For other users, database lookup would go here
    return {
      success: false,
      message: "User not found"
    }

  } catch (error) {
    console.error("❌ Get profile error:", error)
    return {
      success: false,
      message: "Profile service error",
      debug: error instanceof Error ? error.message : String(error)
    }
  }
}
