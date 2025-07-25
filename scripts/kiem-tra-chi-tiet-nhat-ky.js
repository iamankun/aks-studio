// @ts-check
/**
 * Script kiểm tra chi tiết dữ liệu trong bảng nhat_ky_studio
 * Cung cấp thống kê và phân tích về nhật ký hoạt động của người dùng
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
        const logFile = path.join(logDir, "kiem-tra-chi-tiet-nhat-ky.log");
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

async function kiemTraChiTietNhatKy() {
    console.log('🔍 Kiểm tra chi tiết dữ liệu trong bảng nhat_ky_studio');
    console.log('='.repeat(70));
    await logToFile('Bắt đầu kiểm tra chi tiết nhat_ky_studio');

    try {
        // Kết nối đến database
        console.log('=== 1. Kết nối đến database ===');
        const sql = await connectToDatabase();
        await logToFile('Kết nối database thành công');

        // Kiểm tra bảng tồn tại
        console.log('\n=== 2. Kiểm tra bảng nhat_ky_studio ===');
        const existingTable = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'nhat_ky_studio'
        `;

        if (existingTable.length === 0) {
            console.error('❌ Bảng nhat_ky_studio không tồn tại');
            await logToFile('Bảng nhat_ky_studio không tồn tại');
            console.log('Vui lòng chạy script tao-bang-nhat-ky.js trước');
            return;
        }

        console.log('✅ Bảng nhat_ky_studio tồn tại');

        // Kiểm tra cấu trúc bảng
        console.log('\n=== 3. Kiểm tra cấu trúc bảng ===');
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'nhat_ky_studio'
            ORDER BY ordinal_position
        `;

        console.log('Cấu trúc bảng nhat_ky_studio:');
        columns.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Đếm tổng số bản ghi
        console.log('\n=== 4. Thống kê số lượng bản ghi ===');
        const countResult = await sql`
            SELECT COUNT(*) as total FROM nhat_ky_studio
        `;

        const totalRecords = countResult[0].total;
        console.log(`✅ Tổng số bản ghi: ${totalRecords}`);
        await logToFile(`Tổng số bản ghi: ${totalRecords}`);

        // Thống kê theo username
        console.log('\n=== 5. Thống kê theo username ===');
        const userStats = await sql`
            SELECT username, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY username
            ORDER BY count DESC
            LIMIT 10
        `;

        console.log('Top 10 username có nhiều hoạt động nhất:');
        userStats.forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.username}: ${stat.count} hoạt động`);
        });

        // Thống kê theo loại action
        console.log('\n=== 6. Thống kê theo action ===');
        const actionStats = await sql`
            SELECT action, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY action
            ORDER BY count DESC
        `;

        console.log('Thống kê theo loại action:');
        actionStats.forEach(stat => {
            console.log(`- ${stat.action}: ${stat.count} lần`);
        });

        // Thống kê theo category
        console.log('\n=== 7. Thống kê theo category ===');
        const categoryStats = await sql`
            SELECT category, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY category
            ORDER BY count DESC
        `;

        console.log('Thống kê theo category:');
        categoryStats.forEach(stat => {
            console.log(`- ${stat.category}: ${stat.count} lần`);
        });

        // Thống kê theo status
        console.log('\n=== 8. Thống kê theo status ===');
        const statusStats = await sql`
            SELECT status, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY status
            ORDER BY count DESC
        `;

        console.log('Thống kê theo status:');
        statusStats.forEach(stat => {
            console.log(`- ${stat.status || 'NULL'}: ${stat.count} lần`);
        });

        // Thống kê theo component_name
        console.log('\n=== 9. Thống kê theo component_name ===');
        const componentStats = await sql`
            SELECT component_name, COUNT(*) as count
            FROM nhat_ky_studio
            WHERE component_name IS NOT NULL
            GROUP BY component_name
            ORDER BY count DESC
            LIMIT 10
        `;

        console.log('Top 10 component có nhiều hoạt động nhất:');
        if (componentStats.length > 0) {
            componentStats.forEach((stat, index) => {
                console.log(`${index + 1}. ${stat.component_name}: ${stat.count} hoạt động`);
            });
        } else {
            console.log('Không có dữ liệu component_name');
        }

        // Thống kê theo thời gian
        console.log('\n=== 10. Thống kê theo thời gian ===');
        const timeStats = await sql`
            SELECT 
                DATE(created_at) as date, 
                COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 7
        `;

        console.log('Hoạt động 7 ngày gần đây:');
        timeStats.forEach(stat => {
            console.log(`- ${stat.date}: ${stat.count} hoạt động`);
        });

        // Phân tích chi tiết
        console.log('\n=== 11. Phân tích chi tiết ===');

        // Phân tích theo IP
        const ipStats = await sql`
            SELECT ip_address, COUNT(*) as count
            FROM nhat_ky_studio
            WHERE ip_address IS NOT NULL
            GROUP BY ip_address
            ORDER BY count DESC
            LIMIT 5
        `;

        console.log('Top 5 IP address:');
        ipStats.forEach((stat, index) => {
            console.log(`${index + 1}. ${stat.ip_address}: ${stat.count} hoạt động`);
        });

        // Phân tích theo session_id
        const sessionStats = await sql`
            SELECT session_id, COUNT(*) as count
            FROM nhat_ky_studio
            WHERE session_id IS NOT NULL
            GROUP BY session_id
            ORDER BY count DESC
            LIMIT 5
        `;

        console.log('\nTop 5 session có nhiều hoạt động nhất:');
        if (sessionStats.length > 0) {
            sessionStats.forEach((stat, index) => {
                console.log(`${index + 1}. ${stat.session_id}: ${stat.count} hoạt động`);
            });
        } else {
            console.log('Không có dữ liệu session_id');
        }

        // Lấy các bản ghi mới nhất
        console.log('\n=== 12. Các hoạt động mới nhất ===');
        const recentLogs = await sql`
            SELECT *
            FROM nhat_ky_studio
            ORDER BY created_at DESC
            LIMIT 5
        `;

        console.log('5 hoạt động gần nhất:');
        recentLogs.forEach((log, index) => {
            console.log(`\n${index + 1}. ID: ${log.id}`);
            console.log(`   Username: ${log.username}`);
            console.log(`   Thời gian: ${log.created_at}`);
            console.log(`   Action: ${log.action}`);
            console.log(`   Category: ${log.category}`);
            console.log(`   Status: ${log.status || 'N/A'}`);
            console.log(`   Component: ${log.component_name || 'N/A'}`);
            console.log(`   Details: ${JSON.stringify(log.details) || 'N/A'}`);
        });

        // Kiểm tra dữ liệu bất thường
        console.log('\n=== 13. Kiểm tra dữ liệu bất thường ===');

        // Kiểm tra các bản ghi không có username
        const missingUsername = await sql`
            SELECT COUNT(*) as count
            FROM nhat_ky_studio
            WHERE username IS NULL OR username = ''
        `;

        console.log(`- Bản ghi không có username: ${missingUsername[0].count}`);

        // Kiểm tra các bản ghi không có action
        const missingAction = await sql`
            SELECT COUNT(*) as count
            FROM nhat_ky_studio
            WHERE action IS NULL OR action = ''
        `;

        console.log(`- Bản ghi không có action: ${missingAction[0].count}`);

        // Kiểm tra các bản ghi không có category
        const missingCategory = await sql`
            SELECT COUNT(*) as count
            FROM nhat_ky_studio
            WHERE category IS NULL OR category = ''
        `;

        console.log(`- Bản ghi không có category: ${missingCategory[0].count}`);

        // Tổng kết
        console.log('\n=== 14. Tổng kết ===');
        console.log(`✅ Tổng số bản ghi: ${totalRecords}`);
        console.log(`✅ Số loại action khác nhau: ${actionStats.length}`);
        console.log(`✅ Số category khác nhau: ${categoryStats.length}`);
        console.log(`✅ Số username khác nhau: ${userStats.length}`);

        await logToFile(`Kiểm tra chi tiết thành công. Tổng số bản ghi: ${totalRecords}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await logToFile(`❌ Error: ${error.message}`);
    }
}

// Chạy function chính
kiemTraChiTietNhatKy().catch(console.error);
