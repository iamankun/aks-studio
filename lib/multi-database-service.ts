// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

import { neon } from "@neondatabase/serverless"
import type { User } from "@/types/user"


// Database priority: Neon -> WordPress -> Demo Mode (Supabase disabled per user request)


export class MultiDatabaseService {
  private neonSql: any = null;
  private neonAvailable = true;
  private wordpressAvailable = false;

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

    public async initialize() {
        if (this.neonSql) return;
        try {
            const DATABASE_URL = process.env.DATABASE_URL;
            if (!DATABASE_URL) {
                throw new Error('DATABASE_URL not found in environment variables.');
            }
            this.neonSql = neon(DATABASE_URL);
            await this.neonSql`SELECT 1`;
            this.neonAvailable = true;
        } catch (error) {
            this.neonAvailable = false;
            this.neonSql = null;
        }
    }

    public async authenticateUser(username: string, password?: string): Promise<{ success: boolean; data?: User; message?: string, source?: string }> {
        await this.initialize();

        if (this.neonAvailable && this.neonSql) {
            try {
                const users = await this.neonSql`
                    SELECT *, 'Label Manager' as role FROM label_manager WHERE username = ${username}
                    UNION ALL
                    SELECT *, 'Artist' as role FROM artist WHERE username = ${username}
                `;

                if (users.length > 0) {
                    const user = users[0];
                    // In a real app, you'd use bcrypt.compare(password, user.password)
                    if (password === user.password) {
                        console.log(`✅ Neon authentication successful for ${user.role}`);
                        const userData: User = {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            fullName: user.fullname ?? user.username,
                            role: user.role,
                            avatar: user.avatar ?? "/face.png",
                            isrcCodePrefix: user.isrc_code_prefix,
                            createdAt: user.created_at,
                            bio: user.bio,
                        };
                        return { success: true, data: userData, source: "Neon" };
                    }
                }
            } catch (error) {
                console.error("Neon auth failed:", error.message);
                this.neonAvailable = false; // Fallback on error
                return { success: false, message: "Database connection error." };
            }
        }

        // If Neon is not available or auth fails
        return { success: false, message: "Authentication service unavailable or invalid credentials." };
    }

    public async getSubmissions(username?: string): Promise<{ success: boolean; data?: any[]; message?: string, source?: string }> {
        await this.initialize();

        if (this.neonAvailable && this.neonSql) {
            try {
                let submissions;
                if (username) {
                    submissions = await this.neonSql`SELECT * FROM submissions WHERE uploader_username = ${username} ORDER BY submission_date DESC`;
                } else {
                    submissions = await this.neonSql`SELECT * FROM submissions ORDER BY submission_date DESC`;
                }
                const normalized = this.normalizeSubmissions(submissions);
                return { success: true, data: normalized, source: 'Neon' };
            } catch (error) {
                console.error('Neon: Failed to get submissions:', error.message);
                this.neonAvailable = false; // Fallback on error
                return { success: false, data: [], message: "Failed to retrieve submissions from database." };
            }
        }
        
        // If Neon is not available
        return { success: false, data: [], message: "Database service is not available." };
    }

    public async getStatus(): Promise<{ neon: boolean; wordpress: boolean; supabase: boolean }> {
        await this.initialize();
        return {
            neon: this.neonAvailable,
            wordpress: this.wordpressAvailable,
            supabase: false, // As per user request
        };
    }
}


// Export singleton instance for use in API routes
export const multiDB = new MultiDatabaseService();
