import { tidbClient } from "./tidb-client"
import type { User } from "@/types/user"

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
  debug?: any
}

// Tạo tables nếu chưa có
export async function initializeTables() {
  try {
    console.log("🔍 Initializing TiDB tables...")

    // Test connection first
    const connectionTest = await tidbClient.testConnection()
    if (!connectionTest.success) {
      console.error("❌ TiDB connection failed")
      return { success: false, error: "Database connection failed" }
    }

    // Tạo label_manager table
    const createLabelManager = `
      CREATE TABLE IF NOT EXISTS label_manager (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT DEFAULT '/face.png',
        bio TEXT DEFAULT '',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        facebook TEXT DEFAULT '',
        youtube TEXT DEFAULT '',
        spotify TEXT DEFAULT '',
        applemusic TEXT DEFAULT '',
        tiktok TEXT DEFAULT '',
        instagram TEXT DEFAULT '',
        background_type VARCHAR(50) DEFAULT 'video',
        background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background_video_url TEXT DEFAULT '',
        background_opacity DECIMAL(3,2) DEFAULT 0.3,
        background_playlist TEXT DEFAULT 'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
      )
    `

    const labelResult = await tidbClient.query(createLabelManager)
    if (!labelResult.success) {
      return { success: false, error: labelResult.error }
    }

    // Tạo artist table
    const createArtist = `
      CREATE TABLE IF NOT EXISTS artist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT DEFAULT '/face.png',
        bio TEXT DEFAULT '',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        facebook TEXT DEFAULT '',
        youtube TEXT DEFAULT '',
        spotify TEXT DEFAULT '',
        applemusic TEXT DEFAULT '',
        tiktok TEXT DEFAULT '',
        instagram TEXT DEFAULT ''
      )
    `

    const artistResult = await tidbClient.query(createArtist)
    if (!artistResult.success) {
      return { success: false, error: artistResult.error }
    }

    // Tạo submissions table
    const createSubmissions = `
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artist_id INT,
        title VARCHAR(255) NOT NULL,
        artist_name VARCHAR(255) NOT NULL,
        release_type VARCHAR(50) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        release_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        tracks JSON,
        artwork_url TEXT,
        isrc_code VARCHAR(50),
        copyright_info JSON
      )
    `

    const submissionsResult = await tidbClient.query(createSubmissions)
    if (!submissionsResult.success) {
      return { success: false, error: submissionsResult.error }
    }

    // Insert default admin nếu chưa có
    const checkAdmin = await tidbClient.query("SELECT id FROM label_manager WHERE username = 'ankunstudio' LIMIT 1")

    if (checkAdmin.success && checkAdmin.rows.length === 0) {
      const insertAdmin = `
        INSERT INTO label_manager (
          username, password, fullname, email, avatar, bio,
          facebook, youtube, spotify, applemusic, tiktok, instagram,
          background_playlist
        ) VALUES (
          'ankunstudio', 'admin', 'An Kun Studio Digital Music Distribution',
          'admin@ankun.dev', '/face.png', 'Digital Music Distribution Platform',
          '', '', '', '', '', '',
          'PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO'
        )
      `

      await tidbClient.query(insertAdmin)
      console.log("✅ Default admin created")
    }

    console.log("✅ TiDB tables initialized successfully")
    return { success: true }
  } catch (error) {
    console.error("🚨 Initialize tables error:", error)
    return { success: false, error: error.message }
  }
}

// Server-side authentication với TiDB
export async function authenticateUserServer(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("🔍 TiDB Authentication for:", username)

    // Initialize tables first
    const initResult = await initializeTables()
    if (!initResult.success) {
      console.log("❌ TiDB initialization failed, using fallback")
      return authenticateUserLocal(username, password)
    }

    // Query label_manager
    const labelManagerQuery = `
      SELECT * FROM label_manager 
      WHERE username = '${username.replace(/'/g, "''")}' AND password = '${password.replace(/'/g, "''")}' 
      LIMIT 1
    `

    const labelResult = await tidbClient.query(labelManagerQuery)

    if (labelResult.success && labelResult.rows.length > 0) {
      const userData = labelResult.rows[0]
      console.log("✅ Found Label Manager:", userData.username)

      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        role: "Label Manager",
        full_name: userData.fullname,
        email: userData.email,
        avatar_url: userData.avatar || "/face.png",
        bio: userData.bio || "",
        social_links: {
          facebook: userData.facebook || "",
          youtube: userData.youtube || "",
          spotify: userData.spotify || "",
          appleMusic: userData.applemusic || "",
          tiktok: userData.tiktok || "",
          instagram: userData.instagram || "",
        },
        created_at: userData.createdat,
        background_settings: {
          type: userData.background_type || "video",
          gradient: userData.background_gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          video_url: userData.background_video_url || "",
          opacity: userData.background_opacity || 0.3,
          playlist: userData.background_playlist || "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
        },
      }

      return {
        success: true,
        user,
        debug: { source: "tidb", table: "label_manager" },
      }
    }

    // Query artist
    const artistQuery = `
      SELECT * FROM artist 
      WHERE username = '${username.replace(/'/g, "''")}' AND password = '${password.replace(/'/g, "''")}' 
      LIMIT 1
    `

    const artistResult = await tidbClient.query(artistQuery)

    if (artistResult.success && artistResult.rows.length > 0) {
      const userData = artistResult.rows[0]
      console.log("✅ Found Artist:", userData.username)

      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        role: "Artist",
        full_name: userData.fullname,
        email: userData.email,
        avatar_url: userData.avatar || "/face.png",
        bio: userData.bio || "",
        social_links: {
          facebook: userData.facebook || "",
          youtube: userData.youtube || "",
          spotify: userData.spotify || "",
          appleMusic: userData.applemusic || "",
          tiktok: userData.tiktok || "",
          instagram: userData.instagram || "",
        },
        created_at: userData.createdat,
      }

      return {
        success: true,
        user,
        debug: { source: "tidb", table: "artist" },
      }
    }

    console.log("❌ No user found in TiDB, using fallback")
    return authenticateUserLocal(username, password)
  } catch (error) {
    console.error("🚨 TiDB authentication error:", error)
    return authenticateUserLocal(username, password)
  }
}

// Fallback authentication
export function authenticateUserLocal(username: string, password: string): AuthResult {
  console.log("🔍 Local fallback authentication for:", username)

  if (username === "ankunstudio" && password === "admin") {
    console.log("✅ Local authentication successful")

    const user: User = {
      id: "1",
      username: "ankunstudio",
      role: "Label Manager",
      full_name: "An Kun Studio Digital Music Distribution",
      email: "admin@ankun.dev",
      avatar_url: "/face.png",
      bio: "Digital Music Distribution Platform",
      social_links: {
        facebook: "",
        youtube: "",
        spotify: "",
        appleMusic: "",
        tiktok: "",
        instagram: "",
      },
      created_at: new Date().toISOString(),
      background_settings: {
        type: "video",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        video_url: "",
        opacity: 0.3,
        playlist: "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      },
    }

    return {
      success: true,
      user,
      debug: { source: "fallback" },
    }
  }

  return {
    success: false,
    message: "Invalid credentials",
  }
}

// Register new artist
export async function registerArtist(userData: {
  username: string
  password: string
  email: string
  fullname: string
}): Promise<AuthResult> {
  try {
    console.log("🔍 Registering new artist:", userData.username)

    // Initialize tables first
    const initResult = await initializeTables()
    if (!initResult.success) {
      return {
        success: false,
        message: "Database not available",
      }
    }

    // Check if user exists
    const checkQuery = `
      SELECT id FROM artist 
      WHERE username = '${userData.username.replace(/'/g, "''")}' OR email = '${userData.email.replace(/'/g, "''")}' 
      LIMIT 1
    `

    const checkResult = await tidbClient.query(checkQuery)

    if (checkResult.success && checkResult.rows.length > 0) {
      return {
        success: false,
        message: "Username or email already exists",
      }
    }

    // Insert new artist
    const insertQuery = `
      INSERT INTO artist (
        username, password, fullname, email, avatar, bio,
        facebook, youtube, spotify, applemusic, tiktok, instagram
      ) VALUES (
        '${userData.username.replace(/'/g, "''")}', 
        '${userData.password.replace(/'/g, "''")}', 
        '${userData.fullname.replace(/'/g, "''")}', 
        '${userData.email.replace(/'/g, "''")}',
        '/face.png', '', '', '', '', '', '', ''
      )
    `

    const insertResult = await tidbClient.query(insertQuery)

    if (insertResult.success) {
      return {
        success: true,
        message: "Registration successful",
      }
    } else {
      return {
        success: false,
        message: insertResult.error || "Registration failed",
      }
    }
  } catch (error) {
    console.error("🚨 Registration error:", error)
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
    }
  }
}

// Main authentication function
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    console.log("🔍 Main authentication for:", username)

    // For client-side, call API route
    if (typeof window !== "undefined") {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (result.success && result.user) {
        return result.user
      }

      return null
    }

    // For server-side, call directly
    const result = await authenticateUserServer(username, password)
    return result.success ? result.user || null : null
  } catch (error) {
    console.error("🚨 Main authentication error:", error)
    return null
  }
}
