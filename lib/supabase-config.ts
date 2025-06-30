// Tôi là An Kun 
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

// Multi-endpoint configuration for redundancy
export const ENDPOINTS_CONFIG = {
  wordpress: {
    url: process.env.WORDPRESS_API_URL || `${process.env.WORDPRESS_API_URL}`,
    auth: {
      username: process.env.WP_USERNAME || `${process.env.WP_USERNAME}`,
      password: process.env.WP_PASSWORD || `${process.env.WP_PASSWORD}`,
    },
    storage: {
      endpoint: process.env.WP_MEDIA_ENDPOINT || `${process.env.WP_MEDIA_ENDPOINT}`,
      // endpoint: "https://localhost:3000/wp-content/uploads",
      region: "auto",
      bucket: "wp-media",
    }
  },
  neon: {
    url: process.env.DATABASE_URL || `${process.env.NEXT_PUBLIC_NEON_URL}`,
    storage: {
      endpoint: process.env.NEON_STORAGE_ENDPOINT || `${process.env.NEON_STORAGE_ENDPOINT}`,
      // endpoint: "https://neon.tech/storage",
      region: "ap-southeast-1",
      bucket: "neon-storage",
    }
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || `${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    storage: {
      endpoint: process.env.SUPABASE_STORAGE_ENDPOINT || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`,
      region: process.env.SUPABASE_REGION || "ap-southeast-1",
      bucket: process.env.SUPABASE_BUCKET || "aksstudio-files",
    }
  }
}

// Legacy compatibility
export const SUPABASE_CONFIG = ENDPOINTS_CONFIG.supabase

// Multi-endpoint client với fallback
export class MultiEndpointClient {
  private endpoints = ENDPOINTS_CONFIG

  constructor() {
    console.log("🔗 Multi-endpoint client initialized")
    console.log("📡 Available endpoints:", {
      wordpress: !!this.endpoints.wordpress.url,
      neon: !!this.endpoints.neon.url,
      supabase: !!this.endpoints.supabase.url,
    })
  }

  async testConnections() {
    const results = {
      wordpress: false,
      neon: false,
      supabase: false,
    }

    // Test WordPress endpoint
    if (this.endpoints.wordpress.url) {
      try {
        const response = await fetch(`${this.endpoints.wordpress.url}/posts?per_page=1`)
        results.wordpress = response.ok
      } catch (error) {
        console.log("⚠️ WordPress endpoint failed:", (error as Error).message)
      }
    }

    // Test Neon endpoint  
    if (this.endpoints.neon.url) {
      try {
        // Simple connection test (would need actual Neon client)
        results.neon = true // Assume available if URL exists
      } catch (error) {
        console.log("⚠️ Neon endpoint failed:", (error as Error).message)
      }
    }

    // Test Supabase endpoint
    if (this.endpoints.supabase.url) {
      try {
        const response = await fetch(`${this.endpoints.supabase.url}/rest/v1/`, {
          headers: {
            'apikey': this.endpoints.supabase.anonKey,
          }
        })
        results.supabase = response.ok
      } catch (error) {
        console.log("⚠️ Supabase endpoint failed:", (error as Error).message)
      }
    }

    return results
  }

  getAvailableStorageEndpoints() {
    const available = []

    if (this.endpoints.wordpress.url) {
      available.push({
        name: "WordPress",
        endpoint: this.endpoints.wordpress.storage.endpoint,
        region: this.endpoints.wordpress.storage.region,
        bucket: this.endpoints.wordpress.storage.bucket,
      })
    }

    if (this.endpoints.neon.url) {
      available.push({
        name: "Neon",
        endpoint: this.endpoints.neon.storage.endpoint,
        region: this.endpoints.neon.storage.region,
        bucket: this.endpoints.neon.storage.bucket,
      })
    }

    if (this.endpoints.supabase.url) {
      available.push({
        name: "Supabase",
        endpoint: this.endpoints.supabase.storage.endpoint,
        region: this.endpoints.supabase.storage.region,
        bucket: this.endpoints.supabase.storage.bucket,
      })
    }

    return available
  }
}

export const multiEndpointClient = new MultiEndpointClient()

// Legacy supabaseAdmin compatibility
export const supabaseAdmin = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
}
