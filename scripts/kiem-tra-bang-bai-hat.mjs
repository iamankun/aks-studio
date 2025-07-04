// @ts-check
/**
 * Script để kiểm tra API submissions
 * Chạy: node scripts/test-submissions-api.mjs
 */

// Sử dụng fetch native từ Node.js thay vì node-fetch
// Cần Node.js v18+
const fetch = (...args) => import('node:fetch').then(({ default: fetch }) => fetch(...args));
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy directory hiện tại
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Lấy đường dẫn gốc của dự án
const rootDir = path.resolve(__dirname, '..');

// Config
const config = {
    baseUrl: 'http://localhost:3000/api',
    endpoints: [
        { path: '/submissions', method: 'GET', auth: false },
        { path: '/submissions?status=pending', method: 'GET', auth: true },
        { path: '/submissions?username=test', method: 'GET', auth: false },
        { path: '/submissions/1', method: 'GET', auth: false },
        { path: '/artists', method: 'GET', auth: false },
        { path: '/artists/1', method: 'GET', auth: false },
        { path: '/user/profile', method: 'GET', auth: true },
        { path: '/auth/status', method: 'GET', auth: false },
    ],
    // Thông tin đăng nhập để test API yêu cầu auth
    // Thay đổi thông tin này theo tài khoản thật trong database
    auth: {
        email: 'admin@example.com',
        password: 'admin123'
    },
    outputFile: path.join(rootDir, 'logs', 'api-submissions-test.json')
};

// Tạo thư mục logs nếu chưa tồn tại
async function ensureLogDir() {
    const logsDir = path.join(rootDir, 'logs');
    try {
        await fs.mkdir(logsDir, { recursive: true });
        console.log(`✅ Đã tạo thư mục logs tại ${logsDir}`);
    } catch (error) {
        // Thư mục đã tồn tại hoặc lỗi khác
        if (error.code !== 'EEXIST') {
            console.error('❌ Lỗi khi tạo thư mục logs:', error);
        }
    }
}

// Hàm để đăng nhập và lấy token
async function login() {
    console.log('🔑 Đang đăng nhập...');

    try {
        const response = await fetch(`${config.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: config.auth.email,
                password: config.auth.password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Đăng nhập thất bại: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('✅ Đăng nhập thành công!');

        // Trả về token hoặc cookie từ response
        return data.token || data.accessToken || 'session-cookie';
    } catch (error) {
        console.error('❌ Lỗi đăng nhập:', error.message);
        return null;
    }
}

// Hàm kiểm tra API endpoint
async function testEndpoint(endpoint, authToken = null) {
    const url = `${config.baseUrl}${endpoint.path}`;
    console.log(`🔍 Testing: ${endpoint.method} ${url} ${endpoint.auth ? '(Auth Required)' : ''}`);

    const headers = {
        'Accept': 'application/json'
    };

    // Thêm token vào header nếu API yêu cầu auth
    if (endpoint.auth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, {
            method: endpoint.method,
            headers
        });

        const responseData = await response.json().catch(() => null);

        return {
            endpoint: endpoint.path,
            method: endpoint.method,
            status: response.status,
            statusText: response.statusText,
            success: response.ok,
            data: responseData,
            error: null,
            authRequired: endpoint.auth,
            authenticated: endpoint.auth && authToken !== null
        };
    } catch (error) {
        console.error(`❌ Error testing ${url}:`, error.message);

        return {
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 500,
            statusText: 'Internal Server Error',
            success: false,
            data: null,
            error: error.message,
            authRequired: endpoint.auth,
            authenticated: endpoint.auth && authToken !== null
        };
    }
}

// Hàm chính để kiểm tra tất cả API endpoints
async function testAllEndpoints() {
    console.log('🚀 Starting API Submissions Endpoints Test');
    console.log('='.repeat(60));

    // Đảm bảo thư mục logs tồn tại
    await ensureLogDir();

    // Đăng nhập nếu có API yêu cầu auth
    const needsAuth = config.endpoints.some(e => e.auth);
    let authToken = null;

    if (needsAuth) {
        authToken = await login();
    }

    const results = [];

    for (const endpoint of config.endpoints) {
        const result = await testEndpoint(endpoint, authToken);
        results.push(result);

        // In kết quả cho endpoint hiện tại
        console.log(`\nEndpoint: ${endpoint.method} ${endpoint.path}`);
        console.log(`Status: ${result.status} ${result.statusText}`);
        console.log(`Success: ${result.success ? '✅ Yes' : '❌ No'}`);

        if (endpoint.auth) {
            console.log(`Auth: ${result.authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}`);
        }

        if (result.error) {
            console.log(`Error: ${result.error}`);
        } else if (result.data) {
            // Hiển thị số lượng kết quả hoặc loại dữ liệu nhận được
            if (Array.isArray(result.data)) {
                console.log(`Data: Array with ${result.data.length} items`);
            } else if (typeof result.data === 'object') {
                console.log(`Data: Object with keys [${Object.keys(result.data).join(', ')}]`);
            } else {
                console.log(`Data: ${typeof result.data}`);
            }
        }

        console.log('-'.repeat(60));
    }

    // Lưu kết quả vào file
    await fs.writeFile(
        config.outputFile,
        JSON.stringify(results, null, 2)
    );

    console.log(`\n✅ Test hoàn tất!`);
    console.log(`📝 Kết quả đã được lưu vào: ${config.outputFile}`);

    // Thống kê
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    const authResults = results.filter(r => r.authRequired);
    const authSuccessCount = authResults.filter(r => r.success && r.authenticated).length;

    console.log('\n📊 Thống kê:');
    console.log(`Tổng số endpoints: ${results.length}`);
    console.log(`Thành công: ${successCount}`);
    console.log(`Thất bại: ${failCount}`);
    console.log(`API yêu cầu auth: ${authResults.length}`);
    console.log(`API auth thành công: ${authSuccessCount}`);
}

// Chạy test
testAllEndpoints().catch(error => {
    console.error('❌ Error running tests:', error);
});
