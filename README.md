# An Kun Studio - Digital Music Distribution
# Tác giả: An Kun
# Công cụ: AKs Studio

## 🎵 Giới thiệu

AKs Studio là nền tảng quản lý và phát hành âm nhạc chuyên nghiệp, được thiết kế đặc biệt cho các label và nghệ sĩ độc lập. Hệ thống cung cấp đầy đủ các tính năng từ upload nhạc, quản lý metadata, đến phân phối trên các nền tảng streaming.

## 🚀 Tính năng chính

### Cho Label Manager
- ✅ Toàn quyền quản lý hệ thống
- ✅ Tạo và quản lý tài khoản nghệ sĩ
- ✅ Cấu hình SMTP, Database, giao diện
- ✅ Upload và quản lý nhạc cho tất cả nghệ sĩ
- ✅ Tải xuống file nhạc và ảnh bìa
- ✅ Quản lý ISRC và metadata
- ✅ Backup và restore dữ liệu

### Cho Nghệ sĩ
- ✅ Upload nhạc và ảnh bìa
- ✅ Quản lý thông tin cá nhân
- ✅ Theo dõi trạng thái phát hành
- ✅ Tìm kiếm ISRC

### Tính năng hệ thống
- ✅ Giao diện responsive với font Dosis
- ✅ Background tùy chỉnh (Gradient/YouTube video)
- ✅ Hệ thống thông báo với âm thanh
- ✅ Tích hợp công cụ tìm kiếm ISRC
- ✅ Chế độ Demo/Production tự động

## 📋 Yêu cầu hệ thống

- Node.js 18+
- Modern web browser
- SMTP server (cho email)
- Database (MySQL/PostgreSQL) - tùy chọn

## 🛠️ Cài đặt

### 1. Clone repository
\`\`\`bash
git clone [repository-url]
cd [tenapp]
npm install
\`\`\`

### 2. Cấu hình môi trường
\`\`\`bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
\`\`\`

### 3. Chạy ứng dụng
\`\`\`bash
npm run dev
\`\`\`

Truy cập: `http://localhost:3000`

## 👥 Tài khoản mặc định

### Label Manager (Toàn quyền)
- **Username:** admin
- **Password:** admin

### Nghệ sĩ (Quyền hạn chế)
- **Username:** artist  
- **Password:** 123456

## ⚙️ Cấu hình hệ thống

### 1. Cài đặt SMTP (Bắt buộc cho Production)
\`\`\`
Server: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [App Password]
\`\`\`

**Lưu ý:** Sử dụng App Password của Gmail, không phải mật khẩu thường.

### 2. Cài đặt Database (Tùy chọn)
- Hỗ trợ MySQL, PostgreSQL
- Cấu hình trong phần Settings > Database
- Tự động tạo bảng khi kết nối

### 3. Tùy chỉnh giao diện
- **Logo:** Upload và set làm favicon
- **Background:** Gradient CSS hoặc YouTube video playlist
- **Footer:** Thông tin công ty và liên kết
- **Font:** Dosis (cố định, không thay đổi)

## 📁 Cấu trúc thư mục

\`\`\`
[tenapp]/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── modals/            # Modal components
│   ├── views/             # Main view components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utilities and data management
├── types/                 # TypeScript type definitions
└── public/                # Static assets
\`\`\`

## 🔧 API và Tích hợp

### ISRC Lookup
- Tích hợp: `https://spotify-to-mxm.vercel.app`
- Tự động tra cứu thông tin bài hát
- Kiểm tra trùng lặp trước khi phát hành

### File Upload
- **Audio:** WAV, 24bit+, max 100MB
- **Image:** JPG, 4000x4000px, max 5MB
- Validation tự động

### ISRC Generation
- Format: `[PREFIX][YY][NNNNN]`
- Tự động tăng counter
- Unique cho mỗi nghệ sĩ

## 🎨 Tùy chỉnh Background

### Gradient CSS
\`\`\`css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
\`\`\`

### YouTube Video
- Hỗ trợ playlist 10+ video
- Auto-play, muted, loop
- Tùy chỉnh độ mờ

## 📊 Quản lý dữ liệu

### Backup/Restore
- Export: JSON format
- Import: Drag & drop
- Tự động backup định kỳ

### LocalStorage
- Tự động lưu trữ
- Sync real-time
- Fallback cho database

## 🔐 Bảo mật

- Password hashing (production)
- Role-based access control
- File type validation
- XSS protection

## 🚨 Troubleshooting

### Chế độ Demo không tắt
1. Kiểm tra cấu hình SMTP
2. Kết nối Database
3. Test LocalStorage
4. Restart ứng dụng

### Upload file lỗi
1. Kiểm tra format file
2. Kiểm tra kích thước
3. Clear browser cache

### Email không gửi được
1. Kiểm tra SMTP settings
2. Tạo App Password mới
3. Kiểm tra firewall

## 📞 Hỗ trợ

- **Documentation:** [Link to docs]
- **Issues:** [Link to issues]
- **Email:** support@[tenapp].com

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**[tenapp]** - Nền tảng phát hành nhạc chuyên nghiệp cho thế hệ mới 🎵
