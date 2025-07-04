// @ts-check
/**
 * Script để kiểm tra chức năng ghi log vào nhat_ky_studio
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
        const logFile = path.join(logDir, "kiem-tra-nhat-ky.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

async function testActivityLog() {
    console.log('🔍 Kiểm tra chức năng ghi log vào nhat_ky_studio');
    console.log('='.repeat(70));
    await logToFile('Bắt đầu kiểm tra chức năng ghi log');

    try {
        // Kết nối đến database
        console.log('=== 1. Kết nối đến database ===');
        await logToFile('Đang kết nối đến database');

        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            const errorMsg = 'DATABASE_URL không tìm thấy trong .env.local';
            console.error('❌ ' + errorMsg);
            await logToFile('❌ ' + errorMsg);
            return;
        }

        console.log('Database URL tìm thấy, đang kết nối...');
        const sql = neon(DATABASE_URL);
        await logToFile('✅ Kết nối database thành công');

        // Kiểm tra nhat_ky_studio
        console.log('\n=== 2. Kiểm tra bảng nhat_ky_studio ===');
        await logToFile('Đang kiểm tra bảng nhat_ky_studio');

        const existingTable = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'nhat_ky_studio'
        `;

        if (existingTable.length === 0) {
            console.error('❌ Bảng nhat_ky_studio không tồn tại');
            await logToFile('❌ Bảng nhat_ky_studio không tồn tại');
            console.log('Vui lòng chạy script tao-bang-nhat-ky.js trước');
            return;
        }

        console.log('✅ Bảng nhat_ky_studio tồn tại');
        await logToFile('✅ Bảng nhat_ky_studio tồn tại');

        // Thêm một log mẫu
        console.log('\n=== 3. Thêm log mẫu ===');
        await logToFile('Đang thêm log mẫu');

        const testLog = {
            username: 'test_script',
            user_id: 'test-user-id',
            action: 'test_activity_log',
            category: 'test',
            details: {
                test: true,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            },
            ip_address: '127.0.0.1',
            user_agent: 'Node.js Test Script',
            status: 'success',
            component_name: 'TestScript',
            session_id: 'test-session',
            related_ids: { testId: 'test-123' }
        };

        const insertResult = await sql`
            INSERT INTO nhat_ky_studio (
                username, 
                user_id,
                action, 
                category,
                details, 
                ip_address, 
                user_agent,
                status,
                component_name,
                session_id,
                related_ids
            ) VALUES (
                ${testLog.username}, 
                ${testLog.user_id},
                ${testLog.action}, 
                ${testLog.category},
                ${testLog.details},
                ${testLog.ip_address},
                ${testLog.user_agent},
                ${testLog.status},
                ${testLog.component_name},
                ${testLog.session_id},
                ${testLog.related_ids}
            ) RETURNING id
        `;

        console.log(`✅ Đã thêm log mẫu với ID: ${insertResult[0].id}`);
        await logToFile(`✅ Đã thêm log mẫu với ID: ${insertResult[0].id}`);

        // Truy vấn log vừa thêm
        console.log('\n=== 4. Kiểm tra log vừa thêm ===');
        await logToFile('Đang kiểm tra log vừa thêm');

        const logResult = await sql`
            SELECT * FROM nhat_ky_studio
            WHERE id = ${insertResult[0].id}
        `;

        if (logResult.length === 0) {
            console.error('❌ Không tìm thấy log vừa thêm');
            await logToFile('❌ Không tìm thấy log vừa thêm');
        } else {
            console.log('✅ Tìm thấy log vừa thêm:');
            console.log(logResult[0]);
            await logToFile('✅ Tìm thấy log vừa thêm');
        }

        // Tổng số log trong bảng
        console.log('\n=== 5. Thống kê log ===');
        await logToFile('Đang thống kê log');

        const countResult = await sql`
            SELECT COUNT(*) as total FROM nhat_ky_studio
        `;

        console.log(`✅ Tổng số log trong bảng: ${countResult[0].total}`);
        await logToFile(`✅ Tổng số log trong bảng: ${countResult[0].total}`);

        // Thống kê theo loại action
        const actionStats = await sql`
            SELECT action, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY action
            ORDER BY count DESC
        `;

        console.log('\nThống kê theo loại action:');
        for (const stat of actionStats) {
            console.log(`- ${stat.action}: ${stat.count} log`);
        }

        console.log('\n=== 6. Tổng kết ===');
        console.log('✅ Kiểm tra chức năng ghi log thành công');
        await logToFile('✅ Kiểm tra chức năng ghi log thành công');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await logToFile(`❌ Error: ${error.message}`);
    }
}

// Chạy function chính
testActivityLog().catch(console.error);
