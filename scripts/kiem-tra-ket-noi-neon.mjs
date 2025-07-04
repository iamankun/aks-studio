// Direct Database Test - Check real data in Neon PostgreSQL
/**
 * Script để kiểm tra trực tiếp dữ liệu trong database Neon PostgreSQL
 * Chạy bằng lệnh: node scripts/kiem-tra-ket-noi-neon.mjs
 */

// Import các package cần thiết
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cấu hình đường dẫn chính xác cho dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function debugDatabaseConnection() {
    console.log('=== Bắt đầu kiểm tra kết nối Database ===');
    console.log('1. Kiểm tra biến môi trường DATABASE_URL');
    
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        console.error('❌ Lỗi: DATABASE_URL không tìm thấy trong .env.local');
        console.log('Vui lòng kiểm tra file .env.local và đảm bảo có biến DATABASE_URL');
        return;
    }
    
    console.log('✅ Tìm thấy DATABASE_URL');
    console.log(`DATABASE_URL bắt đầu với: ${DATABASE_URL.substring(0, 20)}...`);
    
    console.log('\n2. Thử kết nối đến database');
    
    try {
        if (typeof neon !== 'function') {
            throw new Error('neon không phải là một hàm. Vui lòng kiểm tra lại package @neondatabase/serverless');
        }
        
        const sql = neon(DATABASE_URL);
        console.log('✅ Khởi tạo kết nối thành công');
        
        console.log('\n3. Thực hiện truy vấn test');
        try {
            const result = await sql`SELECT 1 as test`;
            if (result && result[0] && result[0].test === 1) {
                console.log('✅ Truy vấn test thành công!');
                
                // Kiểm tra bảng submissions
                try {
                    console.log('\n4. Kiểm tra bảng submissions');
                    const submissions = await sql`SELECT COUNT(*) as count FROM submissions`;
                    console.log(`✅ Bảng submissions có ${submissions[0].count} bản ghi`);
                } catch (tableError) {
                    console.error('❌ Lỗi khi truy vấn bảng submissions:', tableError.message);
                }
                
                // Kiểm tra bảng nhat_ky_studio
                try {
                    console.log('\n5. Kiểm tra bảng nhat_ky_studio');
                    
                    // Kiểm tra xem bảng có tồn tại không
                    const tableExists = await sql`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public'
                            AND table_name = 'nhat_ky_studio'
                        ) as exists
                    `;
                    
                    if (tableExists[0].exists) {
                        console.log('✅ Bảng nhat_ky_studio tồn tại');
                        
                        // Đếm số bản ghi
                        const logCount = await sql`SELECT COUNT(*) as count FROM nhat_ky_studio`;
                        console.log(`✅ Bảng nhat_ky_studio có ${logCount[0].count} bản ghi`);
                    } else {
                        console.log('❌ Bảng nhat_ky_studio không tồn tại');
                        console.log('Cần tạo bảng này cho hệ thống log API');
                    }
                } catch (logTableError) {
                    console.error('❌ Lỗi khi kiểm tra bảng nhat_ky_studio:', logTableError.message);
                }
                
            } else {
                console.error('❌ Truy vấn test thất bại - kết quả không hợp lệ');
            }
        } catch (queryError) {
            console.error('❌ Lỗi khi thực hiện truy vấn test:', queryError.message);
        }
    } catch (connectionError) {
        console.error('❌ Lỗi kết nối đến database:', connectionError.message);
        
        // Phân tích lỗi kết nối cụ thể hơn
        if (connectionError.message.includes('ENOTFOUND')) {
            console.log('→ Không tìm thấy host. Kiểm tra lại tên miền trong DATABASE_URL');
        } else if (connectionError.message.includes('ECONNREFUSED')) {
            console.log('→ Kết nối bị từ chối. Kiểm tra lại port và firewall');
        } else if (connectionError.message.includes('password authentication failed')) {
            console.log('→ Sai username hoặc password. Kiểm tra lại thông tin đăng nhập');
        } else if (connectionError.message.includes('database') && connectionError.message.includes('does not exist')) {
            console.log('→ Database không tồn tại. Kiểm tra lại tên database');
        }
    }
    
    console.log('\n=== Kết thúc kiểm tra ===');
}

// Chạy hàm debug
debugDatabaseConnection()
    .then(async () => {
        console.log('\n✅ Script kiểm tra hoàn tất.');
    })
    .catch(async (err) => {
        console.error('❌ Script gặp lỗi không mong muốn:', err.message);
        process.exit(1);
    });
