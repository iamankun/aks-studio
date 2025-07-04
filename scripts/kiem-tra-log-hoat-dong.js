// @ts-check
/**
 * Script kiểm tra và quản lý nhật ký hoạt động trong hệ thống
 * Chạy: node scripts/check-activity-logs.js
 */
import {
    connectToDatabase,
    checkTableExists,
    getTableStructure,
    countRecords
} from './utils/db-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

// Kiểm tra bảng activity_log
async function checkActivityLogs() {
    console.log('🔍 Kiểm tra nhật ký hoạt động (activity_log)...');
    console.log('='.repeat(50));

    try {
        // Kiểm tra kết nối database
        const sql = await connectToDatabase();

        // Kiểm tra bảng activity_log tồn tại không
        const tableExists = await checkTableExists('activity_log');

        if (!tableExists) {
            console.error('❌ Bảng activity_log không tồn tại trong database!');
            await logToFile('Bảng activity_log không tồn tại!', 'activity-log-check.log');
            return;
        }

        console.log('✅ Bảng activity_log tồn tại');

        // Lấy cấu trúc bảng
        const columns = await getTableStructure('activity_log');

        console.log('\n=== Cấu trúc bảng activity_log ===');
        columns.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Đếm số lượng log
        const logCount = await countRecords('activity_log');
        console.log(`\n✅ Tổng số log: ${logCount}`);

        // Lấy danh sách log gần đây
        const recentLogs = await sql`
            SELECT * FROM activity_log
            ORDER BY created_at DESC
            LIMIT 10
        `;

        console.log('\n=== Log gần đây ===');
        if (recentLogs.length > 0) {
            recentLogs.forEach((log, index) => {
                console.log(`\n${index + 1}. ID: ${log.id}`);
                console.log(`   User: ${log.username || 'N/A'}`);
                console.log(`   Action: ${log.action || 'N/A'}`);
                console.log(`   Details: ${log.details || 'N/A'}`);
                console.log(`   Time: ${log.created_at || 'N/A'}`);
            });
        } else {
            console.log('❌ Không có dữ liệu trong bảng activity_log');
        }

        // Thống kê theo user
        console.log('\n=== Thống kê theo user ===');
        const userStats = await sql`
            SELECT username, COUNT(*) as count 
            FROM activity_log 
            GROUP BY username 
            ORDER BY count DESC
            LIMIT 5
        `;

        if (userStats.length > 0) {
            userStats.forEach(stat => {
                console.log(`- ${stat.username}: ${stat.count} logs`);
            });
        }

        // Thống kê theo loại hành động
        console.log('\n=== Thống kê theo loại hành động ===');
        const actionStats = await sql`
            SELECT action, COUNT(*) as count 
            FROM activity_log 
            GROUP BY action 
            ORDER BY count DESC
            LIMIT 10
        `;

        if (actionStats.length > 0) {
            actionStats.forEach(stat => {
                console.log(`- ${stat.action}: ${stat.count} logs`);
            });
        }

        console.log('\n✅ Kiểm tra hoàn tất!');
        console.log('Đã ghi log vào thư mục logs/');

        // Ghi log
        await logToFile(`Kiểm tra activity_log: ${logCount} records found`, 'activity-log-check.log');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await logToFile(`Error: ${error.message}`, 'activity-log-check.log');
    }
}

// Export functions - ES Module compatible
export { checkActivityLogs };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    checkActivityLogs().catch(console.error);
}
