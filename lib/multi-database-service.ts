import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"
import { tidbClient, authenticateUser as tidbAuth } from "./tidb-client"

// Database priority: Supabase -> Neon -> Demo Mode (TiDB optional)
export class MultiDatabaseService {
  private supabase: any = null
  private neonSql: any = null
  private supabaseAvailable = false
  private neonAvailable = false
  private tidbAvailable = false

  constructor() {
    this.initializeDatabases()
  }

  private async initializeDatabases() {
    // Initialize Supabase (Primary)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Test Supabase connection
        const { data, error } = await this.supabase.from("users").select("count").limit(1)
        if (!error) {
          this.supabaseAvailable = true
          console.log("✅ Supabase connected and ready")
        }
      }
    } catch (error) {
      console.log("⚠️ Supabase not available:", error.message)
    }

    // Initialize Neon (Secondary)
    try {
      if (process.env.DATABASE_URL) {
        this.neonSql = neon(process.env.DATABASE_URL)

        // Test Neon connection
        await this.neonSql`SELECT 1`
        this.neonAvailable = true
        console.log("✅ Neon connected and ready")
      }
    } catch (error) {
      console.log("⚠️ Neon not available:", error.message)
    }

    // TiDB is optional - only if DB_HOST is provided
    if (process.env.DB_HOST) {
      try {
        const tidbTest = await tidbClient.testConnection()
        this.tidbAvailable = tidbTest.success
        console.log("✅ TiDB available:", this.tidbAvailable)
      } catch (error) {
        console.log("⚠️ TiDB not available:", error.message)
      }
    } else {
      console.log("ℹ️ TiDB skipped - no DB_HOST provided")
    }

    console.log("🗄️ Database Status:", {
      supabase: this.supabaseAvailable,
      neon: this.neonAvailable,
      tidb: this.tidbAvailable,
    })
  }

  async authenticateUser(username: string, password: string) {
    console.log("🔐 Multi-DB Authentication for:", username)

    // Try Supabase first (most reliable)
    if (this.supabaseAvailable) {
      try {
        // First check if users table exists, if not create it
        await this.createTablesIfNeeded()

        const { data, error } = await this.supabase
          .from("users")
          .select("*")
          .or(`username.eq.${username},email.eq.${username}`)
          .maybeSingle()

        if (data && !error) {
          // Simple password check for demo
          const validPassword =
            (username === "admin" && password === "admin") ||
            (username === "artist" && password === "123456") ||
            (username === "ankunstudio" && password === "admin")

          if (validPassword) {
            console.log("✅ Supabase authentication successful")
            return {
              success: true,
              user: {
                id: data.id,
                username: data.username,
                email: data.email,
                fullName: data.full_name,
                role: data.role,
                avatar: data.avatar || "/face.png",
              },
              source: "Supabase",
            }
          }
        }
      } catch (error) {
        console.log("⚠️ Supabase auth failed:", error.message)
      }
    }

    // Try Neon second
    if (this.neonAvailable) {
      try {
        const result = await this.neonSql`
          SELECT * FROM users 
          WHERE username = ${username} OR email = ${username}
          LIMIT 1
        `

        if (result.length > 0) {
          const user = result[0]
          const validPassword =
            (username === "admin" && password === "admin") ||
            (username === "artist" && password === "123456") ||
            (username === "ankunstudio" && password === "admin")

          if (validPassword) {
            console.log("✅ Neon authentication successful")
            return {
              success: true,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                avatar: user.avatar || "/face.png",
              },
              source: "Neon",
            }
          }
        }
      } catch (error) {
        console.log("⚠️ Neon auth failed:", error.message)
      }
    }

    // Try TiDB if available
    if (this.tidbAvailable) {
      try {
        const result = await tidbAuth(username, password)
        if (result.success) {
          console.log("✅ TiDB authentication successful")
          return { ...result, source: "TiDB Cloud" }
        }
      } catch (error) {
        console.log("⚠️ TiDB auth failed:", error.message)
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

  async createTablesIfNeeded() {
    // Create tables in Supabase if they don't exist
    if (this.supabaseAvailable) {
      try {
        // Check if users table exists
        const { data: users } = await this.supabase.from("users").select("count").limit(1)

        if (!users) {
          console.log("📋 Creating users table in Supabase...")
          // Table will be created via Supabase dashboard or SQL editor
        }

        // Insert demo users if table is empty
        const { data: existingUsers } = await this.supabase.from("users").select("id").limit(1)

        if (!existingUsers || existingUsers.length === 0) {
          console.log("👥 Inserting demo users...")
          await this.supabase.from("users").insert([
            {
              id: "admin-001",
              username: "admin",
              email: "admin@aksstudio.com",
              password_hash: "admin",
              full_name: "Administrator",
              role: "Label Manager",
              avatar: "/face.png",
            },
            {
              id: "ankunstudio-001",
              username: "ankunstudio",
              email: "ankunstudio@gmail.com",
              password_hash: "admin",
              full_name: "An Kun Studio",
              role: "Label Manager",
              avatar: "/Logo-An-Kun-Studio-Black.png",
            },
            {
              id: "artist-001",
              username: "artist",
              email: "artist@aksstudio.com",
              password_hash: "123456",
              full_name: "Demo Artist",
              role: "Artist",
              avatar: "/face.png",
            },
          ])
        }
      } catch (error) {
        console.log("⚠️ Table creation/seeding failed:", error.message)
      }
    }
  }

  async createUser(userData: {
    username: string
    email: string
    password: string
    fullName?: string
    role?: string
  }) {
    console.log("📝 Multi-DB User Creation:", userData.username)

    // Try Supabase first
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await this.supabase
          .from("users")
          .insert([
            {
              id: `user-${Date.now()}`,
              username: userData.username,
              email: userData.email,
              password_hash: userData.password,
              full_name: userData.fullName || userData.username,
              role: userData.role || "Artist",
              avatar: "/face.png",
            },
          ])
          .select()

        if (!error && data) {
          console.log("✅ User created in Supabase")
          return {
            success: true,
            message: "User created successfully",
            userId: data[0].id,
            source: "Supabase",
          }
        }
      } catch (error) {
        console.log("⚠️ Supabase user creation failed:", error.message)
      }
    }

    // Try Neon second
    if (this.neonAvailable) {
      try {
        const userId = `user-${Date.now()}`
        await this.neonSql`
          INSERT INTO users (id, username, email, password_hash, full_name, role, avatar)
          VALUES (${userId}, ${userData.username}, ${userData.email}, 
                  ${userData.password}, ${userData.fullName || userData.username}, 
                  ${userData.role || "Artist"}, ${"/face.png"})
        `

        console.log("✅ User created in Neon")
        return {
          success: true,
          message: "User created successfully",
          userId,
          source: "Neon",
        }
      } catch (error) {
        console.log("⚠️ Neon user creation failed:", error.message)
      }
    }

    return {
      success: false,
      message: "Failed to create user in any database",
    }
  }

  getStatus() {
    return {
      supabase: this.supabaseAvailable,
      neon: this.neonAvailable,
      tidb: this.tidbAvailable,
      primary: this.supabaseAvailable
        ? "Supabase"
        : this.neonAvailable
          ? "Neon"
          : this.tidbAvailable
            ? "TiDB Cloud"
            : "Demo Mode",
    }
  }
}

export const multiDB = new MultiDatabaseService()
