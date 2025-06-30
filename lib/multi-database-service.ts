// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

import { neon } from "@neondatabase/serverless"

// Database priority: Neon -> WordPress -> Demo Mode (Supabase disabled per user request)
export class MultiDatabaseService {
  private neonSql: any = null
  private neonAvailable = true
  private wordpressAvailable = true

  constructor() {
    // Initialize async operations separately
  }

  async initialize() {
    await this.initializeDatabases()
  }

  private async initializeDatabases() {
  // Initialize Neon (Primary - User's preference)
    try {
      if (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) {
        this.neonSql = neon(process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL)

        // Test Neon connection
        await this.neonSql`SELECT NOW() as current_time`
        this.neonAvailable = true
        console.log("✅ Neon connected and ready")
      }
    } catch (error) {
      console.log("⚠️ Neon not available:", (error as Error).message)
    }

    // WordPress check (Secondary)
    try {
      // Simple WordPress check via REST API
      if (process.env.WORDPRESS_API_URL) {
        const response = await fetch(process.env.WORDPRESS_API_URL, { method: 'HEAD' })
        if (response.ok) {
          this.wordpressAvailable = true
          console.log("✅ WordPress API available")
        }
      }
    } catch (error) {
      console.log("⚠️ WordPress not available:", (error as Error).message)
    }

    console.log("🗄️ Database Status:", {
      supabase: false, // Disabled per user request
      neon: this.neonAvailable,
    })
  }

  async authenticateUser(username: string, password: string) {
    console.log("🔐 Multi-DB Authentication for:", username)

    // Ensure initialization is complete
    if (!this.neonAvailable && !this.wordpressAvailable) {
      await this.initialize()
    }

    // Try Neon first (User's preference)
    if (this.neonAvailable) {
      try {
        // Check label_manager table first (admin users)
        const adminResult = await this.neonSql`
          SELECT * FROM label_manager 
          WHERE username = ${username} AND password = ${password}
          LIMIT 1
        `

        if (adminResult.length > 0) {
          const user = adminResult[0]
          console.log("✅ Neon admin authentication successful")
          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullname ?? user.username,
              role: "Admin",
              avatar: "/face.png",
              table: "label_manager"
            },
            source: "Neon",
          }
        }

        // Check artist table (artist users)
        const artistResult = await this.neonSql`
          SELECT * FROM artist 
          WHERE username = ${username} AND password = ${password}
          LIMIT 1
        `

        if (artistResult.length > 0) {
          const user = artistResult[0]
          console.log("✅ Neon artist authentication successful")
          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullname ?? user.username,
              role: "Artist",
              avatar: user.avatar ?? "/face.png",
              table: "artist"
            },
            source: "Neon",
          }
        }
      } catch (error) {
        console.log("⚠️ Neon auth failed:", (error as Error).message)
      }
    }

    // WordPress authentication (if available)
    if (this.wordpressAvailable) {
      try {
        // TODO: Implement WordPress authentication via REST API
        console.log("⚠️ WordPress authentication not yet implemented")
      } catch (error) {
        console.log("⚠️ WordPress auth failed:", (error as Error).message)
      }
    }

    // Fallback to demo accounts
    const demoUsers = [
      {
        id: "admin-demo",
        username: "admin",
        email: "admin@aksstudio.com",
        fullName: "Administrator",
        role: "Label Manager",
        avatar: "/face.png",
      },
      {
        id: "ankunstudio-demo",
        username: "ankunstudio",
        email: "ankunstudio@gmail.com",
        fullName: "An Kun Studio",
        role: "Label Manager",
        avatar: "/Logo-An-Kun-Studio-Black.png",
      },
      {
        id: "artist-demo",
        username: "artist",
        email: "artist@aksstudio.com",
        fullName: "Demo Artist",
        role: "Artist",
        avatar: "/face.png",
      },
    ]

    const demoUser = demoUsers.find((u) => u.username === username)
    const validPassword =
      (username === "admin" && password === "admin") ||
      (username === "artist" && password === "123456") ||
      (username === "ankunstudio" && password === "admin")

    if (demoUser && validPassword) {
      console.log("✅ Demo authentication successful")
      return {
        success: true,
        user: demoUser,
        source: "Demo Fallback",
      }
    }

    return {
      success: false,
      message: "Invalid credentials",
    }
  }

  async createUser(userData: {
    username: string
    email: string
    password: string
    fullName?: string
    role?: string
  }) {
    console.log("👤 Creating user:", userData.username)

    // Try creating in Neon first
    if (this.neonAvailable) {
      try {
        // Check if user exists
        const existingUser = await this.neonSql`
          SELECT id FROM artist 
          WHERE username = ${userData.username} OR email = ${userData.email}
          LIMIT 1
        `

        if (existingUser.length > 0) {
          return {
            success: false,
            message: "Username or email already exists",
          }
        }

        // Create new artist
        const result = await this.neonSql`
          INSERT INTO artist (username, email, password, fullname, avatar, bio, facebook, youtube, spotify, applemusic, tiktok, instagram)
          VALUES (${userData.username}, ${userData.email}, ${userData.password}, 
                  ${userData.fullName ?? userData.username}, '/face.png', '', '', '', '', '', '', '')
          RETURNING *
        `

        if (result.length > 0) {
          console.log("✅ User created successfully in Neon")
          return {
            success: true,
            user: result[0],
            source: "Neon",
          }
        }
      } catch (error) {
        console.log("⚠️ Neon user creation failed:", (error as Error).message)
      }
    }

    return {
      success: false,
      message: "Failed to create user - no available database",
    }
  }

  async getStatus() {
    // Ensure initialization is complete
    if (!this.neonAvailable && !this.wordpressAvailable) {
      await this.initialize()
    }

    return {
      neon: this.neonAvailable,
      wordpress: this.wordpressAvailable,
      supabase: false, // Disabled per user request
    }
  }
}

// Export singleton instance
export const multiDB = new MultiDatabaseService()
