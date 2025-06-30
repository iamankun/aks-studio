# 🚀 DMG Database Migration Scripts - COMPLETED

Scripts để thiết lập và quản lý database cho **An Kun Studio Digital Music Distribution** project.

## 📋 Overview

Hệ thống này hỗ trợ 2 loại người dùng với quyền hạn khác nhau:

### 👑 Label Managers (Toàn quyền)

- ✅ Chỉnh sửa tất cả submissions
- ✅ Quản lý nghệ sĩ
- ✅ Chỉnh sửa usernames
- ✅ Truy cập analytics
- ✅ Quản lý royalties

### 🎵 Artists (Hạn chế quyền)

- ✅ Chỉnh sửa submissions của riêng mình
- ✅ Xem analytics của riêng mình
- ❌ KHÔNG thể chỉnh sửa usernames
- ❌ KHÔNG thể truy cập dữ liệu của người khác
- ❌ KHÔNG thể quản lý người khác

## 🗂️ Scripts Available

### 🔧 Setup & Migration

| Script | Description | Usage |
|--------|-------------|-------|
| `run_migration.js` | **Auto migration runner** | `node scripts/run_migration.js` |
| `test-connection.js` | Test database & SMTP | `node scripts/test-connection.js` |

### 📄 SQL Files

| File | Description | Usage |
|------|-------------|-------|
| `step1_drop_tables.sql` | Drop all tables (cleanup) | Manual |
| `step2_create_tables.sql` | Create fresh tables | Auto via run_migration |
| `step3_insert_data.sql` | Insert initial data | Auto via run_migration |

## 🚀 Quick Start

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Run auto migration (creates tables + initial data)
node scripts/run_migration.js

# Test everything works
node scripts/test-connection.js
```

### 2. Reset Database (Fresh Start)

```bash
# This will DROP all tables and recreate with fresh initial data
node scripts/run_migration.js
```

### 3. Test Configuration

```bash
# Test database connection and SMTP settings
node scripts/test-connection.js
```

## 📊 Demo Data Included

### Label Managers (2 users)

- `ankun_admin` - <admin@ankun.dev> (Main admin)
- `manager1` - <manager1@ankun.dev> (Label manager)

### Artists (3 users)  

- `artist1` - <artist1@ankun.dev> (Moonlight Beats - Electronic)
- `artist2` - <artist2@ankun.dev> (Saigon Indie - Indie Rock)  
- `artist3` - <artist3@ankun.dev> (Acoustic Dreams - Acoustic)

### Submissions (4 tracks)

- **Midnight Vibes** (published) - submitted by ankun_admin
- **Ocean Waves** (approved) - submitted by artist1
- **Saigon Nights** (processing) - submitted by manager1
- **Coffee Morning** (pending) - submitted by artist3

## 🛠️ Environment Setup

Đảm bảo file `.env.local` có các variables:

```bash
# Database
DATABASE_URL='postgresql://user:pass@host/database'

# SMTP  
SMTP_HOST='smtp.mail.me.com'
SMTP_PORT='587'
SMTP_USER='admin@ankun.dev'
SMTP_PASS='your-password'
SMTP_FROM='ankunstudio@admin.dev'
SMTP_NAME='An Kun Studio Digital Music Distribution'
```

## 🔍 Troubleshooting

### Connection Issues

```bash
# Test connection first
node scripts/test-connection.js

# Check .env.local file exists and has DATABASE_URL
```

### Migration Errors

```bash
# Reset everything and try again
node scripts/run_migration.js
```

### Permission Issues

Check these in your PostgreSQL database:

- Label Managers have all permission flags = TRUE
- Artists have restricted permission flags
- Submissions properly link to either label_manager OR artist (not both)

## 📁 Table Structure

### `public.label_manager`

- Full admin privileges
- Can edit all submissions
- Can manage artists
- Can edit usernames

### `public.artist`  

- Restricted privileges
- Can only edit own submissions
- Cannot edit usernames
- Cannot access other users' data

### `public.submissions`

- Belongs to either label_manager OR artist
- Has approval workflow
- Tracks distribution platforms
- Supports metadata and tags

## 🎯 Next Steps

1. **Test the system**: Run `node scripts/test-connection.js`
2. **Verify permissions**: Check that artists can't access label manager functions
3. **Customize data**: Modify demo data in `003_simple_demo_data.sql`
4. **Deploy**: System is ready for production use

## 📞 Support

Created by **An Kun Studio Digital Music Distribution**

- 🌐 Website: <https://aks.ankun.dev>
- 📧 Email: <admin@ankun.dev>

---

*System successfully configured with proper environment variables and database structure! 🎉*
