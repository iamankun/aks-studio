# Hướng dẫn Chuyển đổi từ LocalStorage sang Database

Dự án đã được cấu hình để sử dụng cơ sở dữ liệu thực tế (Neon PostgreSQL) thay vì lưu trữ cục bộ (localStorage). Tài liệu này mô tả các phương pháp khuyến nghị để làm việc với dữ liệu trong ứng dụng.

## Hệ thống Cơ sở dữ liệu

Dự án sử dụng hai service chính để quản lý kết nối cơ sở dữ liệu:

### 1. MultiDatabaseService

`MultiDatabaseService` (trong `lib/multi-database-service.ts`) quản lý kết nối đến database và cung cấp các phương thức:

- `authenticateUser(username, password)` - Xác thực người dùng
- `getArtists(filters)` - Lấy danh sách nghệ sĩ
- `getSubmissions(filters)` - Lấy danh sách bài nộp
- Các phương thức khác liên quan đến database

### 2. DatabaseService

`DatabaseService` (trong `lib/database-service.ts`) cung cấp các phương thức bổ sung và hỗ trợ fallback:

- `saveSubmission(submission)` - Lưu bài nộp mới
- `updateSubmission(id, data)` - Cập nhật bài nộp
- Các phương thức khác liên quan đến database

## Các hàm lưu trữ cục bộ không còn được dùng

Các hàm sau trong `lib/data.ts` đã được đánh dấu là không còn được dùng và nên tránh sử dụng:

- `loadUsersFromLocalStorage()`
- `saveUsersToLocalStorage(users)`
- `fetchUsersFromClient()`
- `loginUser(username, password)`
- `saveUsersToDatabase_DEPRECATED(users)`
- `loadSubmissionsFromLocalStorage()`
- `saveSubmissionsToLocalStorage(submissions)`
- `fetchSubmissionsFromClient()`
- `saveSubmissionsToClient(submissions)`

## Cách sử dụng API

Thay vì sử dụng các hàm lưu trữ cục bộ, hãy gọi API:

```typescript
// Thay vì:
const users = loadUsersFromLocalStorage();

// Hãy sử dụng:
const response = await fetch('/api/users');
const result = await response.json();
const users = result.data;
```

### Xác thực

```typescript
// Đã được triển khai trong AuthProvider:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username, password })
});
```

### Dữ liệu Bài nộp

Các API endpoints đã được triển khai cho bài nộp:

```typescript
// Lấy tất cả bài nộp
const response = await fetch('/api/submissions');
const result = await response.json();
const submissions = result.data;

// Lấy bài nộp theo ID
const response = await fetch(`/api/submissions/${submissionId}`);
const result = await response.json();
const submission = result.data;

// Tạo bài nộp mới
await fetch('/api/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newSubmission)
});

// Cập nhật bài nộp
await fetch(`/api/submissions/${submissionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updateData)
});

// Xóa bài nộp
await fetch(`/api/submissions/${submissionId}`, {
  method: 'DELETE'
});
```

## Các Endpoint API Hiện có

Dự án này có các endpoint API sau:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `GET /api/submissions` - Lấy danh sách bài nộp
- `POST /api/submissions` - Tạo bài nộp mới
- `GET /api/submissions/:id` - Lấy chi tiết một bài nộp
- `PUT /api/submissions/:id` - Cập nhật bài nộp
- `DELETE /api/submissions/:id` - Xóa bài nộp
- `GET /api/artists` - Lấy danh sách nghệ sĩ

## Cấu trúc Database

Dự án sử dụng PostgreSQL (thông qua Neon) với các bảng chính sau:

1. `label_manager` - Quản lý thông tin người quản lý nhãn hiệu
2. `artist` - Quản lý thông tin nghệ sĩ
3. `submissions` - Quản lý bài nộp

## Hoàn tất chuyển đổi

Chúng tôi đã hoàn thành việc triển khai các API endpoint cho hệ thống bài nộp (submissions). Dưới đây là hướng dẫn cách sử dụng chúng:

### Tổng quan các API Endpoint mới

- `GET /api/submissions` - Lấy danh sách tất cả bài nộp
- `GET /api/submissions/:id` - Lấy chi tiết một bài nộp cụ thể
- `POST /api/submissions` - Tạo bài nộp mới
- `PUT /api/submissions/:id` - Cập nhật thông tin bài nộp hiện có
- `DELETE /api/submissions/:id` - Xóa một bài nộp

### Sử dụng API trong Components

Sau đây là một số ví dụ về cách sử dụng các API endpoint mới:

#### Lấy và hiển thị danh sách bài nộp

```typescript
import { useEffect, useState } from 'react'
import type { Submission } from '@/types/submission'

function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true)
        const response = await fetch('/api/submissions')
        const result = await response.json()
        
        if (result.success) {
          setSubmissions(result.data)
        } else {
          setError(result.message || 'Failed to load submissions')
        }
      } catch (err) {
        setError('Error loading submissions')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Submissions</h2>
      <ul>
        {submissions.map(submission => (
          <li key={submission.id}>{submission.songTitle} - {submission.artistName}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### Cập nhật trạng thái bài nộp

```typescript
async function updateSubmissionStatus(submissionId: string, newStatus: string) {
  try {
    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Cập nhật UI hoặc hiển thị thông báo thành công
      console.log('Status updated successfully')
      return true
    } else {
      console.error('Failed to update status:', result.message)
      return false
    }
  } catch (error) {
    console.error('Error updating submission status:', error)
    return false
  }
}
```

#### Xóa một bài nộp

```typescript
async function deleteSubmission(submissionId: string) {
  try {
    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Xử lý UI sau khi xóa thành công
      console.log('Submission deleted successfully');
      return true;
    } else {
      console.error('Failed to delete:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error deleting submission:', error);
    return false;
  }
}
```

### Hệ thống Phân quyền

Hệ thống chỉ sử dụng hai loại phân quyền chính:

1. **Label Manager** - Quản lý nhãn hiệu, có quyền quản lý toàn bộ bài nộp và thông tin nghệ sĩ
2. **Artist** - Nghệ sĩ, chỉ có quyền quản lý bài nộp của chính mình

Lưu ý:

- Không thêm bất kỳ loại phân quyền nào khác
- Kiểm tra phân quyền nên sử dụng so sánh chính xác: `user.role === 'Label Manager'` hoặc `user.role === 'Artist'`
- Các hành động như xóa và cập nhật submissions chỉ nên được thực hiện bởi người dùng có vai trò "Label Manager"
- Hệ thống xác thực đã được quản lý bởi kênh riêng và không nên can thiệp sâu vào logic xác thực

### Thông tin và Cảnh báo

Một số lưu ý quan trọng về hệ thống cảnh báo và debug:

1. Các thông tin cảnh báo, logs, tài nguyên và thông báo chế độ (demo/production) chỉ hiển thị cho người dùng có vai trò "Label Manager".
2. Người dùng "Artist" sẽ không thấy các thông tin debug, cảnh báo và panel quản trị.
3. Hệ thống vẫn hiển thị thông báo "demo" ngay cả khi ở môi trường production, trừ khi APP_MODE được đặt rõ ràng thành "production".
4. Không thay đổi logic hiển thị cảnh báo hoặc thêm các cảnh báo mới cho người dùng "Artist".

Khi thêm các tính năng mới liên quan đến logs, debug hoặc cảnh báo, hãy đảm bảo chúng chỉ hiển thị cho người dùng "Label Manager" bằng cách kiểm tra vai trò:

```tsx
// Ví dụ kiểm tra vai trò trước khi hiển thị cảnh báo
{isLabelManager && (
  <div className="warning-message">
    Cảnh báo: Đây là chế độ demo
  </div>
)}
```

### Lưu ý Quan Trọng

1. Tất cả các hàm sử dụng localStorage trong `lib/data.ts` đã được đánh dấu là deprecated và không nên sử dụng trong code mới.
2. Các hàm API hỗ trợ cả multiDB (Neon PostgreSQL) và fallback mode để đảm bảo tính tương thích ngược.
3. Hãy đảm bảo xử lý lỗi khi gọi API để tăng tính ổn định của ứng dụng.
4. Các hành động như xóa và cập nhật chỉ nên được thực hiện bởi người dùng có vai trò "Label Manager".

Hãy triển khai các thay đổi này để ứng dụng của bạn hoạt động hiệu quả hơn với cơ sở dữ liệu!

Chúc thành công!
