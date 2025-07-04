// @ts-check
/**
 * Script kiểm tra tài khoản Admin
 * Chạy: node scripts/check-admin-auth.js
 */
import {
    connectToDatabase,
    checkTableExists
} from './utils/db-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

/**
 * Kiểm tra tài khoản Admin trong database
 */
async function checkAdminAuth() {
    console.log('🔍 Kiểm tra tài khoản Admin...');
    console.log('='.repeat(50));

    try {
        // 1. Kiểm tra biến môi trường
        console.log('=== 1. Kiểm tra Admin Environment ===');
        const adminUsername = process.env.ADMIN_USERNAME;

        if (!adminUsername) {
            throw new Error('ADMIN_USERNAME không tồn tại trong .env.local');
        }

        await logToFile(`Tìm thấy ADMIN_USERNAME: ${adminUsername}`, 'admin-check.log');
        console.log('✅ Tìm thấy cấu hình Admin trong .env.local');

        // 2. Kết nối database
        console.log('\n=== 2. Kiểm tra trong Database ===');
        const sql = await connectToDatabase();

        // 3. Kiểm tra user trong database
        const result = await sql`
            SELECT id, username, email, role, created_at, last_login
            FROM users 
            WHERE username = ${adminUsername}
            AND role IN ('Admin', 'Label Manager')
        `;

        if (result.length === 0) {
            console.log('❌ Không tìm thấy tài khoản Admin trong database!');
            await logToFile('Lỗi: Không tìm thấy Admin user trong database', 'admin-check.log');
            return;
        }
        
        const admin = result[0];
        console.log('✅ Tìm thấy tài khoản Admin:');
        console.log({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            createdAt: admin.created_at,
            lastLogin: admin.last_login
        });

        await logToFile(`Admin user "${admin.username}" tồn tại với role ${admin.role}`, 'admin-check.log');

        // 4. Kiểm tra permissions
        await checkUserPermissions(sql, admin);

        // 5. Kiểm tra hoạt động gần đây
        await checkRecentActivity(sql, admin);

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra Admin:', error.message);
        await logToFile(`Lỗi: ${error.message}`, 'admin-check.log');
    }
}

/**
 * Kiểm tra quyền của người dùng
 */
async function checkUserPermissions(sql, admin) {
    console.log('\n=== 3. Kiểm tra Permissions ===');
    const permissions = await sql`
        SELECT permission_name 
        FROM user_permissions
        WHERE user_id = ${admin.id}
    `;

    if (permissions.length === 0) {
        console.log('⚠️ Admin chưa có permissions được set');
        await logToFile('Cảnh báo: Admin chưa có permissions', 'admin-check.log');
        return;
    }
    
    console.log('✅ Permissions của Admin:');
    permissions.forEach(p => console.log(`- ${p.permission_name}`));
    await logToFile(`Admin có ${permissions.length} permissions`, 'admin-check.log');
}

/**
 * Kiểm tra hoạt động gần đây của người dùng
 */
async function checkRecentActivity(sql, admin) {
    console.log('\n=== 4. Hoạt động Gần Đây ===');
    const recentActivity = await sql`
        SELECT action_type, created_at
        FROM user_activity_logs
        WHERE user_id = ${admin.id}
        ORDER BY created_at DESC
        LIMIT 5
    `;

    if (recentActivity.length === 0) {
        console.log('ℹ️ Chưa có log hoạt động nào');
        return;
    }
    
    console.log('✅ Hoạt động gần đây của Admin:');
    recentActivity.forEach(activity => {
        console.log(`- ${activity.action_type} (${activity.created_at})`);
    });
}

// Export functions - ES Module compatible
export { checkAdminAuth, checkUserPermissions, checkRecentActivity };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    checkAdminAuth().catch(console.error);
}
