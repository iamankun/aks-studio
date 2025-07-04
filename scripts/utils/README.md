# Utilities cho Scripts

Thư mục này chứa các utility function dùng chung cho các scripts trong dự án.

## Danh sách utilities

### 1. env-loader.js

Utility để load biến môi trường (.env.local, .env) từ nhiều vị trí khác nhau trong dự án.

```javascript
import { loadEnvVariables, findProjectRoot, logToFile, getDatabaseUrl } from './utils/env-loader.js';

// Load biến môi trường
loadEnvVariables();

// Lấy đường dẫn đến thư mục gốc dự án
const projectRoot = findProjectRoot(__dirname);

// Ghi log vào file
await logToFile('Thông báo cần lưu', 'ten-file-log.log');

// Lấy DATABASE_URL từ env hoặc fallback
const dbUrl = getDatabaseUrl();
```

### 2. db-helper.js

Utility để làm việc với database.

```javascript
import { 
    connectToDatabase, 
    testDatabaseConnection,
    checkTableExists,
    getTableStructure,
    countRecords,
    listTables
} from './utils/cap-cuu-du-lieu.js';

// Kết nối database
const sql = await connectToDatabase();

// Kiểm tra kết nối
const isConnected = await testDatabaseConnection();

// Kiểm tra bảng tồn tại
const tableExists = await checkTableExists('artists');

// Lấy cấu trúc bảng
const tableColumns = await getTableStructure('artists');

// Đếm số lượng record
const artistCount = await countRecords('artists');

// Lấy danh sách bảng
const tables = await listTables();
```

### 3. api-helper.js

Utility để test API.

```javascript
import { 
    getBaseUrl, 
    callApi, 
    testApiEndpoint, 
    formatApiResult 
} from './utils/api-helper.js';

// Lấy base URL
const baseUrl = getBaseUrl();

// Gọi API
const data = await callApi('api/submissions');

// Test API endpoint
const testResult = await testApiEndpoint('api/submissions', 'Submissions Data');

// Format kết quả API
console.log(formatApiResult(data));
```

### 4. auth-helper.js

Utility để test authentication và authorization.

```javascript
import { 
    checkAuthStatus, 
    testLogin, 
    hasRole, 
    testAuthorization 
} from './utils/auth-helper.js';

// Kiểm tra trạng thái authentication
const authStatus = await checkAuthStatus();

// Test login
const loginResult = await testLogin('username', 'password');

// Kiểm tra quyền
const isAdmin = hasRole(user, 'admin');

// Test authorization
const authResult = await testAuthorization('api/submissions', 'LABEL_MANAGER');
```

## Hướng dẫn sử dụng

1. Import các utility cần thiết vào script của bạn
2. Luôn gọi `loadEnvVariables()` đầu tiên để đảm bảo biến môi trường được load
3. Sử dụng các hàm trong utility để thực hiện các tác vụ chung
4. Các lỗi sẽ được log vào thư mục logs/ tự động

Ví dụ cách sử dụng đầy đủ có thể xem trong các script như:

- `check-artists-table.js`
- `test-submissions.js`
- `test-real-authorization.js`
