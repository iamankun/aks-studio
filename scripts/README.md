# 🗄️ Database Migrations - AKs Studio

## 📋 Tổng quan

Thư mục này chứa các migration scripts và tools để quản lý database cho AKs Studio Digital Music Distribution platform.

## 🚀 Quick Start

### 1. Test Connection

```bash
# Test database và SMTP connection
node scripts/test-connection.js
```

### 2. Run Migrations

```bash
# Chạy tất cả migrations
node scripts/run-migrations.js
```

## 📁 File Structure

```
scripts/
├── 001_create_initial_tables.sql    # Tạo bảng chính
├── 002_insert_demo_data.sql         # Demo data  
├── run-migrations.js                # Migration runner
├── test-connection.js               # Connection tester
└── README.md                        # Documentation này
```

## 🗃️ Database Schema

### Tables

#### 1. `public.label_manager` (Toàn quyền)

- **Mục đích:** Quản lý nhãn, admin, label managers
- **Quyền hạn:** Toàn quyền quản lý tất cả
- **Features:**
  - Quản lý nghệ sĩ
  - Quản lý submissions  
  - Cài đặt hệ thống
  - Xem analytics
  - Export dữ liệu

#### 2. `public.artist` (Quyền hạn chế)  

- **Mục đích:** Nghệ sĩ, musicians
- **Quyền hạn:** Hạn chế, chỉ quản lý thông tin cá nhân
- **Features:**
  - Upload nhạc
  - Chỉnh sửa profile
  - Xem submissions của mình
  - Không thể xem analytics tổng thể
  - Không thể export dữ liệu

#### 3. `public.submissions` (Shared)

- **Mục đích:** Quản lý submissions nhạc
- **Access:** Cả label_manager và artist có thể truy cập
- **Workflow:** draft → submitted → reviewing → approved/rejected → published

## 🔧 Environment Variables Required

```bash
# Database (Neon PostgreSQL)
DATABASE_URL='postgresql://user:pass@host:5432/database'

# SMTP (Apple Mail)  
SMTP_HOST='smtp.mail.me.com'
SMTP_PORT='587'
SMTP_USER='admin@ankun.dev'
SMTP_PASS='app-password'
SMTP_FROM='ankunstudio@ankun.dev'
SMTP_NAME='An Kun Studio Digital Music Distribution'
```

## 📊 Demo Data

### Label Managers

- **admin** / admin - System Administrator
- **ankunstudio** / admin - An Kun Studio Manager

### Artists  

- **artist** / 123456 - Demo Artist (managed by ankunstudio)
- **ankunmusic** / music2024 - An Kun Music (independent)

### Submissions

- Demo tracks với various statuses để test workflow

## 🔍 Troubleshooting

### Connection Issues

```bash
# 1. Test connection
node scripts/test-connection.js

# 2. Check environment variables
echo $DATABASE_URL

# 3. Verify network connectivity
ping ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech
```

### Migration Issues

```bash
# Reset tables (caution: this deletes all data)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
node scripts/run-migrations.js
```

### SMTP Issues

```bash
# Test SMTP configuration
node scripts/test-connection.js

# Check Apple Mail app password
# Generate new app password at: appleid.apple.com
```

## 🔄 Adding New Migrations

1. **Create SQL file:**

   ```bash
   # Format: 003_description.sql
   touch scripts/003_add_analytics_tables.sql
   ```

2. **Update run-migrations.js:**

   ```javascript
   const migrations = [
     '001_create_initial_tables.sql',
     '002_insert_demo_data.sql', 
     '003_add_analytics_tables.sql', // Add new migration
   ];
   ```

3. **Test migration:**

   ```bash
   node scripts/run-migrations.js
   ```

## 🛡️ Security Notes

- ✅ Passwords should be hashed with bcrypt in production
- ✅ Environment variables used for sensitive data
- ✅ No hardcoded credentials in migrations  
- ✅ Proper SQL injection prevention with parameterized queries
- ✅ Role-based access control implemented

## 📞 Support

Nếu gặp vấn đề:

1. Check logs trong terminal
2. Verify .env.local configuration  
3. Test connection riêng biệt
4. Contact: <ankunstudio@ankun.dev>

---

**Author:** An Kun Studio Digital Music Distribution  
**Version:** 1.0.0  
**Date:** July 2025
