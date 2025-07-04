// @ts-check
/**
 * Script để kiểm tra xem activity log cho login đã được ghi lại đúng cách
 */

import { neon } from "@neondatabase/serverless";
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function logToFile(message) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, "kiem-tra-log-dang-nhap.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

async function connectToDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL không tìm thấy trong .env.local');
    }
    return neon(DATABASE_URL);
}

async function getLoginLogs() {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL không tìm thấy trong .env.local');
    }
    const sql = neon(DATABASE_URL);

    return await sql`
        SELECT * FROM nhat_ky_studio
        WHERE action = 'login' OR action = 'registration' OR action = 'ui_interaction'
        ORDER BY created_at DESC
        LIMIT 20
    `;
}

async function main() {
    try {
        console.log('🔍 Kiểm tra log hoạt động đăng nhập/đăng ký');
        console.log('='.repeat(60));

        await logToFile('Bắt đầu kiểm tra log đăng nhập/đăng ký');

        // Kết nối đến database
        console.log('=== 1. Kết nối đến database ===');
        if (!process.env.DATABASE_URL) {
            console.log('❌ Không tìm thấy DATABASE_URL trong .env.local');
            return;
        }
        console.log('Database URL tìm thấy, đang kết nối...');

        // Lấy log đăng nhập/đăng ký
        console.log('=== 2. Lấy log đăng nhập/đăng ký ===');
        const logs = await getLoginLogs();

        if (logs && logs.length > 0) {
            console.log(`✅ Tìm thấy ${logs.length} log liên quan đến đăng nhập/đăng ký`);

            // Phân loại logs
            const loginLogs = logs.filter(log => log.action === 'login');
            const registrationLogs = logs.filter(log => log.action === 'registration');
            const uiLogs = logs.filter(log => log.action === 'ui_interaction');

            console.log(`\n=== Log đăng nhập (${loginLogs.length}) ===`);
            if (loginLogs.length > 0) {
                loginLogs.forEach((log, index) => {
                    console.log(`\nLog #${index + 1}:`);
                    console.log(`- Username: ${log.username || 'N/A'}`);
                    console.log(`- Thời gian: ${new Date(log.created_at).toLocaleString()}`);
                    console.log(`- Trạng thái: ${log.status || 'N/A'}`);
                    console.log(`- Component: ${log.component_name || 'N/A'}`);
                    if (log.details) {
                        console.log(`- Chi tiết: ${JSON.stringify(log.details, null, 2)}`);
                    }
                });
            } else {
                console.log('Không có log đăng nhập');
            }

            console.log(`\n=== Log đăng ký (${registrationLogs.length}) ===`);
            if (registrationLogs.length > 0) {
                registrationLogs.forEach((log, index) => {
                    console.log(`\nLog #${index + 1}:`);
                    console.log(`- Username: ${log.username || 'N/A'}`);
                    console.log(`- Thời gian: ${new Date(log.created_at).toLocaleString()}`);
                    console.log(`- Trạng thái: ${log.status || 'N/A'}`);
                    console.log(`- Component: ${log.component_name || 'N/A'}`);
                    if (log.details) {
                        console.log(`- Chi tiết: ${JSON.stringify(log.details, null, 2)}`);
                    }
                });
            } else {
                console.log('Không có log đăng ký');
            }

            console.log(`\n=== Log tương tác UI (${uiLogs.length}) ===`);
            if (uiLogs.length > 0) {
                const uiCategories = {};
                uiLogs.forEach(log => {
                    const category = log.category || 'unknown';
                    uiCategories[category] = (uiCategories[category] || 0) + 1;
                });

                console.log('Thống kê theo danh mục UI:');
                Object.entries(uiCategories).forEach(([category, count]) => {
                    console.log(`- ${category}: ${count} log`);
                });

                // Hiển thị 5 log gần nhất
                console.log('\n5 log tương tác UI gần nhất:');
                uiLogs.slice(0, 5).forEach((log, index) => {
                    console.log(`\nLog #${index + 1}:`);
                    console.log(`- Thời gian: ${new Date(log.created_at).toLocaleString()}`);
                    console.log(`- Danh mục: ${log.category || 'N/A'}`);
                    console.log(`- Component: ${log.component_name || 'N/A'}`);
                    if (log.details) {
                        console.log(`- Chi tiết: ${JSON.stringify(log.details, null, 2)}`);
                    }
                });
            } else {
                console.log('Không có log tương tác UI');
            }
        } else {
            console.log('❌ Không tìm thấy log đăng nhập/đăng ký');
        }

        console.log('\n=== 3. Tổng kết ===');
        console.log('✅ Kiểm tra log đăng nhập/đăng ký hoàn tất');

    } catch (error) {
        console.error('Lỗi:', error.message);
        await logToFile(`Lỗi: ${error.message}`);
    }
}

// Chạy chương trình
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { getLoginLogs };
