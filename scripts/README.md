# DMG Scripts - Test & Automation

Thư mục chứa các script test và automation cho DMG (An Kun Studio Digital Music Platform).

## 📁 File Structure

```
scripts/
├── README.md                     # Tài liệu này
├── test-manager.js              # Quản lý tất cả test scripts
├── test-authorization.js        # Test cơ bản authorization
├── test-real-users.js          # Test với real users
├── test-real-database-auth.js   # Test toàn diện với dữ liệu thực  
├── test-direct-database.mjs     # Test trực tiếp database connection
└── test-submissions.js          # Test CRUD operations
```

## 🚀 Quick Start

### Chạy Test Manager (Recommended)

```bash
# Chạy interactive mode
node scripts/test-manager.js interactive

# Chạy tất cả tests
node scripts/test-manager.js all

# Chạy một test cụ thể
node scripts/test-manager.js 1    # Basic authorization
node scripts/test-manager.js 2    # Real users  
node scripts/test-manager.js 3    # Real database auth
node scripts/test-manager.js 4    # Direct database
node scripts/test-manager.js 5    # Submissions CRUD
```

### Chạy Tests Riêng Lẻ

```bash
# Basic authorization test
node scripts/test-authorization.js

# Real users authorization test  
node scripts/test-real-users.js

# Comprehensive real database test
node scripts/test-real-database-auth.js

# Direct database connection test
node scripts/test-direct-database.mjs

# Submissions CRUD test
node scripts/test-submissions.js
```

## 🧪 Test Descriptions

### 1. Basic Authorization Test (`test-authorization.js`)

- **Purpose**: Test cơ bản với demo users
- **Features**:
  - Test Label Manager permissions
  - Test Artist restrictions
  - Test unauthorized access blocking
- **Data**: Demo/mock data
- **Runtime**: ~30 seconds

### 2. Real Users Test (`test-real-users.js`)  

- **Purpose**: Test với real users từ database
- **Features**:
  - Test với user thực: admin, ankun, testartist
  - Validate role-based access control
  - Check submission filtering
- **Data**: Real database users
- **Runtime**: ~45 seconds

### 3. Real Database Auth Test (`test-real-database-auth.js`)

- **Purpose**: Test toàn diện với dữ liệu thực
- **Features**:
  - Complete authorization workflow testing
  - Real API endpoints validation
  - Comprehensive permission checking
  - Summary và validation reports
- **Data**: Live database data
- **Runtime**: ~60 seconds

### 4. Direct Database Test (`test-direct-database.mjs`)

- **Purpose**: Test trực tiếp kết nối database
- **Features**:
  - Direct PostgreSQL connection test
  - Table structure validation
  - Data integrity checking
  - Authorization logic với real data
- **Data**: Direct database queries
- **Runtime**: ~30 seconds

### 5. Submissions CRUD Test (`test-submissions.js`)

- **Purpose**: Test CRUD operations cho submissions
- **Features**:
  - Create, Read, Update, Delete operations
  - Permission validation for each operation
  - Error handling testing
- **Data**: Test submissions data
- **Runtime**: ~45 seconds

## 🔐 Authorization Test Matrix

| User Role | View All | Edit Own | Edit All | Delete | Approve/Reject | Debug Tools |
|-----------|----------|----------|----------|---------|----------------|-------------|
| **Label Manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Artist** | ❌ | ✅ (pending only) | ❌ | ❌ | ❌ | ❌ |
| **Unauthorized** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 📊 Real Test Data

### Real Users in Database

- **admin** (Label Manager) - <admin@ankun.dev>
- **ankun** (Artist) - <ankun@aksstudio.com>  
- **testartist** (Artist) - <test@ankun.dev>

### Real Submissions Data

- **Total**: ~10 submissions
- **Status Distribution**: approved (4), pending (3), under_review (2), rejected (1)
- **Artists**: ankun, testartist
- **Genres**: Electronic, EDM, House, Acoustic, etc.

## 🎯 Expected Test Results

### Label Manager (admin)

- ✅ Can access ALL submissions (10/10)
- ✅ Can view full statistics  
- ✅ Can approve/reject submissions
- ✅ Can delete submissions
- ✅ Can access debug tools

### Artist (ankun, testartist)

- ✅ Can access OWN submissions only
- ✅ Can edit OWN pending submissions
- ❌ Cannot view other artists' submissions
- ❌ Cannot approve/reject submissions
- ❌ Cannot delete submissions
- ❌ Cannot access debug tools

### Unauthorized

- ❌ Cannot access any submissions
- ❌ API returns 401/403 errors
- ❌ Blocked from all sensitive operations

## 🔧 Configuration

### Environment Variables Required

```env
DATABASE_URL=postgresql://...    # Neon PostgreSQL connection
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Prerequisites

1. **DMG Server Running**: `npm run dev` (port 3000)
2. **Database Connected**: Neon PostgreSQL accessible
3. **Real Data Available**: Users và submissions in database

## 📈 Performance Benchmarks

| Test Type | Average Runtime | Database Queries | API Calls |
|-----------|----------------|-----------------|-----------|
| Basic Auth | 30s | 0 | 6 |
| Real Users | 45s | 0 | 12 |
| Real DB Auth | 60s | 0 | 15 |
| Direct DB | 30s | 8 | 0 |
| Submissions CRUD | 45s | 0 | 20 |

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```

   **Solution**: Ensure DMG server is running (`npm run dev`)

2. **Database Error**

   ```
   Error: Connection timeout
   ```

   **Solution**: Check DATABASE_URL và network connection

3. **Authorization Error**

   ```
   Error: 401 Unauthorized
   ```

   **Solution**: Check user credentials và authentication headers

4. **Permission Error**

   ```
   Error: 403 Forbidden  
   ```

   **Solution**: Verify user role và permissions logic

## 📝 Adding New Tests

### Creating a New Test Script

1. **Create file**: `scripts/test-new-feature.js`
2. **Follow pattern**:

   ```javascript
   // Test description
   const BASE_URL = 'http://localhost:3000';
   
   async function testNewFeature() {
       // Test implementation
   }
   
   if (require.main === module) {
       testNewFeature().catch(console.error);
   }
   ```

3. **Add to test-manager.js**:

   ```javascript
   const testScripts = {
       // ...existing
       '6': {
           name: 'New Feature Test',
           file: 'test-new-feature.js', 
           description: 'Description of new test'
       }
   };
   ```

## 🎉 Success Criteria

Tất cả tests PASS khi:

1. ✅ **Database Connection**: Stable connection to Neon PostgreSQL
2. ✅ **User Authentication**: Real users authenticate successfully  
3. ✅ **Role-Based Access**: Permissions enforced correctly
4. ✅ **Data Filtering**: Users see only authorized data
5. ✅ **API Security**: Unauthorized access blocked
6. ✅ **CRUD Operations**: All operations work with proper permissions
7. ✅ **Performance**: Tests complete within expected timeframes

---

**Maintained by**: An Kun Studio Development Team  
**Last Updated**: 2025-01-25  
**Version**: 2.2.0-beta
