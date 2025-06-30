# AKs Studio Digital Music Platform - Scripts Guide

## 📋 Tổng quan

Thư mục `scripts/` chứa các công cụ để setup, kiểm tra và maintain database của AKs Studio Digital Music Platform.

## 🚀 Scripts chính

### 1. Setup Database (`setup-database.js`)

Thiết lập database từ đầu với schema mới và dữ liệu mẫu.

```bash
node scripts/setup-database.js
```

**Chức năng:**

- Drop tất cả bảng cũ
- Tạo bảng mới: `artist`, `label_manager`, `submissions`
- Insert dữ liệu mẫu với password đã hash
- Verify setup thành công

**Tài khoản mẫu được tạo:**

- Artist: `ankun` / `admin123`
- Artist: `testartist` / `artist123`  
- Label Manager: `admin` / `manager123`

### 2. Verify System (`verify-system.js`)

Kiểm tra toàn diện hệ thống và APIs.

```bash
node scripts/verify-system.js
```

**Kiểm tra:**

- ✅ Database connection
- ✅ Schema integrity
- ✅ Data counts
- ✅ API endpoints (nếu server đang chạy)
- ✅ Sample data
- ✅ Password security

### 3. Test Scripts

#### Test Database Connection

```bash
node scripts/test-connection.js
```

#### Test Email Service

```bash
node scripts/test-email.js
```

#### Debug Authentication

```bash
node scripts/debug-auth.js
```

## 🔍 Schema Inspection Scripts

### Check Artist Schema

```bash
node scripts/check-artist-schema.js
```

### Check Submissions Schema

```bash
node scripts/check-submissions-schema.js
```

### Check All Tables

```bash
node scripts/check-db-tables.js
```

## 📊 Current Database Schema

### `artist` Table

```sql
CREATE TABLE artist (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    bio TEXT,
    avatar VARCHAR(255),
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `label_manager` Table

```sql
CREATE TABLE label_manager (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    bio TEXT,
    avatar VARCHAR(255),
    permissions JSONB DEFAULT '{"canManageArtists": true, "canViewAllSubmissions": true, "canManageSystem": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `submissions` Table

```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist_name VARCHAR(100) NOT NULL,
    uploader_username VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_path VARCHAR(255),
    artwork_path VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    FOREIGN KEY (uploader_username) REFERENCES artist(username) ON DELETE CASCADE
);
```

## 🎯 API Endpoints Connected

### ✅ Working APIs

- `GET /api/artists` - Fetch all artists (count: real data)
- `GET /api/submissions` - Fetch all submissions (count: real data)
- `POST /api/auth/login` - User authentication (bcrypt passwords)
- `GET /api/admin/stats` - System statistics for admin panel
- `GET /api/email/stats` - Email statistics and recent emails  
- `GET /api/logs` - System logs with fallback to local logger

### 📱 Connected Views

- **Dashboard** ✅ - Real artist & submission counts from APIs
- **Users View** ✅ - Real artist data from `/api/artists`
- **Submissions View** ✅ - Real submission data (via main-app-view)
- **Admin Panel** ✅ - Real system stats from `/api/admin/stats`
- **Logs View** ✅ - Real system logs from `/api/logs` with local fallback
- **Email Center** ✅ - Connected to `/api/email/stats` (mock data)
- **Auth System** ✅ - Real database authentication with bcrypt

## 🛠️ Development Workflow

### Initial Setup

1. `npm install bcrypt @types/bcrypt`
2. `node scripts/setup-database.js`
3. `npm run dev`
4. `node scripts/verify-system.js`

### Reset Database

```bash
node scripts/setup-database.js
```

### Check System Health

```bash
node scripts/verify-system.js
```

### Debug Issues

```bash
node scripts/debug-auth.js
node scripts/check-db-tables.js
```

## 🔐 Security Notes

- All passwords are hashed with bcrypt (cost factor 10)
- Environment variables stored in `.env.local`
- Database uses Neon serverless PostgreSQL
- SMTP credentials for real email sending

## 📈 Current Status

### ✅ Completed

- Database schema setup with real data connections
- Real data connections for Dashboard, Users View, Admin Panel, Logs View  
- Authentication with bcrypt password hashing
- Email service integration with SMTP
- Scroll functionality fixed across all pages
- All scripts organized in `/scripts` folder
- API endpoints for all major views

### 📝 Testing

Login with any of the sample accounts and verify:

- Dashboard shows real counts
- Users view shows real artist data
- Authentication works with database
- Scroll works on all pages

---

**Last Updated:** July 1, 2025
**Version:** 2.0.0-beta
