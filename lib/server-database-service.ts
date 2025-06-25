import { createClient } from "@supabase/supabase-js"

// Server-only database service
export class ServerDatabaseService {
  private supabase: any = null
  private neonSql: any = null
  private supabaseAvailable = false
  private neonAvailable = false

  constructor() {
    // Only initialize on server side
    if (typeof window === "undefined") {
      this.initializeDatabases()
    }
  }

  private async initializeDatabases() {
    // Initialize Supabase
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        this.supabaseAvailable = true
        console.log("✅ Supabase initialized (server)")
      }
    } catch (error) {
      console.log("⚠️ Supabase not available:", error.message)
    }

    // Initialize Neon with dynamic import
    try {
      if (process.env.DATABASE_URL) {
        const { neon } = await import("@neondatabase/serverless")
        this.neonSql = neon(process.env.DATABASE_URL)
        this.neonAvailable = true
        console.log("✅ Neon initialized (server)")
      }
    } catch (error) {
      console.log("⚠️ Neon not available:", error.message)
    }
  }

  async authenticateUser(username: string, password: string) {
    console.log("🔐 Server-DB Authentication for:", username)

    // Try Supabase first
    if (this.supabaseAvailable) {
      try {
        await this.createTablesIfNeeded()

        const { data, error } = await this.supabase
          .from("users")
          .select("*")
          .or(`username.eq.${username},email.eq.${username}`)
          .maybeSingle()

        if (data && !error) {
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
    if (this.neonAvailable && this.neonSql) {
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
    if (this.supabaseAvailable) {
      try {
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
        console.log("⚠️ Table seeding failed:", error.message)
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
    if (this.neonAvailable && this.neonSql) {
      try {
        const userId = `user-${Date.now()}`
        await this.neonSql`
          INSERT INTO users (id, username, email, password_hash, full_name, role, avatar)
          VALUES (${userId}, ${userData.username}, ${userData.email}, 
                  ${userData.password}, ${userData.fullName || userData.username}, 
                  ${userData.role || "Artist"}, ${"/face.png"})
        `

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
      primary: this.supabaseAvailable ? "Supabase" : this.neonAvailable ? "Neon" : "Demo Mode",
    }
  }
}

// Only create instance on server side
export const serverDB = typeof window === "undefined" ? new ServerDatabaseService() : null
