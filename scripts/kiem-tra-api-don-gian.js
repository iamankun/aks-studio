// @ts-check
/**
 * Script đơn giản để kiểm tra API submissions với axios
 * 
 * Cách sử dụng:
 * 1. Cài đặt axios nếu chưa có: npm install axios
 * 2. Chạy: node scripts/simple-api-test.js
 */


import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Lấy đường dẫn gốc của dự án, chuẩn hóa tuyệt đối cho Windows
let __filename = new URL(import.meta.url).pathname;
if (process.platform === 'win32' && __filename.startsWith('/')) {
    __filename = __filename.slice(1);
}
const rootDir = path.resolve(path.dirname(__filename), '..');

// Cấu hình
const config = {
    baseUrl: 'http://localhost:3000/api',
    endpoints: [
        '/submissions',
        '/submissions?username=test',
        '/submissions/123', // ID demo, có thể không tồn tại
        '/artists',
        '/artists/1',
        '/auth/status',
        '/user/profile',
        '/debug/all',
    ],
    outputFile: path.join(rootDir, 'logs', 'bao-cao-api.json')
};

// Tạo thư mục logs nếu chưa tồn tại, log debug giá trị logsDir
const logsDir = path.join(rootDir, 'logs');
console.log('DEBUG logsDir:', logsDir);
if (!fs.existsSync(logsDir)) {
    try {
        fs.mkdirSync(logsDir, { recursive: true });
        console.log(`✅ Đã tạo thư mục logs tại ${logsDir}`);
    } catch (err) {
        console.error('❌ mkdirSync error:', err);
    }
}

// Hàm kiểm tra API endpoint
async function testEndpoint(endpoint) {
    const url = `${config.baseUrl}${endpoint}`;
    console.log(`🔍 Testing: ${url}`);

    try {
        const response = await axios.get(url);

        return {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            success: true,
            data: response.data,
            error: null,
            headers: response.headers
        };
    } catch (error) {
        console.error(`❌ Error testing ${url}:`, error.message);

        return {
            endpoint,
            status: error.response?.status || 500,
            statusText: error.response?.statusText || 'Internal Server Error',
            success: false,
            data: error.response?.data || null,
            error: error.message,
            headers: error.response?.headers || {}
        };
    }
}

// Hàm chính để kiểm tra tất cả API endpoints
async function testAllEndpoints() {
    console.log('🚀 Starting API Endpoints Test');
    console.log('='.repeat(50));

    const results = [];

    for (const endpoint of config.endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);

        // In kết quả cho endpoint hiện tại
        console.log(`\nEndpoint: ${endpoint}`);
        console.log(`Status: ${result.status} ${result.statusText}`);
        console.log(`Success: ${result.success ? '✅ Yes' : '❌ No'}`);
        if (result.error) {
            console.log(`Error: ${result.error}`);
        }
        console.log('-'.repeat(50));
    }

    // Lưu kết quả vào file
    fs.writeFileSync(
        config.outputFile,
        JSON.stringify(results, null, 2)
    );

    console.log(`\n✅ Test hoàn tất!`);
    console.log(`📝 Kết quả đã được lưu vào: ${config.outputFile}`);

    // Thống kê
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    console.log('\n📊 Thống kê:');
    console.log(`Tổng số endpoints: ${results.length}`);
    console.log(`Thành công: ${successCount}`);
    console.log(`Thất bại: ${failCount}`);
}

// Chạy test
testAllEndpoints().catch(error => {
    console.error('❌ Error running tests:', error);
});
