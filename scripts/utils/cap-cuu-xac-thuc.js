// @ts-check
/**
 * Utility để test authentication và authorization
 * File: scripts/utils/auth-helper.js
 */
import { callApi } from './cap-cuu-api.js';
import { logToFile } from './env-loader.js';

/**
 * Test authentication status API
 * @returns {Promise<{isAuthenticated: boolean, user: any|null, error: string|null}>}
 */
export async function checkAuthStatus() {
    try {
        const result = await callApi('api/auth/status');

        return {
            isAuthenticated: result.isAuthenticated || false,
            user: result.user || null,
            error: null
        };
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra auth status:', error.message);
        await logToFile(`Auth status check failed: ${error.message}`, 'auth-tests.log');

        return {
            isAuthenticated: false,
            user: null,
            error: error.message
        };
    }
}

/**
 * Test login với credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, user: any|null, message: string}>}
 */
export async function testLogin(username, password) {
    try {
        const result = await callApi('api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (result.success) {
            console.log(`✅ Login thành công với user: ${username}`);
            await logToFile(`Login success for user: ${username}`, 'auth-tests.log');

            return {
                success: true,
                user: result.user || null,
                message: 'Login successful'
            };
        } else {
            console.log(`❌ Login thất bại với user: ${username}`);
            await logToFile(`Login failed for user: ${username} - ${result.message || 'Unknown error'}`, 'auth-tests.log');

            return {
                success: false,
                user: null,
                message: result.message || 'Login failed'
            };
        }
    } catch (error) {
        console.error(`❌ Lỗi khi login với user ${username}:`, error.message);
        await logToFile(`Login error for user ${username}: ${error.message}`, 'auth-tests.log');

        return {
            success: false,
            user: null,
            message: error.message
        };
    }
}

/**
 * Kiểm tra nếu user có quyền cụ thể
 * @param {any} user - User object
 * @param {string} role - Role cần kiểm tra
 * @returns {boolean} true nếu user có role đó
 */
export function hasRole(user, role) {
    if (!user || !user.permissions) {
        return false;
    }

    // Kiểm tra permissions dạng string hoặc object
    const permissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;

    return permissions.role === role;
}

/**
 * Test authorization của một endpoint
 * @param {string} endpoint - API endpoint
 * @param {string} role - Role cần test
 * @returns {Promise<{success: boolean, authorized: boolean, message: string}>}
 */
export async function testAuthorization(endpoint, role) {
    console.log(`\n=== Testing authorization for ${role} on ${endpoint} ===`);

    try {
        // Thêm custom header để giả lập role cho test
        await callApi(endpoint, {
            headers: {
                'X-Test-Role': role
            }
        });

        console.log(`✅ Access granted for ${role} on ${endpoint}`);
        await logToFile(`Authorization test: ${role} can access ${endpoint}`, 'auth-tests.log');

        return {
            success: true,
            authorized: true,
            message: `Access granted for ${role}`
        };
    } catch (error) {
        // Check if it's an authorization error (401 or 403)
        if (error.message.includes('401') || error.message.includes('403')) {
            console.log(`❌ Access denied for ${role} on ${endpoint}`);
            await logToFile(`Authorization test: ${role} cannot access ${endpoint}`, 'auth-tests.log');

            return {
                success: true,
                authorized: false,
                message: `Access denied for ${role}`
            };
        }

        // Other error
        console.error(`❌ Error testing authorization:`, error.message);
        await logToFile(`Authorization test error for ${role} on ${endpoint}: ${error.message}`, 'auth-tests.log');

        return {
            success: false,
            authorized: false,
            message: error.message
        };
    }
}
