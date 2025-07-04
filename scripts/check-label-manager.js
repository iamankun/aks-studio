// @ts-check
/**
 * Script để kiểm tra Label Manager trong database
 * Chạy: node scripts/check-label-manager.js
 */
import {
    connectToDatabase,
    checkTableExists,
    getTableStructure
} from './utils/db-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

/**
 * Kiểm tra Label Manager trong database
 */
async function checkLabelManager() {
    console.log('🔍 Kiểm tra Label Manager...');
    console.log('='.repeat(50));

    try {
        // Kết nối database
        const sql = await connectToDatabase();

        // Kiểm tra bảng label_manager tồn tại không
        await checkLabelManagerTable();

        // Kiểm tra user trong bảng
        const labelManagers = await findLabelManagers(sql);

        // Kiểm tra quyền
        await checkPermissions(sql);

        // Kiểm tra hoạt động
        await checkRecentActivity(sql);

        // Tổng kết
        console.log('\n=== Tổng Kết ===');
        console.log(`✅ Tổng số Label Manager: ${labelManagers?.length || 0}`);
        console.log('\n✅ Kiểm tra hoàn tất!');
        console.log('Đã ghi log vào thư mục logs/');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await logToFile(`Error: ${error.message}`, 'label-manager-check.log');
    }
}

/**
 * Kiểm tra bảng label_manager tồn tại không
 */
async function checkLabelManagerTable() {
    // Kiểm tra bảng label_manager tồn tại không
    const tableExists = await checkTableExists('label_manager');

    if (!tableExists) {
        console.error('❌ Bảng label_manager không tồn tại trong database!');
        await logToFile('Bảng label_manager không tồn tại', 'label-manager-check.log');
        return false;
    }

    console.log('✅ Bảng label_manager tồn tại');

    // Lấy cấu trúc bảng
    const columns = await getTableStructure('label_manager');

    console.log('\n=== Cấu trúc bảng label_manager ===');
    columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    return true;
}

/**
 * Tìm Label Manager trong database
 */
async function findLabelManagers(sql) {
    // Kiểm tra user trong bảng label_manager
    console.log('\n=== Kiểm tra Label Manager ===');
    const labelManagers = await sql`
        SELECT * FROM public.label_manager
        WHERE username = 'ankunstudio'
    `;

    if (labelManagers.length > 0) {
        console.log('✅ Tìm thấy Label Manager:');
        for (const manager of labelManagers) {
            console.log(`- Username: ${manager.username}`);
            console.log(`  Email: ${manager.email}`);
            console.log(`  Role: ${manager.role}`);
            console.log(`  Created: ${manager.created_at}`);
            console.log('-'.repeat(40));
        }

        await logToFile(`Tìm thấy ${labelManagers.length} Label Manager`, 'label-manager-check.log');
    } else {
        console.log('❌ Không tìm thấy Label Manager nào');
        await logToFile('Không tìm thấy Label Manager', 'label-manager-check.log');
    }

    return labelManagers;
}

/**
 * Kiểm tra quyền của Label Manager
 */
async function checkPermissions(sql) {
    console.log('\n=== Kiểm tra Quyền Label Manager ===');

    try {
        const managerData = await sql`
            SELECT * FROM public.label_manager 
            WHERE username = 'ankunstudio'
        `;

        if (managerData.length === 0) {
            console.log('❌ Không tìm thấy Label Manager để kiểm tra quyền');
            return;
        }

        const manager = managerData[0];
        console.log('Thông tin Label Manager:');
        console.log(`- Username: ${manager.username}`);
        console.log(`- Email: ${manager.email}`);

        // Kiểm tra trường permissions JSON
        await checkPermissionsField(manager);

        // Hiển thị tất cả thuộc tính để kiểm tra
        console.log('\nTất cả thuộc tính của Label Manager:');
        for (const [key, value] of Object.entries(manager)) {
            console.log(`- ${key}: ${JSON.stringify(value)}`);
        }
    } catch (error) {
        console.error(`❌ Lỗi khi kiểm tra quyền: ${error.message}`);
        await logToFile(`❌ Lỗi khi kiểm tra quyền: ${error.message}`, 'label-manager-check.log');
    }
}

/**
 * Kiểm tra trường permissions JSON
 */
async function checkPermissionsField(manager) {
    if (!manager.permissions) {
        console.log('⚠️ Không tìm thấy trường permissions trong dữ liệu');
        // Kiểm tra các trường khác có thể chứa thông tin quyền
        searchPotentialPermissionFields(manager);
        return;
    }

    console.log(`- Permissions raw: ${JSON.stringify(manager.permissions)}`);

    // Phân tích JSON permissions
    try {
        const permObj = typeof manager.permissions === 'string'
            ? JSON.parse(manager.permissions)
            : manager.permissions;

        console.log(`- Permissions parsed: ${JSON.stringify(permObj)}`);

        if (permObj.role === 'admin' && permObj.access === 'all') {
            console.log('✅ Tài khoản có quyền admin hợp lệ {"role": "admin", "access": "all"}');
            await logToFile('✅ Tài khoản có quyền admin hợp lệ', 'label-manager-check.log');
        } else {
            console.log(`⚠️ Quyền không khớp với {"role": "admin", "access": "all"}`);
            await logToFile(`⚠️ Quyền không khớp với {"role": "admin", "access": "all"}`, 'label-manager-check.log');
        }
    } catch (e) {
        console.error(`❌ Lỗi khi phân tích permissions: ${e.message}`);
        await logToFile(`❌ Lỗi khi phân tích permissions: ${e.message}`, 'label-manager-check.log');
    }
}

/**
 * Tìm kiếm các trường có thể chứa thông tin quyền
 */
function searchPotentialPermissionFields(manager) {
    for (const [key, value] of Object.entries(manager)) {
        if (typeof value === 'object' || (typeof value === 'string' && value.includes('admin'))) {
            console.log(`- Có thể chứa quyền trong trường "${key}": ${JSON.stringify(value)}`);
        }
    }
}

/**
 * Kiểm tra hoạt động gần đây
 */
async function checkRecentActivity(sql) {
    console.log('\n=== Hoạt Động Gần Đây ===');
    try {
        const recentActivity = await sql`
            SELECT * FROM public.activity_log 
            WHERE username = 'ankunstudio'
            ORDER BY created_at DESC
            LIMIT 5
        `;

        if (recentActivity && recentActivity.length > 0) {
            console.log('Hoạt động gần đây:');
            recentActivity.forEach(activity => {
                console.log(`- ${activity.username}: ${activity.action} (${activity.created_at})`);
            });
        } else {
            console.log('⚠️ Không tìm thấy hoạt động gần đây.');
        }
    } catch (activityError) {
        console.log(`⚠️ Không thể truy vấn hoạt động: ${activityError.message}`);
        await logToFile(`Không thể truy vấn hoạt động: ${activityError.message}`, 'label-manager-check.log');
    }
}

// Export functions - ES Module compatible
export { checkLabelManager };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    checkLabelManager().catch(console.error);
}
