// @ts-check
/**
 * Script kiểm tra lỗi và vấn đề trong bảng nhat_ky_studio
 * Phát hiện các bản ghi không hợp lệ hoặc có vấn đề
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
        const logFile = path.join(logDir, "kiem-tra-loi-nhat-ky.log");
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

async function kiemTraLoiNhatKy() {
    console.log('🔍 Kiểm tra lỗi trong bảng nhat_ky_studio');
    console.log('='.repeat(70));
    await logToFile('Bắt đầu kiểm tra lỗi nhat_ky_studio');

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
            await logToFile('❌ Bảng nhat_ky_studio không tồn tại');
            console.log('Vui lòng chạy script tao-bang-nhat-ky.js trước');
            return;
        }

        console.log('✅ Bảng nhat_ky_studio tồn tại');
        await logToFile('✅ Bảng nhat_ky_studio tồn tại');

        // Kiểm tra dữ liệu trống hoặc null
        console.log('\n=== 3. Kiểm tra dữ liệu trống ===');

        // Kiểm tra username trống
        const nullUsername = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE username IS NULL OR TRIM(username) = ''
        `;

        console.log(`Username trống: ${nullUsername[0].count} bản ghi`);
        if (nullUsername[0].count > 0) {
            console.log('⚠️ Có bản ghi thiếu username');
            await logToFile(`⚠️ Phát hiện ${nullUsername[0].count} bản ghi thiếu username`);
        }

        // Kiểm tra action trống
        const nullAction = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE action IS NULL OR TRIM(action) = ''
        `;

        console.log(`Action trống: ${nullAction[0].count} bản ghi`);
        if (nullAction[0].count > 0) {
            console.log('⚠️ Có bản ghi thiếu action');
            await logToFile(`⚠️ Phát hiện ${nullAction[0].count} bản ghi thiếu action`);
        }

        // Kiểm tra category trống
        const nullCategory = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE category IS NULL OR TRIM(category) = ''
        `;

        console.log(`Category trống: ${nullCategory[0].count} bản ghi`);
        if (nullCategory[0].count > 0) {
            console.log('⚠️ Có bản ghi thiếu category');
            await logToFile(`⚠️ Phát hiện ${nullCategory[0].count} bản ghi thiếu category`);
        }

        // Kiểm tra dữ liệu bất thường
        console.log('\n=== 4. Kiểm tra dữ liệu bất thường ===');

        // Kiểm tra details không phải JSON
        const invalidDetails = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE details IS NOT NULL AND jsonb_typeof(details) IS NULL
        `;

        console.log(`Details không phải JSON: ${invalidDetails[0].count} bản ghi`);
        if (invalidDetails[0].count > 0) {
            console.log('⚠️ Có bản ghi có trường details không phải JSON hợp lệ');
            await logToFile(`⚠️ Phát hiện ${invalidDetails[0].count} bản ghi có details không hợp lệ`);
        }

        // Kiểm tra related_ids không phải JSON
        const invalidRelatedIds = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE related_ids IS NOT NULL AND jsonb_typeof(related_ids) IS NULL
        `;

        console.log(`Related IDs không phải JSON: ${invalidRelatedIds[0].count} bản ghi`);
        if (invalidRelatedIds[0].count > 0) {
            console.log('⚠️ Có bản ghi có trường related_ids không phải JSON hợp lệ');
            await logToFile(`⚠️ Phát hiện ${invalidRelatedIds[0].count} bản ghi có related_ids không hợp lệ`);
        }

        // Kiểm tra các bản ghi lỗi
        console.log('\n=== 5. Kiểm tra bản ghi có dấu hiệu lỗi ===');
        const errorRecords = await sql`
            SELECT * FROM nhat_ky_studio
            WHERE 
                status = 'error' OR 
                status = 'failed' OR
                status LIKE '%lỗi%' OR
                status LIKE '%fail%' OR
                status LIKE '%error%'
            ORDER BY created_at DESC
            LIMIT 5
        `;

        if (errorRecords.length > 0) {
            console.log(`⚠️ Phát hiện ${errorRecords.length} bản ghi có dấu hiệu lỗi:`);
            errorRecords.forEach((record, index) => {
                console.log(`\n${index + 1}. ID: ${record.id}`);
                console.log(`   Username: ${record.username}`);
                console.log(`   Thời gian: ${record.created_at}`);
                console.log(`   Action: ${record.action}`);
                console.log(`   Status: ${record.status}`);
                console.log(`   Details: ${JSON.stringify(record.details) || 'N/A'}`);
            });
            await logToFile(`⚠️ Phát hiện ${errorRecords.length} bản ghi có dấu hiệu lỗi`);
        } else {
            console.log('✅ Không phát hiện bản ghi có dấu hiệu lỗi');
        }

        // Kiểm tra dữ liệu trùng lặp
        console.log('\n=== 6. Kiểm tra dữ liệu trùng lặp ===');
        const duplicateRecords = await sql`
            SELECT 
                username, action, category, COUNT(*) as count
            FROM nhat_ky_studio
            GROUP BY username, action, category
            HAVING COUNT(*) > 10
            ORDER BY count DESC
            LIMIT 5
        `;

        if (duplicateRecords.length > 0) {
            console.log('⚠️ Nhóm bản ghi có dấu hiệu trùng lặp:');
            duplicateRecords.forEach((record, index) => {
                console.log(`${index + 1}. ${record.username} - ${record.action} - ${record.category}: ${record.count} lần`);
            });
            await logToFile(`⚠️ Phát hiện ${duplicateRecords.length} nhóm bản ghi có dấu hiệu trùng lặp`);
        } else {
            console.log('✅ Không phát hiện dữ liệu trùng lặp bất thường');
        }

        // Kiểm tra timestamps bất thường
        console.log('\n=== 7. Kiểm tra timestamps bất thường ===');

        // Kiểm tra thời gian trong tương lai
        const futureRecords = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE created_at > NOW()
        `;

        console.log(`Thời gian trong tương lai: ${futureRecords[0].count} bản ghi`);
        if (futureRecords[0].count > 0) {
            console.log('⚠️ Có bản ghi có thời gian trong tương lai');
            await logToFile(`⚠️ Phát hiện ${futureRecords[0].count} bản ghi có thời gian trong tương lai`);
        }

        // Kiểm tra thời gian quá khứ xa
        const oldRecords = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
            WHERE created_at < NOW() - INTERVAL '1 year'
        `;

        console.log(`Thời gian quá khứ xa (>1 năm): ${oldRecords[0].count} bản ghi`);
        if (oldRecords[0].count > 0) {
            console.log('⚠️ Có bản ghi có thời gian quá khứ xa (>1 năm)');
            await logToFile(`⚠️ Phát hiện ${oldRecords[0].count} bản ghi có thời gian quá khứ xa`);
        }

        // Kiểm tra user_agent bất thường
        console.log('\n=== 8. Kiểm tra user_agent bất thường ===');
        const suspiciousUserAgents = await sql`
            SELECT user_agent, COUNT(*) as count FROM nhat_ky_studio
            WHERE 
                user_agent LIKE '%bot%' OR
                user_agent LIKE '%crawl%' OR
                user_agent LIKE '%spider%' OR
                user_agent LIKE '%scan%'
            GROUP BY user_agent
            ORDER BY count DESC
        `;

        if (suspiciousUserAgents.length > 0) {
            console.log(`⚠️ Phát hiện ${suspiciousUserAgents.length} user_agent có dấu hiệu bất thường:`);
            suspiciousUserAgents.forEach((agent, index) => {
                console.log(`${index + 1}. ${agent.user_agent}: ${agent.count} lần`);
            });
            await logToFile(`⚠️ Phát hiện ${suspiciousUserAgents.length} user_agent bất thường`);
        } else {
            console.log('✅ Không phát hiện user_agent bất thường');
        }

        // Tổng kết
        console.log('\n=== 9. Tổng kết ===');

        // Đếm tổng số bản ghi có vấn đề
        const totalProblems = 
            parseInt(nullUsername[0].count) + 
            parseInt(nullAction[0].count) + 
            parseInt(nullCategory[0].count) + 
            parseInt(invalidDetails[0].count) + 
            parseInt(invalidRelatedIds[0].count) + 
            parseInt(futureRecords[0].count);

        // Đếm tổng số bản ghi
        const totalRecords = await sql`
            SELECT COUNT(*) as count FROM nhat_ky_studio
        `;

        const problemPercentage = (totalProblems / parseInt(totalRecords[0].count)) * 100;

        console.log(`✅ Tổng số bản ghi: ${totalRecords[0].count}`);
        console.log(`⚠️ Tổng số bản ghi có vấn đề: ${totalProblems} (${problemPercentage.toFixed(2)}%)`);

        if (problemPercentage > 5) {
            console.log('⚠️ Tỷ lệ lỗi cao, cần kiểm tra lại hệ thống ghi log');
        } else {
            console.log('✅ Tỷ lệ lỗi trong ngưỡng chấp nhận được');
        }

        await logToFile(`Tổng kết: ${totalProblems}/${totalRecords[0].count} bản ghi có vấn đề (${problemPercentage.toFixed(2)}%)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await logToFile(`❌ Error: ${error.message}`);
    }
}

// Chạy function chính
kiemTraLoiNhatKy().catch(console.error);
