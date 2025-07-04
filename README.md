# An Kun Studio - Digital Music Distribution

# Tác giả: An Kun

# Công cụ: AKs Studio CMS v1.5.0-beta

## 🎵 Giới thiệu

AKs Studio là nền tảng quản lý và phát hành âm nhạc chuyên nghiệp, được thiết kế đặc biệt cho các label và nghệ sĩ độc lập. Hệ thống cung cấp đầy đủ các tính năng quản lý metadata và phân phối trên các nền tảng streaming.

## � Tài liệu

Tất cả tài liệu hướng dẫn của dự án đã được tổ chức trong thư mục [docs](./docs/README.md).

## �🚀 Tính năng chính

### Cho Label Manager

- ✅ Toàn quyền quản lý hệ thống
- ✅ Tạo và quản lý tài khoản nghệ sĩ
- ✅ Cấu hình SMTP, Database, giao diện
- ✅ Quản lý nhạc cho tất cả nghệ sĩ
- ✅ Tải xuống file nhạc và ảnh bìa
- ✅ Quản lý ISRC và metadata
- ✅ Backup và restore dữ liệu
- ✅ Admin Panel với multi-endpoint storage
- ✅ Email Center với template system

- ✅ Cập nhật hồ sơ và thông tin database nghệ sĩ/label trực tiếp từ giao diện (update database profile)

### Cho Nghệ sĩ

- ✅ Quản lý nhạc và ảnh bìa
- ✅ Quản lý thông tin cá nhân
- ✅ Theo dõi trạng thái phát hành
- ✅ Cập nhật hồ sơ cá nhân và đồng bộ với database
- ✅ Tìm kiếm ISRC
- ✅ Quản lý profile và social links

### Tính năng hệ thống

- ✅ Giao diện responsive với font Dosis
- ✅ Background tùy chỉnh (Gradient/YouTube video)
- ✅ Hệ thống thông báo với âm thanh
- ✅ Tích hợp công cụ tìm kiếm ISRC
- ✅ Chế độ Demo/Production tự động
- ✅ Multi-database support (Neon, WordPress)
- ✅ File management system

## 📋 Yêu cầu hệ thống

- Node.js 18+
- Modern web browser
- SMTP server (cho email)
- Database (Neon/PostgreSQL/MySQL) - tùy chọn

## 🛠️ Cài đặt

### 1. Clone repository

\`\`\`bash
git clone [repository-url]
cd akscms
npm install
\`\`\`

### 2. Cấu hình môi trường

\`\`\`bash
cp .env.example .env.local

# Chỉnh sửa file .env.local với thông tin của bạn

\`\`\`

### 3. Chạy ứng dụng

\`\`\`bash
npm run dev

# hoặc

npm run build && npm start
\`\`\`

Truy cập: `http://localhost:3000`

## 👥 Tài khoản mặc định

### Label Manager (Toàn quyền)

- **Username:** ankunstudio
- **Password:** admin

## ⚙️ Cấu hình hệ thống

### 1. Cài đặt SMTP (Bắt buộc cho Production)

\`\`\`
Server: smtp.mail.me.com
Port: 587
Username: <admin@ankun.dev>
Password: [App Password]
\`\`\`

**Lưu ý:** Sử dụng App Password của Apple Mail hoặc Gmail.

### 2. Cài đặt Database (Multi-endpoint support)

- **Primary:** Neon PostgreSQL
- **Secondary:** (Đã loại bỏ Supabase)
- **Backup:** WordPress API
- Tự động failover khi kết nối

### 3. Tùy chỉnh giao diện

- **Logo:** Quản lý và set làm favicon
- **Background:** Gradient CSS hoặc YouTube video playlist
- **Footer:** Thông tin công ty và liên kết
- **Font:** Dosis (cố định, không thay đổi)

## 📁 Cấu trúc thư mục

\`\`\`
akscms/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── data/              # Data management page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── modals/            # Modal components
│   ├── sidebar/           # Sidebar navigation
│   ├── views/             # Main view components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utilities and data management
│   ├── email.ts           # Email service
│   ├── multi-database-service.ts # Database abstraction
│   ├── (Đã loại bỏ supabase-config.ts)
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── .env.local             # Environment variables
\`\`\`

## 🔧 API và Tích hợp

### ISRC Lookup

- Tích hợp: `https://spotify-to-mxm.vercel.app`
- Tự động tra cứu thông tin bài hát
- Kiểm tra trùng lặp trước khi phát hành

### File Management

- **Audio:** WAV, 24bit+, max 100MB
- **Image:** JPG, 4000x4000px, max 5MB
- Validation tự động
- Multi-endpoint storage

### ISRC Generation

- Format: `[PREFIX][YY][NNNNN]`
- Tự động tăng counter
- Unique cho mỗi nghệ sĩ
- Prefix: VNA2P (default)

### Multi-Database Architecture

\`\`\`
Primary: Neon PostgreSQL (ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech)
Secondary: (Đã loại bỏ Supabase)
Backup: WordPress API (aks.ankun.dev)
Storage: S3 Compatible multi-endpoint
\`\`\`

## 🎨 Tùy chỉnh Background

### Gradient CSS

\`\`\`css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
\`\`\`

### YouTube Video

- Hỗ trợ playlist 10+ video
- Auto-play, muted, loop
- Tùy chỉnh độ mờ
- Random video selection

## 📊 Quản lý dữ liệu

### Backup/Restore

- Export: JSON format với metadata
- Import: Drag & drop
- Tự động backup định kỳ
- Multi-endpoint sync

### Storage Management

- LocalStorage: Client-side caching
- Database: Persistent storage
- File Storage: Multi-endpoint với failover

## 🔐 Bảo mật

- Password hashing (production)
- Role-based access control
- File type validation
- XSS protection
- CSRF protection
- Environment variables isolation

## 📧 Email System

### Templates

- Welcome emails
- Status updates
- Custom templates
- HTML/Text support

### SMTP Configuration

- Apple Mail support
- Gmail support
- Custom SMTP servers
- Auto-retry on failure

## 🚨 Troubleshooting

### Chế độ Demo không tắt

1. Kiểm tra cấu hình SMTP
2. Kết nối Database
3. Test LocalStorage
4. Restart ứng dụng

### File processing lỗi

1. Kiểm tra format file
2. Kiểm tra kích thước
3. Clear browser cache
4. Kiểm tra storage endpoint

### Email không gửi được

1. Kiểm tra SMTP settings
2. Tạo App Password mới
3. Kiểm tra firewall
4. Test connection

### Database connection issues

1. Check environment variables
2. Verify network connectivity
3. Check database status
4. Failover to backup endpoint

## 🔄 Environment Variables

\`\`\`bash

# Primary Database

DATABASE_URL=postgresql://...

# WordPress Backup

WORDPRESS_API_URL=https://...

# Site Configuration

NEXT_PUBLIC_SITE_URL=https://...

\`\`\`

## 📞 Hỗ trợ

- **Documentation:** Internal docs
- **Issues:** Contact admin
- **Email:** <ankunstudio@ankun.dev>
- **Website:** <https://ankun.dev>

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes với proper message
4. Push to branch
5. Create Pull Request

## 📈 Roadmap

### v1.3.0 (Upcoming)

- [ ] Advanced analytics dashboard
- [ ] Automated distribution to streaming platforms
- [ ] Mobile app companion
- [ ] AI-powered metadata enhancement

### v1.2.0 (Current - Beta)

- [x] Multi-database support
- [x] Email center with templates
- [x] File management system
- [x] Admin panel improvements

## 🏗️ Architecture

### Frontend

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui components

### Backend

- Next.js API routes
- Multi-database abstraction layer
- File management with validation
- Email service integration

### Database Schema

\`\`\`sql
-- Users table
users (id, username, password, email, role, fullName, createdAt, ...)

-- Submissions table  
submissions (id, isrc, artistName, songTitle, status, ...)

-- Tracks table
tracks (id, submissionId, fileName, songTitle, ...)

-- Additional artists
submission_artists (id, submissionId, artistName, role, ...)
\`\`\`

---

**AKs Studio CMS v1.2.0-beta** - Nền tảng phát hành nhạc chuyên nghiệp cho thế hệ mới 🎵

*Developed by An Kun Studio Digital Music Distribution*
