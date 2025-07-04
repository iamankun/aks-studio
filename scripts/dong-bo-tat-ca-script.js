/**
 * Script để đồng bộ hóa tất cả các script với hệ thống database và tài khoản thực tế
 * Chạy: node scripts/sync-all-scripts.js
 */

import { connectToDatabase } from './utils/db-helper.js';
import { logToFile } from './utils/env-loader.js';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Kiểm tra và đồng bộ hóa tất cả các script
 */
async function syncAllScripts() {
    console.log(chalk.blue('🔄 ĐỒNG BỘ HÓA TẤT CẢ SCRIPTS'));
    console.log('='.repeat(60));

    try {
        // 1. Kiểm tra biến môi trường
        await checkEnvironmentVariables();

        // 2. Kiểm tra kết nối database
        await testDatabaseConnection();

        // 3. Kiểm tra tài khoản thực tế
        await checkRealAccounts();

        // 4. Kiểm tra cấu trúc database
        await checkDatabaseStructure();

        // 5. Xác minh quyền truy cập
        await verifyPermissions();

        // 6. Tổng kết
        await showSummary();

        console.log(chalk.green('\n✅ Đồng bộ hóa hoàn tất!'));
        await logToFile('Scripts synchronization completed successfully', 'sync-scripts.log');

    } catch (error) {
        console.error(chalk.red('❌ Lỗi khi đồng bộ:'), error.message);
        await logToFile(`Sync error: ${error.message}`, 'sync-scripts.log');
    }
}

/**
 * Kiểm tra biến môi trường
 */
async function checkEnvironmentVariables() {
    console.log(chalk.yellow('\n=== 1. Kiểm tra Biến Môi Trường ==='));
    
    const requiredVars = [
        'DATABASE_URL',
        'ADMIN_USERNAME',
        'ADMIN_PASSWORD'
    ];

    for (const varName of requiredVars) {
        const value = process.env[varName];
        if (value) {
            console.log(chalk.green(`✅ ${varName}: ${varName === 'DATABASE_URL' ? '***' : value}`));
        } else {
            console.log(chalk.red(`❌ ${varName}: Không tồn tại`));
        }
    }

    // Kiểm tra tài khoản admin
    const adminUsername = process.env.ADMIN_USERNAME;
    if (adminUsername === 'ankunstudio') {
        console.log(chalk.green('✅ Tài khoản admin đã được cấu hình đúng: ankunstudio'));
    } else {
        console.log(chalk.yellow(`⚠️ Tài khoản admin hiện tại: ${adminUsername}, khuyên dùng: ankunstudio`));
    }
}

/**
 * Kiểm tra kết nối database
 */
async function testDatabaseConnection() {
    console.log(chalk.yellow('\n=== 2. Kiểm tra Kết Nối Database ==='));
    
    try {
        const sql = await connectToDatabase();
        const result = await sql`SELECT NOW() as current_time`;
        console.log(chalk.green('✅ Kết nối database thành công'));
        console.log(chalk.gray(`   Server time: ${result[0].current_time}`));
    } catch (error) {
        console.log(chalk.red('❌ Lỗi kết nối database:'), error.message);
        throw error;
    }
}

/**
 * Kiểm tra tài khoản thực tế
 */
async function checkRealAccounts() {
    console.log(chalk.yellow('\n=== 3. Kiểm tra Tài Khoản Thực Tế ==='));
    
    const sql = await connectToDatabase();
    
    // Kiểm tra tài khoản ankunstudio
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
        console.log(chalk.red('❌ Tài khoản ankunstudio chưa tồn tại trong database'));
    }

    // Kiểm tra trong bảng label_manager
    const labelManagers = await sql`
        SELECT id, username, email, role, created_at
        FROM label_manager 
        WHERE username = 'ankunstudio'
    `;

    if (labelManagers.length > 0) {
        console.log(chalk.green('✅ ankunstudio có quyền Label Manager'));
    } else {
        console.log(chalk.yellow('⚠️ ankunstudio chưa có quyền Label Manager'));
    }

    // Kiểm tra trong bảng artist
    const artists = await sql`
        SELECT id, username, email, full_name, created_at
        FROM artist 
        WHERE username = 'ankunstudio'
    `;

    if (artists.length > 0) {
        console.log(chalk.green('✅ ankunstudio có quyền Artist'));
    } else {
        console.log(chalk.yellow('⚠️ ankunstudio chưa có quyền Artist'));
    }
}

/**
 * Kiểm tra cấu trúc database
 */
async function checkDatabaseStructure() {
    console.log(chalk.yellow('\n=== 4. Kiểm tra Cấu Trúc Database ==='));
    
    const sql = await connectToDatabase();
    
    const requiredTables = [
        'users',
        'label_manager',
        'artist',
        'submissions',
        'label_templates',
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
                // Đếm số record trong bảng
                const recordCount = await sql`
                    SELECT COUNT(*) as total FROM ${sql(tableName)}
                `;
                console.log(chalk.green(`✅ ${tableName}: ${recordCount[0].total} records`));
            } else {
                console.log(chalk.red(`❌ ${tableName}: Không tồn tại`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ ${tableName}: Lỗi kiểm tra - ${error.message}`));
        }
    }
}

/**
 * Xác minh quyền truy cập
 */
async function verifyPermissions() {
    console.log(chalk.yellow('\n=== 5. Xác Minh Quyền Truy Cập ==='));
    
    const sql = await connectToDatabase();
    
    // Kiểm tra quyền của ankunstudio
    const permissions = await sql`
        SELECT 
            u.username,
            u.role as user_role,
            lm.role as label_manager_role,
            a.username as artist_username
        FROM users u
        LEFT JOIN label_manager lm ON u.username = lm.username
        LEFT JOIN artist a ON u.username = a.username
        WHERE u.username = 'ankunstudio'
    `;

    if (permissions.length > 0) {
        const perm = permissions[0];
        console.log(chalk.green('✅ Quyền truy cập ankunstudio:'));
        console.log(`   User Role: ${perm.user_role}`);
        console.log(`   Label Manager Role: ${perm.label_manager_role || 'Không có'}`);
        console.log(`   Artist Access: ${perm.artist_username ? 'Có' : 'Không có'}`);
    } else {
        console.log(chalk.red('❌ Không tìm thấy quyền truy cập cho ankunstudio'));
    }
}

/**
 * Hiển thị tổng kết
 */
async function showSummary() {
    console.log(chalk.yellow('\n=== 6. Tổng Kết ==='));
    
    const sql = await connectToDatabase();
    
    // Thống kê tổng quan
    const stats = await sql`
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM label_manager) as total_label_managers,
            (SELECT COUNT(*) FROM artist) as total_artists,
            (SELECT COUNT(*) FROM submissions) as total_submissions,
            (SELECT COUNT(*) FROM label_templates) as total_templates,
            (SELECT COUNT(*) FROM label_assignments) as total_assignments
    `;

    const stat = stats[0];
    console.log(chalk.cyan('📊 Thống kê hệ thống:'));
    console.log(`   Users: ${stat.total_users}`);
    console.log(`   Label Managers: ${stat.total_label_managers}`);
    console.log(`   Artists: ${stat.total_artists}`);
    console.log(`   Submissions: ${stat.total_submissions}`);
    console.log(`   Templates: ${stat.total_templates}`);
    console.log(`   Assignments: ${stat.total_assignments}`);

    // Kiểm tra tài khoản đặc biệt
    const specialAccount = await sql`
        SELECT COUNT(*) as count
        FROM users 
        WHERE username = 'ankunstudio'
    `;

    if (specialAccount[0].count > 0) {
        console.log(chalk.green('✅ Tài khoản thực tế ankunstudio đã được cấu hình'));
    } else {
        console.log(chalk.yellow('⚠️ Cần tạo tài khoản thực tế ankunstudio'));
    }
}

// Export functions
export { syncAllScripts };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    syncAllScripts().catch(console.error);
}
