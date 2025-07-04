// @ts-check
/**
 * Tiện ích ghi log vào bảng nhat_ky_studio
 * Dùng để ghi lại các hoạt động của người dùng
 */

import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

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
 * @param {string} logData.email - Email người dùng
 * @param {number} [logData.user_id] - ID người dùng (optional)
 * @param {string} logData.action - Hành động người dùng thực hiện
 * @param {string} [logData.description] - Mô tả chi tiết (optional)
 * @param {string} [logData.ip_address] - Địa chỉ IP (optional)
 * @param {string} [logData.user_agent] - User agent (optional)
 * @param {string} [logData.entity_type] - Loại đối tượng tác động (optional)
 * @param {number} [logData.entity_id] - ID đối tượng tác động (optional)
 * @param {string} [logData.status] - Trạng thái (optional)
 * @param {string} [logData.result] - Kết quả (optional)
 * @param {Object} [logData.details] - Chi tiết thêm dạng JSON (optional)
 * @returns {Promise<any>} - Kết quả insert
 */
export async function addActivityLog(logData) {
    try {
        const sql = await connectToDatabase();

        // Kiểm tra các trường bắt buộc
        if (!logData.username) throw new Error('Thiếu trường username');
        if (!logData.action) throw new Error('Thiếu trường action');

        // Thêm vào database
        const result = await sql`
            INSERT INTO nhat_ky_studio (
                username, 
                email, 
                user_id, 
                action, 
                description, 
                ip_address, 
                user_agent, 
                entity_type, 
                entity_id, 
                status, 
                result, 
                details
            ) VALUES (
                ${logData.username}, 
                ${logData.email || null}, 
                ${logData.user_id || null}, 
                ${logData.action}, 
                ${logData.description || null}, 
                ${logData.ip_address || null}, 
                ${logData.user_agent || null}, 
                ${logData.entity_type || null}, 
                ${logData.entity_id || null}, 
                ${logData.status || null}, 
                ${logData.result || null}, 
                ${logData.details ? JSON.stringify(logData.details) : null}
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
 * @returns {Promise<any[]>} - Danh sách logs
 */
export async function getRecentLogs(username, limit = 10) {
    try {
        const sql = await connectToDatabase();

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

// Test thêm log
if (process.argv[2] === 'test') {
    (async () => {
        try {
            console.log('🔍 Test thêm log vào nhat_ky_studio');

            const result = await addActivityLog({
                username: 'test_user',
                email: 'test@example.com',
                action: 'test_log',
                description: 'Test thêm log vào nhat_ky_studio',
                status: 'success',
                result: 'completed',
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
