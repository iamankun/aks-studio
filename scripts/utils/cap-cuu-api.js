// @ts-check
/**
 * Utility để test API
 * File: scripts/utils/api-helper.js
 */
import { logToFile } from './env-loader.js';

/**
 * Lấy base URL cho API
 * @returns {string} Base URL
 */
export function getBaseUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

/**
 * Call API và trả về kết quả
 * @param {string} endpoint - API endpoint (không bao gồm base URL)
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<any>} API response data
 */
export async function callApi(endpoint, options = {}) {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    try {
        console.log(`🌐 Gọi API: ${url}`);
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`❌ Lỗi khi gọi API ${url}:`, error.message);
        await logToFile(`API error for ${url}: ${error.message}`, 'api-errors.log');
        throw error;
    }
}

/**
 * Test API endpoint và trả về kết quả
 * @param {string} endpoint - API endpoint
 * @param {string} description - Mô tả test
 * @returns {Promise<{success: boolean, data: any, message: string}>} Kết quả test
 */
export async function testApiEndpoint(endpoint, description) {
    console.log(`\n=== Testing ${description} ===`);

    try {
        const data = await callApi(endpoint);
        console.log(`✅ ${description}: OK`);
        await logToFile(`API test for ${endpoint} (${description}): SUCCESS`, 'api-tests.log');
        return { success: true, data, message: 'Success' };
    } catch (error) {
        console.error(`❌ ${description}: Failed - ${error.message}`);
        await logToFile(`API test for ${endpoint} (${description}): FAILED - ${error.message}`, 'api-tests.log');
        return { success: false, data: null, message: error.message };
    }
}

/**
 * Format kết quả API để hiển thị trong console
 * @param {any} data - Dữ liệu API trả về
 * @param {number} [indent=2] - Số khoảng trắng để indent
 * @returns {string} Formatted data
 */
export function formatApiResult(data, indent = 2) {
    try {
        return JSON.stringify(data, null, indent);
    } catch (error) {
        return `[Không thể format: ${error.message}]`;
    }
}
