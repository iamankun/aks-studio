/**
 * Công cụ kiểm tra thông tin và quyền của Label Manager trong database
 * 
 * Script này thực hiện:
 * 1. Kết nối đến database
 * 2. Kiểm tra bảng label_manager
 * 3. Kiểm tra quyền của label manager
 * 4. Hiển thị thông tin chi tiết
 * 5. Kiểm tra hoạt động gần đây từ bảng nhat_ky_studio (activity_log)
 */

import dotenv from 'dotenv';
import pg from 'pg';
import chalk from 'chalk';
const { Pool } = pg;

// Khởi tạo môi trường
dotenv.config({ path: '.env.local' });

// Các biến môi trường
const DATABASE_URL = process.env.DATABASE_URL;

console.log(chalk.blue('🔍 Kiểm tra Label Manager...'));
console.log('='.repeat(50));

async function main() {
    if (!DATABASE_URL) {
        console.error(chalk.red('❌ Không tìm thấy DATABASE_URL trong file .env'));
        process.exit(1);
    }

    console.log('Đang kết nối database...');

    const pool = new Pool({
        connectionString: DATABASE_URL,
    });

    try {
        // Kiểm tra Label Manager
        console.log(chalk.yellow('=== Kiểm tra Label Manager ==='));
        const labelManagerResult = await pool.query('SELECT * FROM label_manager LIMIT 1');

        if (labelManagerResult.rows.length === 0) {
            console.log(chalk.red('❌ Không tìm thấy Label Manager nào trong database'));
            return;
        }

        const labelManager = labelManagerResult.rows[0];
        console.log(chalk.green('✅ Tìm thấy Label Manager:'));
        console.log(`- Username: ${labelManager.username}`);
        console.log(`  Email: ${labelManager.email}`);
        console.log(`  Role: ${labelManager.role}`);
        console.log(`  Created: ${new Date(labelManager.created_at)}`);
        console.log('-'.repeat(40));

        // Kiểm tra quyền
        console.log(chalk.yellow('=== Kiểm tra Quyền Label Manager ==='));
        console.log('Thông tin Label Manager:');
        console.log(`- Username: ${labelManager.username}`);
        console.log(`- Email: ${labelManager.email}`);

        // Phân tích quyền từ trường permissions
        let permissions = labelManager.permissions;
        let permissionsRaw = permissions;
        let permissionsParsed = permissions;

        if (typeof permissions === 'string') {
            try {
                permissionsParsed = JSON.parse(permissions);
            } catch (error) {
                console.log(chalk.yellow(`⚠️ Cảnh báo: Không thể parse JSON permissions: ${error.message}`));
                // Nếu không phải JSON, giữ nguyên giá trị
            }
        }

        console.log(`- Permissions raw: ${JSON.stringify(permissionsRaw)}`);
        console.log(`- Permissions parsed: ${JSON.stringify(permissionsParsed)}`);

        // Kiểm tra quyền admin
        const hasAdminRole =
            (permissionsParsed && permissionsParsed.role === 'admin') ||
            (labelManager.role === 'admin');

        if (hasAdminRole) {
            console.log(chalk.green(`✅ Tài khoản có quyền admin hợp lệ ${JSON.stringify(permissionsParsed)}`));
        } else {
            console.log(chalk.red(`❌ Tài khoản không có quyền admin: ${JSON.stringify(permissionsParsed)}`));
        }

        // Hiển thị tất cả thuộc tính
        console.log('Tất cả thuộc tính của Label Manager:');
        Object.entries(labelManager).forEach(([key, value]) => {
            console.log(`- ${key}: ${JSON.stringify(value)}`);
        });

        // Kiểm tra hoạt động gần đây
        console.log(chalk.yellow('=== Hoạt Động Gần Đây ==='));
        try {
            const recentActivities = await pool.query(
                'SELECT * FROM nhat_ky_studio WHERE username = $1 ORDER BY created_at DESC LIMIT 5',
                [labelManager.username]
            );

            if (recentActivities.rows.length > 0) {
                console.log(chalk.green(`✅ Tìm thấy ${recentActivities.rows.length} hoạt động gần đây:`));
                recentActivities.rows.forEach((activity, index) => {
                    console.log(`${index + 1}. ${activity.action} - ${activity.description} (${new Date(activity.created_at).toLocaleString()})`);
                });
            } else {
                console.log(chalk.yellow('⚠️ Không tìm thấy hoạt động gần đây'));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Lỗi: ${error.message}`));
        }

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi truy vấn database: ${error.message}`));
    } finally {
        await pool.end();
    }
}

main().catch(error => {
    console.error(chalk.red(`❌ Lỗi không mong muốn: ${error.message}`));
    process.exit(1);
});
