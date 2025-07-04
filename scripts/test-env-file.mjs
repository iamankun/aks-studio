// Kết nối trực tiếp với neon-db sử dụng file .env.test
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Thông báo khởi đầu
console.log('🔌 Test kết nối Neon PostgreSQL với file .env.test');

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn đến file .env.test
const envTestPath = path.resolve(__dirname, '.env.test');
console.log(`Đường dẫn .env.test: ${envTestPath}`);
console.log(`File tồn tại: ${fs.existsSync(envTestPath) ? 'Có' : 'Không'}`);

// Đọc file .env.test trực tiếp
try {
    // Load biến môi trường từ .env.test
    const result = dotenv.config({ path: envTestPath });
    console.log('Kết quả đọc file:', result.parsed ? 'Thành công' : 'Thất bại');
    
    if (result.parsed) {
        console.log('Các biến môi trường đã đọc:');
        Object.keys(result.parsed).forEach(key => {
            if (key === 'DATABASE_URL') {
                console.log(`- ${key}: ${result.parsed[key].substring(0, 20)}...`);
            } else {
                console.log(`- ${key}: [Có giá trị]`);
            }
        });
    }
    
    // Kiểm tra DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    console.log('\nKiểm tra DATABASE_URL:');
    console.log(dbUrl ? `✅ Đã tìm thấy: ${dbUrl.substring(0, 20)}...` : '❌ Không tìm thấy');
    
    if (dbUrl) {
        try {
            console.log('\nThử kết nối đến Neon...');
            const sql = neon(dbUrl);
            
            // Thực hiện truy vấn đơn giản
            const result = await sql`SELECT current_timestamp as now`;
            console.log('✅ Kết nối thành công!');
            console.log(`Thời gian máy chủ: ${result[0].now}`);
            
            // Kiểm tra bảng
            try {
                console.log('\nKiểm tra bảng nhat_ky_studio:');
                const tableExists = await sql`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        AND table_name = 'nhat_ky_studio'
                    ) as exists
                `;
                
                if (tableExists[0].exists) {
                    console.log('✅ Bảng nhat_ky_studio tồn tại');
                    // Tạo bản ghi test
                    const timestamp = new Date().toISOString();
                    await sql`
                        INSERT INTO nhat_ky_studio (
                            username, action, description, ip_address, user_agent, 
                            entity_type, status, result, details
                        ) VALUES (
                            'test-user', 'test', 'Test kết nối từ .env.test', '127.0.0.1',
                            'Test Script', 'test', 'success', '200', 
                            ${{timestamp, note: 'Kiểm tra từ file .env.test'}}
                        )
                    `;
                    console.log('✅ Đã thêm bản ghi test vào bảng nhat_ky_studio');
                } else {
                    console.log('❌ Bảng nhat_ky_studio không tồn tại');
                    console.log('Cần tạo bảng này cho hệ thống log API');
                }
            } catch (tableError) {
                console.error('❌ Lỗi khi kiểm tra bảng:', tableError.message);
            }
            
        } catch (dbError) {
            console.error('❌ Lỗi kết nối đến Neon:', dbError.message);
            
            if (dbError.message.includes('no pg_hba.conf entry')) {
                console.log('👉 Lỗi quyền truy cập. Kiểm tra IP trong Neon dashboard');
            } else if (dbError.message.includes('password authentication failed')) {
                console.log('👉 Sai username hoặc password');
            } else if (dbError.message.includes('database') && dbError.message.includes('does not exist')) {
                console.log('👉 Database không tồn tại');
            }
        }
    } else {
        console.log('❌ Không thể kết nối vì không tìm thấy DATABASE_URL');
    }
    
} catch (error) {
    console.error('❌ Lỗi khi đọc file .env.test:', error.message);
}

console.log('\n🏁 Kiểm tra hoàn tất');
