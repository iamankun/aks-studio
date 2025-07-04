// @ts-check
/**
 * Tiện ích ghi log API vào bảng nhat_ky_studio
 */

import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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
 * Ghi log API request vào nhat_ky_studio
 * @param {Object} params - Các tham số
 * @param {Object} params.req - Request object
 * @param {Object} params.res - Response object
 * @param {string} params.action - Loại hành động (login, register, submit, etc)
 * @param {Object} [params.user] - Thông tin user
 * @param {string} [params.entityType] - Loại đối tượng (user, submission, etc)
 * @param {number|string} [params.entityId] - ID của đối tượng
 * @param {string} [params.description] - Mô tả chi tiết
 * @param {Object} [params.details] - Thông tin chi tiết (JSON)
 * @returns {Promise<void>}
 */
export async function logApiRequest({
    req,
    res,
    action,
    user,
    entityType,
    entityId,
    description,
    details = {}
}) {
    try {
        const sql = await connectToDatabase();

        // Lấy thông tin user
        const username = user?.username || user?.email || 'anonymous';
        const email = user?.email || null;
        const userId = user?.id || null;

        // Lấy thông tin request
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Xác định status
        const status = res.statusCode < 400 ? 'success' : 'error';
        const result = res.statusCode.toString();

        // Chuẩn bị chi tiết
        const requestDetails = {
            method: req.method,
            url: req.url,
            headers: {
                ...req.headers,
                // Loại bỏ các headers nhạy cảm
                authorization: req.headers.authorization ? '[REDACTED]' : undefined,
                cookie: req.headers.cookie ? '[REDACTED]' : undefined
            },
            query: req.query,
            ...details
        };

        // Thêm log vào database
        await sql`
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
                ${username}, 
                ${email}, 
                ${userId}, 
                ${action}, 
                ${description || `API ${req.method} ${req.url}`}, 
                ${ip}, 
                ${userAgent}, 
                ${entityType || 'api'}, 
                ${entityId ? entityId.toString() : null}, 
                ${status}, 
                ${result}, 
                ${JSON.stringify(requestDetails)}
            )
        `;
    } catch (error) {
        // Log error but don't throw to avoid affecting API response
        console.error('Failed to log API request:', error);
    }
}

/**
 * Ghi log API cho các hoạt động authentication
 * @param {Object} params - Các tham số
 * @returns {Promise<void>}
 */
export async function logAuthActivity(params) {
    return logApiRequest({
        ...params,
        action: params.action || 'authentication',
        entityType: params.entityType || 'auth'
    });
}

/**
 * Ghi log API cho các hoạt động submissions
 * @param {Object} params - Các tham số
 * @returns {Promise<void>}
 */
export async function logSubmissionActivity(params) {
    return logApiRequest({
        ...params,
        action: params.action || 'submission',
        entityType: params.entityType || 'submission'
    });
}

/**
 * Ghi log API cho các hoạt động liên quan đến user
 * @param {Object} params - Các tham số
 * @returns {Promise<void>}
 */
export async function logUserActivity(params) {
    return logApiRequest({
        ...params,
        action: params.action || 'user',
        entityType: params.entityType || 'user'
    });
}

/**
 * Ghi log API cho các hoạt động quản lý hệ thống
 * @param {Object} params - Các tham số
 * @returns {Promise<void>}
 */
export async function logAdminActivity(params) {
    return logApiRequest({
        ...params,
        action: params.action || 'admin',
        entityType: params.entityType || 'system'
    });
}

/**
 * Ghi log API cho client-side activities
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} [user] - User object
 * @returns {Promise<void>}
 */
export async function logClientActivity(req, res, user) {
    try {
        const body = req.body || {};

        if (!body.action) {
            return;
        }

        return logApiRequest({
            req,
            res,
            action: body.action,
            user: user || body.user,
            entityType: body.entityType,
            entityId: body.entityId,
            description: body.description,
            details: body.details || {}
        });
    } catch (error) {
        console.error('Failed to log client activity:', error);
    }
}
