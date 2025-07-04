// @ts-check
/**
 * Database utility cho scripts
 * File: scripts/utils/db-helper.js
 */
import { neon } from "@neondatabase/serverless";
import { logToFile } from './env-loader.js';

/**
 * Kết nối với database và trả về client để thực hiện query
 * @returns {Promise<any>} Database client
 */
export async function connectToDatabase() {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL not found in environment variables');
        }
        console.log('🔌 Đang kết nối với database...');
        const sql = neon(DATABASE_URL);
        return sql;
    } catch (error) {
        console.error(`❌ Lỗi khi kết nối database: ${error.message}`);
        await logToFile(`Error connecting to database: ${error.message}`, 'db-connection-errors.log');
        throw error;
    }
}

/**
 * Kiểm tra kết nối database
 * @returns {Promise<boolean>} true nếu kết nối thành công
 */
export async function testDatabaseConnection() {
    try {
        const sql = await connectToDatabase();
        // Chỉ thực hiện query để kiểm tra kết nối, không cần kết quả
        await sql`SELECT 1 as connection_test`;
        console.log('✅ Kết nối database thành công!');
        return true;
    } catch (error) {
        console.error(`❌ Lỗi kết nối database: ${error.message}`);
        await logToFile(`Database connection test failed: ${error.message}`, 'db-connection-errors.log');
        return false;
    }
}

/**
 * Kiểm tra bảng có tồn tại trong database không
 * @param {string} tableName - Tên bảng cần kiểm tra
 * @returns {Promise<boolean>} true nếu bảng tồn tại
 */
export async function checkTableExists(tableName) {
    try {
        const sql = await connectToDatabase();
        const result = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = ${tableName}
            ) as exists
        `;
        return result[0]?.exists || false;
    } catch (error) {
        console.error(`❌ Lỗi khi kiểm tra bảng ${tableName}: ${error.message}`);
        await logToFile(`Error checking table ${tableName}: ${error.message}`, 'db-errors.log');
        return false;
    }
}

/**
 * Lấy cấu trúc của bảng
 * @param {string} tableName - Tên bảng cần lấy cấu trúc
 * @returns {Promise<Array<any>>} Thông tin các cột của bảng
 */
export async function getTableStructure(tableName) {
    try {
        const sql = await connectToDatabase();
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = ${tableName}
            ORDER BY ordinal_position
        `;
        return columns;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy cấu trúc bảng ${tableName}: ${error.message}`);
        await logToFile(`Error getting structure for table ${tableName}: ${error.message}`, 'db-errors.log');
        return [];
    }
}

/**
 * Đếm số lượng record trong bảng
 * @param {string} tableName - Tên bảng
 * @returns {Promise<number>} Số lượng record
 */
export async function countRecords(tableName) {
    try {
        const sql = await connectToDatabase();
        const result = await sql`
            SELECT COUNT(*) as count FROM ${sql(tableName)}
        `;
        return parseInt(result[0]?.count || '0');
    } catch (error) {
        console.error(`❌ Lỗi khi đếm record trong bảng ${tableName}: ${error.message}`);
        await logToFile(`Error counting records in ${tableName}: ${error.message}`, 'db-errors.log');
        return 0;
    }
}

/**
 * Lấy danh sách các bảng trong database
 * @returns {Promise<Array<string>>} Danh sách tên các bảng
 */
export async function listTables() {
    try {
        const sql = await connectToDatabase();
        const tables = await sql`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `;
        return tables.map(t => t.table_name);
    } catch (error) {
        console.error(`❌ Lỗi khi lấy danh sách bảng: ${error.message}`);
        await logToFile(`Error listing tables: ${error.message}`, 'db-errors.log');
        return [];
    }
}
