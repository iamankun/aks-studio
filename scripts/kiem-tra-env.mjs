// Check Environment Variables
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Cấu hình đường dẫn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

console.log('=== KIỂM TRA BIẾN MÔI TRƯỜNG ===');
console.log(`File .env.local path: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath) ? 'YES' : 'NO'}`);

if (fs.existsSync(envPath)) {
    // Đọc nội dung file (chỉ để debug, không làm trong production)
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\nFile content preview (first few lines):');
    // Chỉ hiển thị 5 dòng đầu và ẩn giá trị nhạy cảm
    const lines = content.split('\n').slice(0, 5).map(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            return `${key}=[VALUE HIDDEN]`;
        }
        return line;
    });
    console.log(lines.join('\n'));
    console.log('...');
    
    // Kiểm tra xem DATABASE_URL có trong file không
    const hasDBUrl = content.includes('DATABASE_URL=');
    console.log(`\nDatabase URL found in file: ${hasDBUrl ? 'YES' : 'NO'}`);
}

// Load các biến môi trường
dotenv.config({ path: envPath });

// Hiển thị tất cả biến môi trường (chỉ hiển thị key, không hiển thị value)
console.log('\nLoaded environment variables:');
const envKeys = Object.keys(process.env).sort();
for (const key of envKeys) {
    if (key.includes('DATABASE') || key.includes('DB_')) {
        console.log(`- ${key}: [ĐỊNH DẠNG GIÁ TRỊ] ${typeof process.env[key]}, [ĐỘ DÀI] ${process.env[key].length}`);
    } else {
        console.log(`- ${key}: [ĐỊNH DẠNG GIÁ TRỊ] ${typeof process.env[key]}`);
    }
}

// Kiểm tra biến DATABASE_URL
console.log('\nKiểm tra DATABASE_URL:');
if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL tồn tại trong process.env');
    console.log(`Bắt đầu với: ${process.env.DATABASE_URL.substring(0, 20)}...`);
} else {
    console.log('❌ DATABASE_URL KHÔNG tồn tại trong process.env');
    
    // Kiểm tra các biến tương tự
    const dbKeys = envKeys.filter(key => key.includes('DATABASE') || key.includes('DB_'));
    if (dbKeys.length > 0) {
        console.log('\nNhưng tìm thấy các biến tương tự:');
        dbKeys.forEach(key => console.log(`- ${key}`));
    }
}
