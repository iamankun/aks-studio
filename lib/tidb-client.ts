import mysql from "mysql2/promise"

// TiDB Cloud Client - chỉ sử dụng DB_ environment variables
export const TIDB_CONFIG = {
  host: process.env.DB_HOST || "42.119.149.253", // Updated IP address
  port: Number.parseInt(process.env.DB_PORT || "4000"),
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "test",
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
}

let connection: mysql.Connection | null = null

export async function getTiDBConnection() {
  try {
    if (!connection) {
      console.log("🔗 Connecting to TiDB Cloud at:", TIDB_CONFIG.host)
      connection = await mysql.createConnection(TIDB_CONFIG)
      console.log("✅ TiDB Cloud connection established")
    }
    return connection
  } catch (error) {
    console.error("❌ TiDB Cloud connection failed:", error)
    throw error
  }
}

export async function testTiDBConnection() {
  try {
    const conn = await getTiDBConnection()
    const [rows] = await conn.execute("SELECT 1 as test")
    console.log("✅ TiDB Cloud test query successful:", rows)
    return { success: true, message: "TiDB Cloud connection successful" }
  } catch (error) {
    console.error("❌ TiDB Cloud test failed:", error)
    return {
      success: false,
      message: `TiDB Cloud connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function createTablesIfNotExists() {
  try {
    const conn = await getTiDBConnection()

    // Create users table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('Artist', 'Label Manager') DEFAULT 'Artist',
        avatar TEXT,
        bio TEXT,
        social_links JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create submissions table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        uploader_username VARCHAR(50) NOT NULL,
        artist_name VARCHAR(100) NOT NULL,
        song_title VARCHAR(200) NOT NULL,
        isrc VARCHAR(20),
        audio_url TEXT,
        image_url TEXT,
        audio_files_count INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Đã nhận, đang chờ duyệt',
        submission_date DATE,
        release_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploader_username) REFERENCES users(username)
      )
    `)

    // Insert default users if they don't exist
    await conn.execute(`
      INSERT IGNORE INTO users (id, username, email, password_hash, full_name, role) VALUES
      ('admin-001', 'admin', 'admin@aksstudio.com', '$2b$10$hash_for_admin', 'Administrator', 'Label Manager'),
      ('artist-001', 'artist', 'artist@aksstudio.com', '$2b$10$hash_for_123456', 'Demo Artist', 'Artist')
    `)

    console.log("✅ TiDB Cloud tables created/verified successfully")
    return { success: true, message: "Tables created successfully" }
  } catch (error) {
    console.error("❌ TiDB Cloud table creation failed:", error)
    return {
      success: false,
      message: `Table creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function queryTiDB(query: string, params: any[] = []) {
  try {
    const conn = await getTiDBConnection()
    const [rows] = await conn.execute(query, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("❌ TiDB Cloud query failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// User authentication functions
export async function authenticateUser(username: string, password: string) {
  try {
    const result = await queryTiDB("SELECT * FROM users WHERE username = ? OR email = ?", [username, username])

    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      return { success: false, message: "User not found" }
    }

    const user = result.data[0] as any

    // For demo purposes, simple password check
    // In production, use bcrypt to compare hashed passwords
    const isValidPassword = password === "admin" || password === "123456"

    if (!isValidPassword) {
      return { success: false, message: "Invalid password" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        socialLinks: user.social_links ? JSON.parse(user.social_links) : {},
      },
    }
  } catch (error) {
    console.error("❌ TiDB authentication failed:", error)
    return {
      success: false,
      message: `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  fullName?: string
  role?: string
}) {
  try {
    const id = `user-${Date.now()}`
    const result = await queryTiDB(
      "INSERT INTO users (id, username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id,
        userData.username,
        userData.email,
        `$2b$10$hash_for_${userData.password}`, // In production, use bcrypt
        userData.fullName || userData.username,
        userData.role || "Artist",
      ],
    )

    if (!result.success) {
      return { success: false, message: "Failed to create user" }
    }

    return { success: true, message: "User created successfully", userId: id }
  } catch (error) {
    console.error("❌ TiDB user creation failed:", error)
    return {
      success: false,
      message: `User creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Close connection when needed
export async function closeTiDBConnection() {
  if (connection) {
    await connection.end()
    connection = null
    console.log("🔌 TiDB Cloud connection closed")
  }
}

// TiDB API Client
export class TiDBClient {
  private baseUrl = TIDB_CONFIG.host

  async query(sql: string) {
    try {
      console.log("🔍 TiDB Query:", sql)

      const conn = await getTiDBConnection()
      const [rows] = await conn.execute(sql)

      console.log("✅ TiDB Query Success")
      return {
        success: true,
        rows: rows || [],
      }
    } catch (error) {
      console.error("🚨 TiDB Client Error:", error)
      return {
        success: false,
        error: error.message,
        rows: [],
      }
    }
  }

  async testConnection() {
    try {
      console.log("🔍 Testing TiDB connection...")

      const testQuery = "SELECT 1 as test"
      const result = await this.query(testQuery)

      if (result.success) {
        console.log("✅ TiDB connection successful")
        return { success: true, message: "Connection successful" }
      } else {
        console.error("❌ TiDB connection failed:", result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("🚨 TiDB connection test error:", error)
      return { success: false, error: error.message }
    }
  }
}

export const tidbClient = new TiDBClient()
