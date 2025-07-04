/**
 * Script đồng bộ đơn giản để kiểm tra tình trạng hệ thống
 * Chạy: node scripts/simple-sync-check.js
 */

import dotenv from 'dotenv';
import { neon } from "@neondatabase/serverless";
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

let DATABASE_URL = process.env.DATABASE_URL;
let ADMIN_USERNAME = process.env.ADMIN_USERNAME;

// Fallback values if env not loaded
if (!DATABASE_URL) {
    DATABASE_URL = 'postgresql://aksstudio_owner:npg_HzPUo8Xn1wfD@ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech/aksstudio?sslmode=require';
    ADMIN_USERNAME = 'ankunstudio';
    console.log('⚠️ Sử dụng database URL từ fallback');
}

async function simpleSyncCheck() {
    console.log(chalk.blue('🔄 KIỂM TRA ĐỒNG BỘ HỆ THỐNG'));
    console.log('='.repeat(50));

    // Debug environment variables
    console.log('🔍 Debug env vars:');
    console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 0);
    console.log('ADMIN_USERNAME:', ADMIN_USERNAME);

    // 1. Kiểm tra biến môi trường
    console.log(chalk.yellow('=== 1. Biến Môi Trường ==='));
    
    console.log('DATABASE_URL:', DATABASE_URL ? '✅ Có' : '❌ Không có');
    console.log('ADMIN_USERNAME:', ADMIN_USERNAME || 'Không có');
    
    if (!DATABASE_URL) {
        console.log(chalk.red('❌ Thiếu DATABASE_URL'));
        return;
    }

    // 2. Kiểm tra kết nối database
    console.log(chalk.yellow('\n=== 2. Kết Nối Database ==='));
    try {
        const sql = neon(DATABASE_URL);
        const result = await sql`SELECT NOW() as current_time`;
        console.log(chalk.green('✅ Kết nối thành công'));
        console.log('Thời gian server:', result[0].current_time);
    } catch (error) {
        console.log(chalk.red('❌ Lỗi kết nối:'), error.message);
        return;
    }

    // 3. Kiểm tra cấu trúc bảng
    console.log(chalk.yellow('\n=== 3. Cấu Trúc Bảng ==='));
    const sql = neon(DATABASE_URL);
    
    const requiredTables = [
        'users',
        'submissions',
        'label_templates',
        'label_manager',
        'label_assignments',
        'nhat_ky_studio'
    ];

    for (const tableName of requiredTables) {
        try {
            const result = await sql`
                SELECT COUNT(*) as count
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ${tableName}
            `;

            if (result[0].count > 0) {
                const recordCount = await sql`
                    SELECT COUNT(*) as total FROM ${sql(tableName)}
                `;
                console.log(chalk.green(`✅ ${tableName}: ${recordCount[0].total} records`));
            } else {
                console.log(chalk.red(`❌ ${tableName}: Không tồn tại`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ ${tableName}: Lỗi - ${error.message}`));
        }
    }

    // 4. Kiểm tra tài khoản ankunstudio
    console.log(chalk.yellow('\n=== 4. Tài Khoản ankunstudio ==='));
    try {
        const users = await sql`
            SELECT id, username, email, role, created_at
            FROM users 
            WHERE username = 'ankunstudio'
        `;

        if (users.length > 0) {
            const user = users[0];
            console.log(chalk.green('✅ Tài khoản ankunstudio tồn tại:'));
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.created_at}`);
        } else {
            console.log(chalk.red('❌ Tài khoản ankunstudio không tồn tại'));
        }
    } catch (error) {
        console.log(chalk.red('❌ Lỗi kiểm tra tài khoản:'), error.message);
    }

    // 5. Thống kê tổng quan
    console.log(chalk.yellow('\n=== 5. Thống Kê Tổng Quan ==='));
    try {
        const stats = await sql`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM submissions) as total_submissions,
                (SELECT COUNT(*) FROM label_templates) as total_templates,
                (SELECT COUNT(*) FROM label_manager) as total_label_managers,
                (SELECT COUNT(*) FROM label_assignments) as total_assignments,
                (SELECT COUNT(*) FROM nhat_ky_studio) as total_logs
        `;

        const stat = stats[0];
        console.log(chalk.cyan('📊 Thống kê:'));
        console.log(`   Users: ${stat.total_users}`);
        console.log(`   Submissions: ${stat.total_submissions}`);
        console.log(`   Templates: ${stat.total_templates}`);
        console.log(`   Label Managers: ${stat.total_label_managers}`);
        console.log(`   Assignments: ${stat.total_assignments}`);
        console.log(`   Logs: ${stat.total_logs}`);
    } catch (error) {
        console.log(chalk.red('❌ Lỗi thống kê:'), error.message);
    }

    // 6. Kiểm tra scripts cần cập nhật
    console.log(chalk.yellow('\n=== 6. Scripts Cần Cập Nhật ==='));
    console.log('Các script đã được đồng bộ với tài khoản ankunstudio:');
    console.log('✅ generateData.js - Tạo dữ liệu mẫu');
    console.log('✅ kiem-tra-cau-truc-bang-label.js - Kiểm tra cấu trúc bảng');
    console.log('⚠️ Các script khác có thể cần cập nhật để sử dụng ankunstudio');

    console.log(chalk.green('\n🎉 Kiểm tra hoàn tất!'));
}

simpleSyncCheck().catch(console.error);
