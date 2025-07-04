// @ts-check
/**
 * Script kiểm tra quyền admin trong database
 * Kiểm tra user với permission JSON {"role": "admin", "access": "all"}
 * Chạy: node scripts/check-admin-permissions.js
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
        const logFile = path.join(logDir, "admin-check.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

async function checkAdminPermissions() {
    console.log('🔍 Kiểm tra quyền admin trong database');
    console.log('='.repeat(60));
    await logToFile('Bắt đầu kiểm tra quyền admin');

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

        // Kiểm tra users với quyền admin
        console.log('\n=== 2. Kiểm tra users với quyền admin ===');
        await logToFile('Đang kiểm tra users với quyền admin');

        try {
            // Query users với quyền admin (cả dạng JSON và dạng string)
            const adminUsers = await sql`
                SELECT id, username, email, role, permissions, created_at, last_login
                FROM users
                WHERE 
                    (permissions::text LIKE '%"role":"admin"%' AND permissions::text LIKE '%"access":"all"%')
                    OR role = 'admin'
                    OR role = 'Label Manager'
            `;

            if (adminUsers.length === 0) {
                const warnMsg = 'Không tìm thấy user nào có quyền admin';
                console.warn('⚠️ ' + warnMsg);
                await logToFile('⚠️ ' + warnMsg);
            } else {
                console.log(`✅ Tìm thấy ${adminUsers.length} user với quyền admin:`);
                await logToFile(`✅ Tìm thấy ${adminUsers.length} user với quyền admin`);

                for (const user of adminUsers) {
                    console.log(`- ${user.username} (${user.email})`);
                    console.log(`  - Role: ${user.role}`);
                    console.log(`  - Permissions: ${JSON.stringify(user.permissions)}`);
                    console.log(`  - Created: ${user.created_at}`);
                    console.log(`  - Last login: ${user.last_login || 'N/A'}`);

                    await logToFile(`User admin: ${user.username} (${user.email}), Role: ${user.role}`);
                }
            }

            // Kiểm tra Label Managers
            const labelManagers = await sql`
                SELECT id, username, email, role, permissions, created_at, last_login
                FROM users
                WHERE role = 'Label Manager'
            `;

            if (labelManagers.length > 0) {
                console.log(`\n✅ Tìm thấy ${labelManagers.length} Label Manager:`);
                await logToFile(`Tìm thấy ${labelManagers.length} Label Manager`);

                for (const manager of labelManagers) {
                    console.log(`- ${manager.username} (${manager.email})`);
                    console.log(`  - Role: ${manager.role}`);
                    console.log(`  - Permissions: ${JSON.stringify(manager.permissions)}`);

                    await logToFile(`Label Manager: ${manager.username} (${manager.email})`);
                }
            }

        } catch (dbError) {
            // Nếu cấu trúc bảng users khác
            console.error('❌ Error khi truy vấn users:', dbError.message);
            await logToFile(`❌ Error khi truy vấn users: ${dbError.message}`);

            // Thử truy vấn khác với cấu trúc database có thể khác
            console.log('\n=== Thử với cấu trúc database khác ===');

            try {
                // Liệt kê các bảng để hiểu cấu trúc
                const tables = await sql`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                `;

                console.log('Các bảng trong database:');
                for (const table of tables) {
                    console.log(`- ${table.table_name}`);
                }

                // Kiểm tra cấu trúc bảng users
                if (tables.some(t => t.table_name === 'users')) {
                    const userColumns = await sql`
                        SELECT column_name, data_type
                        FROM information_schema.columns
                        WHERE table_name = 'users'
                    `;

                    console.log('\nCấu trúc bảng users:');
                    for (const col of userColumns) {
                        console.log(`- ${col.column_name} (${col.data_type})`);
                    }

                    // Lấy sample data
                    const sampleUsers = await sql`SELECT * FROM users LIMIT 3`;
                    console.log('\nMẫu dữ liệu users:');
                    console.log(sampleUsers);
                }
            } catch (schemaError) {
                console.error('❌ Error khi kiểm tra schema:', schemaError.message);
                await logToFile(`❌ Error khi kiểm tra schema: ${schemaError.message}`);
            }
        }

        console.log('\n=== 3. Tổng kết ===');
        console.log('✅ Kiểm tra quyền admin hoàn tất');
        await logToFile('✅ Kiểm tra quyền admin hoàn tất');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await logToFile(`❌ Error: ${error.message}`);
    }
}

// Chạy function chính
checkAdminPermissions().catch(console.error);
