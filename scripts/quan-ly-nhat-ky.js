// @ts-check
/**
 * Script để quản lý log hoạt động (xóa log cũ, backup log)
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
        const logFile = path.join(logDir, "quan-ly-nhat-ky.log");
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

/**
 * Xuất log ra file CSV
 * @param {string} outputFileName - Tên file đầu ra
 * @param {Object} options - Các tùy chọn filter
 * @returns {Promise<string>} - Đường dẫn file CSV
 */
async function exportLogsToCSV(outputFileName, options = {}) {
    const sql = await connectToDatabase();

    // Build the base query
    let query = sql`
        SELECT *
        FROM nhat_ky_studio
        WHERE 1=1
    `;

    // Add conditions
    if (options.startDate) {
        query = sql`${query} AND created_at >= ${options.startDate}`;
    }

    if (options.endDate) {
        query = sql`${query} AND created_at <= ${options.endDate}`;
    }

    if (options.action) {
        query = sql`${query} AND action = ${options.action}`;
    }

    if (options.username) {
        query = sql`${query} AND username = ${options.username}`;
    }

    if (options.category) {
        query = sql`${query} AND category = ${options.category}`;
    }

    // Add ORDER BY and LIMIT
    query = sql`
        ${query}
        ORDER BY created_at DESC
        LIMIT ${options.limit || 1000}
    `;

    // Execute the query
    const logs = await query;

    // Tạo nội dung CSV
    const header = [
        'ID', 'User ID', 'Username', 'Action', 'Category',
        'IP Address', 'User Agent', 'Status', 'Component Name',
        'Session ID', 'Related IDs', 'Details', 'Created At'
    ].join(',');

    const rows = logs.map(log => {
        // Escape CSV fields properly
        const escapeCSV = (field) => {
            if (field === null || field === undefined) return '';

            const str = typeof field === 'object'
                ? JSON.stringify(field).replace(/"/g, '""')
                : String(field).replace(/"/g, '""');

            return `"${str}"`;
        };

        return [
            escapeCSV(log.id),
            escapeCSV(log.user_id),
            escapeCSV(log.username),
            escapeCSV(log.action),
            escapeCSV(log.category),
            escapeCSV(log.ip_address),
            escapeCSV(log.user_agent),
            escapeCSV(log.status),
            escapeCSV(log.component_name),
            escapeCSV(log.session_id),
            escapeCSV(log.related_ids),
            escapeCSV(log.details),
            escapeCSV(log.created_at)
        ].join(',');
    });

    const csvContent = [header, ...rows].join('\n');

    // Tạo thư mục backup nếu chưa có
    const backupDir = path.join(process.cwd(), "logs", "activity-logs-backup");
    await fs.mkdir(backupDir, { recursive: true });

    // Tạo tên file nếu chưa được cung cấp
    if (!outputFileName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        outputFileName = `nhat-ky-studio-${timestamp}.csv`;
    } else if (!outputFileName.endsWith('.csv')) {
        outputFileName += '.csv';
    }

    const filePath = path.join(backupDir, outputFileName);
    await fs.writeFile(filePath, csvContent);

    return filePath;
}

/**
 * Xóa log cũ hơn một số ngày
 * @param {number} days - Số ngày
 * @returns {Promise<number>} - Số log đã xóa
 */
async function deleteOldLogs(days = 90) {
    const sql = await connectToDatabase();

    // Tính toán ngày cắt
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Backup logs trước khi xóa
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `logs-before-deletion-${timestamp}.csv`;

    await exportLogsToCSV(backupFileName, {
        endDate: cutoffDate.toISOString(),
        limit: 100000 // Giới hạn cao để lấy tất cả
    });

    await logToFile(`Đã backup log trước khi xóa vào file ${backupFileName}`);

    // Xóa log cũ
    const result = await sql`
        DELETE FROM nhat_ky_studio
        WHERE created_at < ${cutoffDate.toISOString()}
        RETURNING id
    `;

    await logToFile(`Đã xóa ${result.length} log cũ hơn ${days} ngày`);

    return result.length;
}

/**
 * Thống kê số lượng log theo các tiêu chí
 * @returns {Promise<Object>} - Thống kê
 */
async function getLogStats() {
    const sql = await connectToDatabase();

    // Tổng số log
    const totalResult = await sql`SELECT COUNT(*) as count FROM nhat_ky_studio`;
    const total = parseInt(totalResult[0]?.count || '0');

    // Theo action
    const byActionResult = await sql`
        SELECT action, COUNT(*) as count 
        FROM nhat_ky_studio 
        GROUP BY action 
        ORDER BY count DESC
    `;

    // Theo ngày
    const byDateResult = await sql`
        SELECT 
            DATE_TRUNC('day', created_at) as day,
            COUNT(*) as count
        FROM nhat_ky_studio
        GROUP BY day
        ORDER BY day DESC
        LIMIT 7
    `;

    // Theo status
    const byStatusResult = await sql`
        SELECT status, COUNT(*) as count
        FROM nhat_ky_studio
        GROUP BY status
        ORDER BY count DESC
    `;

    // Theo category
    const byCategoryResult = await sql`
        SELECT category, COUNT(*) as count
        FROM nhat_ky_studio
        GROUP BY category
        ORDER BY count DESC
    `;

    // Theo component
    const byComponentResult = await sql`
        SELECT component_name, COUNT(*) as count
        FROM nhat_ky_studio
        WHERE component_name IS NOT NULL
        GROUP BY component_name
        ORDER BY count DESC
        LIMIT 10
    `;

    return {
        total,
        byAction: byActionResult,
        byDate: byDateResult,
        byStatus: byStatusResult,
        byCategory: byCategoryResult,
        byComponent: byComponentResult
    };
}

async function main() {
    try {
        const args = process.argv.slice(2);
        const command = args[0]?.toLowerCase() || 'help';

        switch (command) {
            case 'help': {
                console.log('=== QUẢN LÝ NHẬT KÝ HOẠT ĐỘNG ===');
                console.log('Các lệnh:');
                console.log('  export [filename] [--limit=1000] - Xuất log ra file CSV');
                console.log('  clean [days=90] - Xóa log cũ hơn số ngày');
                console.log('  stats - Hiển thị thống kê log');
                console.log('  backup - Backup toàn bộ log hiện tại');
                break;
            }

            case 'stats': {
                console.log('=== THỐNG KÊ NHẬT KÝ HOẠT ĐỘNG ===');

                const stats = await getLogStats();

                console.log(`\nTổng số log: ${stats.total}`);

                console.log('\nTheo loại action:');
                for (const item of stats.byAction) {
                    console.log(`- ${item.action}: ${item.count} log`);
                }

                console.log('\nTheo danh mục:');
                for (const item of stats.byCategory) {
                    console.log(`- ${item.category || 'N/A'}: ${item.count} log`);
                }

                console.log('\nTheo component:');
                for (const item of stats.byComponent) {
                    console.log(`- ${item.component_name || 'N/A'}: ${item.count} log`);
                }

                console.log('\nTheo ngày (7 ngày gần đây):');
                for (const item of stats.byDate) {
                    const date = new Date(item.day).toLocaleDateString();
                    console.log(`- ${date}: ${item.count} log`);
                }

                console.log('\nTheo trạng thái:');
                for (const item of stats.byStatus) {
                    console.log(`- ${item.status || 'N/A'}: ${item.count} log`);
                }

                break;
            }

            case 'export': {
                // Parse tham số
                let filename = args[1];
                let limit = 1000;

                // Parse tham số dạng --key=value
                for (const arg of args) {
                    if (arg.startsWith('--limit=')) {
                        limit = parseInt(arg.substring(8), 10) || 1000;
                    }
                }

                console.log(`=== XUẤT NHẬT KÝ (tối đa ${limit}) ===`);

                const csvPath = await exportLogsToCSV(filename, { limit });

                console.log(`\nĐã xuất ${limit} log ra file:`);
                console.log(csvPath);

                break;
            }

            case 'clean': {
                // Parse tham số
                const days = parseInt(args[1], 10) || 90;

                // Xác nhận trước khi xóa
                console.log(`=== XÓA NHẬT KÝ CŨ (> ${days} ngày) ===`);
                console.log('\nCảnh báo: Hành động này không thể hoàn tác!');
                console.log('Hệ thống sẽ backup log trước khi xóa.');
                console.log('Log cũ hơn ' + days + ' ngày sẽ bị xóa.');

                // Dừng 3 giây để người dùng có thể hủy
                console.log('\nĐang tiến hành xóa trong 3 giây...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Xóa log cũ
                const deletedCount = await deleteOldLogs(days);
                console.log(`\nĐã xóa ${deletedCount} log cũ.`);
                console.log('Backup log đã được lưu trong thư mục logs/activity-logs-backup');

                break;
            }

            case 'backup': {
                console.log('=== BACKUP TOÀN BỘ NHẬT KÝ ===');

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFileName = `full-backup-${timestamp}.csv`;

                const csvPath = await exportLogsToCSV(backupFileName, {
                    limit: 100000 // Giới hạn cao để lấy tất cả
                });

                console.log(`\nĐã backup toàn bộ log ra file:`);
                console.log(csvPath);

                break;
            }

            default:
                console.log(`Lệnh không hợp lệ: ${command}`);
                console.log('Sử dụng "node quan-ly-nhat-ky.js help" để xem trợ giúp.');
        }
    } catch (error) {
        console.error('Lỗi:', error.message);
        await logToFile(`Lỗi: ${error.message}`);
    }
}

// Chạy chương trình
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export {
    exportLogsToCSV,
    deleteOldLogs,
    getLogStats
};
