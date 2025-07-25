// @ts-check
/**
 * Tiện ích ghi log vào bảng nhat_ky_studio
 * Dùng để ghi lại các hoạt động của người dùng
 */

import { neon } from "@neondatabase/serverless";
import fs from 'fs/promises';
import path from 'path';

/**
 * Ghi log vào file
 * @param {string} message - Thông báo cần ghi
 */
async function logToFile(message) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, "nhat-ky-studio-helper.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

/**
 * Kết nối đến database
 * @returns {Promise<any>} - SQL client đã kết nối
 */
async function connectToDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL không tìm thấy trong .env.local');
    }
    return neon(DATABASE_URL);
}

/**
 * Thêm log vào bảng nhat_ky_studio
 * @param {Object} logData - Dữ liệu log
 * @param {string} logData.username - Tên người dùng
 * @param {string} [logData.user_id] - ID người dùng (optional)
 * @param {string} logData.action - Hành động người dùng thực hiện
 * @param {string} [logData.category] - Danh mục hành động (optional)
 * @param {string} [logData.ip_address] - Địa chỉ IP (optional)
 * @param {string} [logData.user_agent] - User agent (optional)
 * @param {string} [logData.status] - Trạng thái (optional)
 * @param {string} [logData.component_name] - Tên component (optional)
 * @param {string} [logData.session_id] - ID phiên (optional)
 * @param {Object} [logData.details] - Chi tiết thêm dạng JSON (optional)
 * @param {Object} [logData.related_ids] - ID liên quan dạng JSON (optional)
 * @returns {Promise<any>} - Kết quả insert
 */
export async function addActivityLog(logData) {
    try {
        const sql = await connectToDatabase();

        // Kiểm tra các trường bắt buộc
        if (!logData.username) throw new Error('Thiếu trường username');
        if (!logData.action) throw new Error('Thiếu trường action');
        if (!logData.category) {
            // Mặc định là 'system' nếu không có category
            logData.category = 'system';
        }

        // Thêm vào database
        const result = await sql`
            INSERT INTO nhat_ky_studio (
                username, 
                user_id, 
                action, 
                category, 
                details, 
                ip_address, 
                user_agent, 
                status, 
                component_name, 
                session_id, 
                related_ids
            ) VALUES (
                ${logData.username}, 
                ${logData.user_id || null}, 
                ${logData.action}, 
                ${logData.category}, 
                ${logData.details ? JSON.stringify(logData.details) : null}, 
                ${logData.ip_address || null}, 
                ${logData.user_agent || null}, 
                ${logData.status || null}, 
                ${logData.component_name || null}, 
                ${logData.session_id || null}, 
                ${logData.related_ids ? JSON.stringify(logData.related_ids) : null}
            ) RETURNING id
        `;

        await logToFile(`Đã thêm log: ${logData.username} - ${logData.action}`);
        return result;
    } catch (error) {
        await logToFile(`❌ Lỗi khi thêm log: ${error.message}`);
        console.error('❌ Lỗi khi thêm log:', error.message);
        throw error;
    }
}

/**
 * Lấy logs gần đây của một người dùng
 * @param {string} username - Tên người dùng
 * @param {number} [limit=10] - Số lượng logs muốn lấy
 * @param {string} [category] - Lọc theo danh mục (optional)
 * @returns {Promise<any[]>} - Danh sách logs
 */
export async function getRecentLogs(username, limit = 10, category = null) {
    try {
        const sql = await connectToDatabase();

        // Nếu có category thì lọc thêm
        if (category) {
            const logs = await sql`
                SELECT * FROM nhat_ky_studio
                WHERE username = ${username}
                AND category = ${category}
                ORDER BY created_at DESC
                LIMIT ${limit}
            `;
            return logs;
        }

        const logs = await sql`
            SELECT * FROM nhat_ky_studio
            WHERE username = ${username}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;

        await logToFile(`Đã lấy ${logs.length} logs của ${username}`);
        return logs;
    } catch (error) {
        await logToFile(`❌ Lỗi khi lấy logs: ${error.message}`);
        console.error('❌ Lỗi khi lấy logs:', error.message);
        throw error;
    }
}

/**
 * Lấy tất cả logs của một loại hành động
 * @param {string} action - Loại hành động
 * @param {number} [limit=50] - Số lượng logs muốn lấy
 * @returns {Promise<any[]>} - Danh sách logs
 */
export async function getLogsByAction(action, limit = 50) {
    try {
        const sql = await connectToDatabase();

        const logs = await sql`
            SELECT * FROM nhat_ky_studio
            WHERE action = ${action}
            ORDER BY created_at DESC
            LIMIT ${limit}
        `;

        await logToFile(`Đã lấy ${logs.length} logs của hành động ${action}`);
        return logs;
    } catch (error) {
        await logToFile(`❌ Lỗi khi lấy logs theo hành động: ${error.message}`);
        console.error('❌ Lỗi khi lấy logs theo hành động:', error.message);
        throw error;
    }
}

/**
 * Lấy thống kê logs cho dashboard
 * @param {number} [days=7] - Số ngày muốn lấy thống kê
 * @returns {Promise<Object>} - Thống kê logs
 */
export async function getDashboardStats(days = 7) {
    try {
        const sql = await connectToDatabase();

        // Lấy thống kê theo ngày
        const dailyStats = await sql`
            SELECT 
                DATE(created_at) as date, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `;

        // Lấy thống kê theo category
        const categoryStats = await sql`
            SELECT 
                category, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY category
            ORDER BY count DESC
        `;

        // Lấy thống kê theo action
        const actionStats = await sql`
            SELECT 
                action, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        `;

        // Lấy thống kê theo user
        const userStats = await sql`
            SELECT 
                username, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY username
            ORDER BY count DESC
            LIMIT 10
        `;

        await logToFile(`Đã lấy thống kê logs cho ${days} ngày`);

        return {
            dailyStats,
            categoryStats,
            actionStats,
            userStats
        };
    } catch (error) {
        await logToFile(`❌ Lỗi khi lấy thống kê logs: ${error.message}`);
        console.error('❌ Lỗi khi lấy thống kê logs:', error.message);
        throw error;
    }
}

// Test thêm log
if (process.argv[2] === 'test') {
    (async () => {
        try {
            console.log('🔍 Test thêm log vào nhat_ky_studio');

            const result = await addActivityLog({
                username: 'test_user',
                action: 'test_log',
                category: 'test',
                status: 'success',
                component_name: 'TestComponent',
                details: { test: true, time: new Date().toISOString() }
            });

            console.log('✅ Đã thêm log thành công:', result);

            // Lấy logs của test_user
            const logs = await getRecentLogs('test_user', 5);
            console.log('✅ Logs của test_user:', logs);

        } catch (error) {
            console.error('❌ Test thất bại:', error.message);
        }
    })();
}
