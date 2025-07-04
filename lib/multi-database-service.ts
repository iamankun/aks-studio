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

  // Helper function để chuẩn hóa submissions với file mặc định
  private normalizeSubmissions(submissions: any[]): any[] {
    return submissions.map(submission => {
      // Xử lý tên nghệ sĩ với logic Various Artist
      let processedArtistName = submission.artist_name ?? submission.artists ?? '';

      // Nếu không có tên nghệ sĩ hoặc rỗng
      if (!processedArtistName || processedArtistName.trim() === '') {
        processedArtistName = 'Various Artist';
      } else {
        // Kiểm tra nếu có nhiều hơn 3 nghệ sĩ (phân cách bằng dấu phẩy, &, hoặc feat)
        const artistSeparators = /[,&]|feat\.|featuring|ft\./gi;
        const artistCount = processedArtistName.split(artistSeparators).length;

        if (artistCount > 3) {
          processedArtistName = 'Various Artist';
        }
      }

      return {
        ...submission,
        // Nếu không có ảnh cover hoặc artwork, sử dụng ảnh mặc định
        cover_art_url: submission.cover_art_url ?? submission.artwork_path ?? '/dianhac.jpg',
        artwork_path: submission.artwork_path ?? submission.cover_art_url ?? '/dianhac.jpg',
        imageUrl: submission.imageUrl ?? submission.cover_art_url ?? submission.artwork_path ?? '/dianhac.jpg',

        // Nếu không có file audio, sử dụng file mặc định
        audio_file_url: submission.audio_file_url ?? submission.file_path ?? '/VNA2P25XXXXX.wav',
        file_path: submission.file_path ?? submission.audio_file_url ?? '/VNA2P25XXXXX.wav',
        audioUrl: submission.audioUrl ?? submission.audio_file_url ?? submission.file_path ?? '/VNA2P25XXXXX.wav',

        // Đảm bảo các trường bắt buộc với logic Various Artist
        track_title: submission.track_title ?? submission.title ?? 'Untitled Track',
        artist_name: processedArtistName,
        status: submission.status ?? 'pending',
        genre: submission.genre ?? 'Unknown',
        submission_date: submission.submission_date ?? submission.created_at ?? new Date().toISOString()
      }
    })
  }

  // Initialize async operations separately

  async initialize() {
    await this.initializeDatabases()
  }

  private async initializeDatabases() {
  // Initialize Neon (Primary - User's preference)
    try {
      // Ưu tiên dùng Neon Local nếu đang ở môi trường development
      const isLocalDev = process.env.APP_MODE && process.env.USE_NEON_LOCAL === 'true';
      const connectionString = isLocalDev
        ? 'postgresql://postgres:postgres@localhost:5432/dmg'
        : process.env.DATABASE_URL;

      if (connectionString) {
        console.log(`🔌 Connecting to ${isLocalDev ? 'Neon Local' : 'Neon Cloud'}`);
        this.neonSql = neon(connectionString);

        // Test Neon connection
        const result = await this.neonSql`SELECT NOW() as current_time`;
        this.neonAvailable = true;
        console.log(`✅ ${isLocalDev ? 'Neon Local' : 'Neon Cloud'} connected and ready:`, result[0]?.current_time);
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
    console.log("🔐 Multi-DB Authentication for:", username);

    if (!this.neonSql) {
      await this.initializeDatabases();
    }

    // Try Neon first (User's preference)
    if (this.neonAvailable) {
      const neonAuthResult = await this.tryNeonAuthentication(username, password);
      if (neonAuthResult) return neonAuthResult;
    }

    // WordPress authentication (if available)
    if (this.wordpressAvailable) {
      const wpAuthResult = await this.tryWordPressAuthentication(username, password);
      if (wpAuthResult) return wpAuthResult;
    }

    // Fallback to demo accounts
    const demoAuthResult = this.tryDemoAuthentication(username, password);
    if (demoAuthResult) return demoAuthResult;

    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  private async tryNeonAuthentication(username: string, password: string) {
    try {
      // Check label_manager table first (admin users)
      const adminResult = await this.neonSql`
        SELECT * FROM label_manager 
        WHERE username = ${username}
        LIMIT 1
      `;
      if (adminResult.length > 0) {
        const user = adminResult[0];
        if (await this.isPasswordValid(password, user.password_hash)) {
          console.log("✅ Neon admin authentication successful");
          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.full_name ?? user.username,
              role: "Label Manager",
              avatar: user.avatar ?? "/face.png",
              table: "label_manager"
            },
            source: "Neon",
          };
        }
      }

      // Check artist table (artist users)
      const artistResult = await this.neonSql`
        SELECT * FROM artist 
        WHERE username = ${username}
        LIMIT 1
      `;
      if (artistResult.length > 0) {
        const user = artistResult[0];
        if (await this.isPasswordValid(password, user.password_hash)) {
          console.log("✅ Neon artist authentication successful");
          return {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.real_name ?? user.artist_name ?? user.username,
              role: "Artist",
              avatar: user.avatar_url ?? "/face.png",
              table: "artist"
            },
            source: "Neon",
          };
        }
      }
    } catch (error) {
      console.log("⚠️ Neon auth failed:", (error as Error).message);
    }
    return null;
  }

  private async isPasswordValid(password: string, passwordHash: string): Promise<boolean> {
    if (passwordHash?.startsWith('$2b$')) {
      try {
        const bcrypt = await import('bcrypt');
        return await bcrypt.compare(password, passwordHash);
      } catch (error) {
        console.error('Failed to import bcrypt:', error);
        return false;
      }
    } else {
      return passwordHash === password;
    }
  }

  private async tryWordPressAuthentication(username: string, password: string) {
    try {
  // TODO: Implement WordPress authentication via REST API
      console.log("⚠️ WordPress authentication not yet implemented");
    } catch (error) {
      console.log("⚠️ WordPress auth failed:", (error as Error).message);
    }
    return null;
  }

  private tryDemoAuthentication(username: string, password: string) {
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
    ];

    const demoUser = demoUsers.find((u) => u.username === username);
    const validPassword =
      (username === "admin" && password === "admin") ||
      (username === "artist" && password === "123456") ||
      (username === "ankunstudio" && password === "admin");

    if (demoUser && validPassword) {
      console.log("✅ Demo authentication successful");
      return {
        success: true,
        user: demoUser,
        source: "Demo Fallback",
      };
    }
    return null;
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
    console.log("🔍 Checking database status...")

    // Ensure initialization is complete
    await this.initialize()

    const status = {
      neon: this.neonAvailable,
      wordpress: this.wordpressAvailable,
      supabase: false, // Disabled per user request
    }

    console.log("📊 Database status result:", status)
    return status
  }

  async getSubmissions(filters?: { username?: string }) {
    console.log("🔍 Getting submissions with filters:", filters)

    // Ensure initialization is complete
    await this.initialize()

    // Try Neon first
    if (this.neonAvailable && this.neonSql) {
      try {
        let result
        if (filters?.username) {
          // Get submissions by specific username
          result = await this.neonSql`
            SELECT * FROM submissions
            WHERE uploader_username = ${filters.username}
            ORDER BY submission_date DESC
          `
        } else {
          // Get all submissions
          result = await this.neonSql`
            SELECT * FROM submissions 
            ORDER BY submission_date DESC
          `
        }

        console.log("✅ Neon submissions query result:", result.length)

        // Chuẩn hóa submissions với ảnh và file mặc định
        const normalizedSubmissions = this.normalizeSubmissions(result)

        return {
          success: true,
          data: normalizedSubmissions,
          source: "Neon"
        }
      } catch (error) {
        console.log("⚠️ Neon submissions query failed:", (error as Error).message)
      }
    }

    // Return empty array if no database available
    console.log("📭 No submissions found - returning empty array")
    return {
      success: true,
      data: [],
      source: "None"
    }
  }

  async getArtists(filters?: { isActive?: boolean }) {
    console.log("🎤 Getting artists with filters:", filters)

    // Ensure initialization is complete
    await this.initialize()

    // Try Neon first
    if (this.neonAvailable && this.neonSql) {
      try {
        // Get all artists (ignore isActive filter since column doesn't exist)
        const result = await this.neonSql`
          SELECT id, username, email, full_name, bio, avatar, social_links, created_at, updated_at
          FROM artist 
          ORDER BY created_at DESC
        `

        console.log("✅ Neon artists query result:", result.length)
        return {
          success: true,
          data: result,
          source: "Neon"
        }
      } catch (error) {
        console.log("⚠️ Neon artists query failed:", (error as Error).message)
      }
    }

    // Return empty array if no database available
    console.log("📭 No artists found - returning empty array")
    return {
      success: true,
      data: [],
      source: "None"
    }
  }

  async getSubmissionById(submissionId: string) {
    console.log("🔍 Getting submission by ID:", submissionId)

    // Ensure initialization is complete
    await this.initialize()

    // Try Neon first
    if (this.neonAvailable && this.neonSql) {
      try {
        const result = await this.neonSql`
          SELECT * FROM submissions
          WHERE id = ${submissionId}
          LIMIT 1
        `

        console.log("✅ Neon submission by ID query result:", result.length)

        if (result.length > 0) {
          // Chuẩn hóa submission với ảnh và file mặc định
          const normalizedSubmissions = this.normalizeSubmissions(result)
          return {
            success: true,
            data: normalizedSubmissions[0],
            source: "Neon"
          }
        }
      } catch (error) {
        console.log("⚠️ Neon submission by ID query failed:", (error as Error).message)
      }
    }

    return {
      success: false,
      message: "Submission not found",
      source: "None"
    }
  }

  async updateSubmission(submissionId: string, updateData: Record<string, any>) {
    console.log("📝 Updating submission:", submissionId)

    // Ensure initialization is complete
    await this.initialize()

    // Try Neon first
    if (this.neonAvailable && this.neonSql) {
      try {
        // Manually build the query for common fields that exist in submissions table
        const {
          title,
          track_title,
          artist_name,
          status,
          genre,
          description
        } = updateData

        // Use title or track_title (track_title is for backward compatibility)
        const titleValue = title ?? track_title

        const result = await this.neonSql`
          UPDATE submissions 
          SET 
            title = COALESCE(${titleValue}, title),
            artist_name = COALESCE(${artist_name}, artist_name),
            status = COALESCE(${status}, status),
            genre = COALESCE(${genre}, genre),
            description = COALESCE(${description}, description)
          WHERE id = ${submissionId}
          RETURNING *
        `

        console.log("✅ Neon submission update result:", result.length)

        if (result.length > 0) {
          return {
            success: true,
            data: result[0],
            source: "Neon"
          }
        }
      } catch (error) {
        console.log("⚠️ Neon submission update failed:", (error as Error).message)
      }
    }

    return {
      success: false,
      message: "Failed to update submission",
      source: "None"
    }
  }

  async deleteSubmission(submissionId: string) {
    console.log("🗑️ Deleting submission:", submissionId)

    // Ensure initialization is complete
    await this.initialize()

    // Try Neon first
    if (this.neonAvailable && this.neonSql) {
      try {
        const result = await this.neonSql`
          DELETE FROM submissions
          WHERE id = ${submissionId}
          RETURNING id
        `

        console.log("✅ Neon submission delete result:", result.length)

        if (result.length > 0) {
          return {
            success: true,
            deletedId: result[0].id,
            source: "Neon"
          }
        }
      } catch (error) {
        console.log("⚠️ Neon submission delete failed:", (error as Error).message)
      }
    }

    return {
      success: false,
      message: "Failed to delete submission",
      source: "None"
    }
  }

  // Lấy avatar người dùng từ cơ sở dữ liệu
  async updateUserAvatar(fileBuffer: Buffer, userId: string, userTable: 'artist' | 'label_manager', mimeType: string = 'image/jpeg') {
    try {
      if (!this.neonAvailable || !this.neonSql) {
        return {
          success: false,
          error: "Cơ sở dữ liệu không khả dụng"
        };
      }

      // Lưu ảnh dưới dạng binary (BYTEA) và URL cùng lúc
      // URL sẽ tương thích với frontend hiện tại, BYTEA cho hiệu suất tốt hơn trong tương lai
      const base64Image = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      console.log(`🖼️ Lưu avatar cho ${userTable} với ID ${userId} (${fileBuffer.length} bytes)`);

      // Lưu vào cơ sở dữ liệu dựa vào userTable
      if (userTable === 'artist') {
        await this.neonSql`
          UPDATE artist 
          SET 
            avatar_url = ${dataUrl},
            avatar_binary = ${fileBuffer},
            avatar_mime_type = ${mimeType},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
        `;
      } else if (userTable === 'label_manager') {
        await this.neonSql`
          UPDATE label_manager 
          SET 
            avatar_url = ${dataUrl},
            avatar_binary = ${fileBuffer},
            avatar_mime_type = ${mimeType},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
        `;
      }

      return {
        success: true,
        url: dataUrl,
        key: userId
      };
    } catch (error) {
      console.error('Error updating avatar in database:', error);
      return {
        success: false,
        error: `Database upload failed: ${(error as Error).message}`
      };
    }
  }

  // Lấy avatar người dùng từ cơ sở dữ liệu
  async getUserAvatar(userId: string, userTable: 'artist' | 'label_manager') {
    try {
      if (!this.neonAvailable || !this.neonSql) {
        return {
          success: false,
          error: "Cơ sở dữ liệu không khả dụng"
        };
      }

      let result;

      // Lấy ảnh từ cơ sở dữ liệu dựa vào userTable
      if (userTable === 'artist') {
        result = await this.neonSql`
          SELECT avatar_binary, avatar_mime_type
          FROM artist 
          WHERE id = ${userId}
        `;
      } else {
        result = await this.neonSql`
          SELECT avatar_binary, avatar_mime_type
          FROM label_manager 
          WHERE id = ${userId}
        `;
      }

      // Nếu không tìm thấy hoặc không có dữ liệu avatar
      if (!result || result.length === 0 || !result[0].avatar_binary) {
        return {
          success: false,
          error: "Không tìm thấy avatar"
        };
      }

      return {
        success: true,
        data: result[0].avatar_binary,
        mimeType: result[0].avatar_mime_type ?? 'image/jpeg'
      };
    } catch (error) {
      console.error('Error fetching avatar from database:', error);
      return {
        success: false,
        error: `Database fetch failed: ${(error as Error).message}`
      };
    }
  }

  // Cập nhật thông tin profile của nghệ sĩ
  async updateArtistProfile(id: string, profileData: any) {
    try {
      if (!this.neonAvailable || !this.neonSql) {
        return {
          success: false,
          message: "Cơ sở dữ liệu không khả dụng"
        };
      }

      // Chuẩn bị dữ liệu cập nhật
      const { email, real_name, bio, avatar_url, social_links } = profileData;

      // Chuyển đổi social_links thành chuỗi JSON
      const socialLinksJson = social_links ? JSON.stringify(social_links) : null;

      // Thực hiện cập nhật
      const result = await this.neonSql`
        UPDATE artist
        SET
          email = COALESCE(${email}, email),
          real_name = COALESCE(${real_name}, real_name),
          bio = COALESCE(${bio}, bio),
          social_links = COALESCE(${socialLinksJson}, social_links)
          ${avatar_url ? this.neonSql`, avatar_url = ${avatar_url}` : this.neonSql``}
        WHERE id = ${id}
        RETURNING id, username, email, real_name, bio, avatar_url, social_links
      `;

      if (result.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy nghệ sĩ"
        };
      }

      // Chuyển đổi social_links từ chuỗi JSON về object
      let userData = result[0];
      try {
        if (typeof userData.social_links === 'string') {
          userData.social_links = JSON.parse(userData.social_links);
        }
      } catch (e) {
        console.error("Lỗi parse social_links:", e);
        userData.social_links = {};
      }

      // Định dạng lại dữ liệu người dùng
      const formattedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.real_name,
        bio: userData.bio,
        avatar: userData.avatar_url,
        socialLinks: userData.social_links,
        role: "Artist",
        table: "artist"
      };

      return {
        success: true,
        data: formattedUser
      };
    } catch (error) {
      console.error("Lỗi cập nhật profile nghệ sĩ:", error);
      return {
        success: false,
        message: `Lỗi cập nhật: ${(error as Error).message}`
      };
    }
  }

  // Cập nhật thông tin profile của quản lý label
  async updateLabelManagerProfile(id: string, profileData: any) {
    try {
      if (!this.neonAvailable || !this.neonSql) {
        return {
          success: false,
          message: "Cơ sở dữ liệu không khả dụng"
        };
      }

      // Chuẩn bị dữ liệu cập nhật
      const { email, full_name, bio, avatar_url, social_links } = profileData;

      // Chuyển đổi social_links thành chuỗi JSON
      const socialLinksJson = social_links ? JSON.stringify(social_links) : null;

      // Thực hiện cập nhật
      const result = await this.neonSql`
        UPDATE label_manager
        SET
          email = COALESCE(${email}, email),
          full_name = COALESCE(${full_name}, full_name),
          bio = COALESCE(${bio}, bio),
          social_links = COALESCE(${socialLinksJson}, social_links)
          ${avatar_url ? this.neonSql`, avatar = ${avatar_url}` : this.neonSql``}
        WHERE id = ${id}
        RETURNING id, username, email, full_name, bio, avatar, social_links
      `;

      if (result.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy quản lý label"
        };
      }

      // Chuyển đổi social_links từ chuỗi JSON về object
      let userData = result[0];
      try {
        if (typeof userData.social_links === 'string') {
          userData.social_links = JSON.parse(userData.social_links);
        }
      } catch (e) {
        console.error("Lỗi parse social_links:", e);
        userData.social_links = {};
      }

      // Định dạng lại dữ liệu người dùng
      const formattedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        bio: userData.bio,
        avatar: userData.avatar,
        socialLinks: userData.social_links,
        role: "Label Manager",
        table: "label_manager"
      };

      return {
        success: true,
        data: formattedUser
      };
    } catch (error) {
      console.error("Lỗi cập nhật profile quản lý label:", error);
      return {
        success: false,
        message: `Lỗi cập nhật: ${(error as Error).message}`
      };
    }
  }
}

// Export singleton instance
export const multiDB = new MultiDatabaseService()
