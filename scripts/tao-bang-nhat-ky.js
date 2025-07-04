// @ts-check
/**
 * Script tạo bảng nhat_ky_studio (activity_log) trong database
 * Bảng này sẽ lưu lịch sử hoạt động của người dùng
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
        const logFile = path.join(logDir, "tao-bang-nhat-ky.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (error) {
        console.error("Error writing to log file:", error);
    }
}

async function main() {
    try {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is not set");
        }

        await logToFile("Bắt đầu tạo bảng nhat_ky_studio");
        console.log("Bắt đầu tạo bảng nhat_ky_studio (activity_log)...");

        // Connect to the database
        const sql = neon(connectionString);

        // Check if the table exists
        const checkTableResult = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'nhat_ky_studio'
            );
        `;

        const tableExists = checkTableResult[0]?.exists || false;

        if (tableExists) {
            console.log("Bảng nhat_ky_studio đã tồn tại.");
            await logToFile("Bảng nhat_ky_studio đã tồn tại");

            // Kiểm tra cấu trúc bảng
            await checkTableStructure(sql);
            return;
        }

        // Create the table
        await sql`
            CREATE TABLE nhat_ky_studio (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                username VARCHAR(255),
                action VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                details JSONB,
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                component_name VARCHAR(255),
                session_id VARCHAR(255),
                related_ids JSONB
            );
        `;

        console.log("Đã tạo bảng nhat_ky_studio thành công.");
        await logToFile("Đã tạo bảng nhat_ky_studio thành công");

        // Create indexes for better performance
        await sql`
            CREATE INDEX idx_nhat_ky_user_id ON nhat_ky_studio(user_id);
        `;
        await sql`
            CREATE INDEX idx_nhat_ky_action ON nhat_ky_studio(action);
        `;
        await sql`
            CREATE INDEX idx_nhat_ky_category ON nhat_ky_studio(category);
        `;
        await sql`
            CREATE INDEX idx_nhat_ky_created_at ON nhat_ky_studio(created_at);
        `;
        await sql`
            CREATE INDEX idx_nhat_ky_component ON nhat_ky_studio(component_name);
        `;

        console.log("Đã tạo các index cho bảng nhat_ky_studio.");
        await logToFile("Đã tạo các index cho bảng nhat_ky_studio");

        // Insert some test data
        await insertTestData(sql);

    } catch (error) {
        console.error("Lỗi khi tạo bảng nhat_ky_studio:", error);
        await logToFile(`Lỗi khi tạo bảng nhat_ky_studio: ${error.message}`);
    }
}

async function checkTableStructure(sql) {
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'nhat_ky_studio'
            AND table_schema = 'public';
        `;

        const expectedColumns = [
            { name: 'id', type: 'integer' },
            { name: 'user_id', type: 'character varying' },
            { name: 'username', type: 'character varying' },
            { name: 'action', type: 'character varying' },
            { name: 'category', type: 'character varying' },
            { name: 'details', type: 'jsonb' },
            { name: 'ip_address', type: 'character varying' },
            { name: 'user_agent', type: 'text' },
            { name: 'status', type: 'character varying' },
            { name: 'created_at', type: 'timestamp with time zone' },
            { name: 'component_name', type: 'character varying' },
            { name: 'session_id', type: 'character varying' },
            { name: 'related_ids', type: 'jsonb' }
        ];

        const existingColumns = columns.map(col => ({
            name: col.column_name,
            type: col.data_type
        }));

        // Check if all expected columns exist
        const missingColumns = expectedColumns.filter(expected =>
            !existingColumns.some(existing =>
                existing.name === expected.name
            )
        );

        if (missingColumns.length > 0) {
            console.log("Bảng nhat_ky_studio thiếu một số cột:", missingColumns);
            await logToFile(`Bảng nhat_ky_studio thiếu cột: ${missingColumns.map(c => c.name).join(', ')}`);

            // Add missing columns
            for (const col of missingColumns) {
                let dataType = col.type;
                if (col.name === 'details' || col.name === 'related_ids') {
                    dataType = 'JSONB';
                }

                await sql`
                    ALTER TABLE nhat_ky_studio 
                    ADD COLUMN ${sql(col.name)} ${sql.unsafe(dataType)};
                `;
                console.log(`Đã thêm cột ${col.name} vào bảng nhat_ky_studio.`);
                await logToFile(`Đã thêm cột ${col.name} vào bảng nhat_ky_studio`);
            }
        } else {
            console.log("Cấu trúc bảng nhat_ky_studio đã đầy đủ.");
            await logToFile("Cấu trúc bảng nhat_ky_studio đã đầy đủ");
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra cấu trúc bảng:", error);
        await logToFile(`Lỗi khi kiểm tra cấu trúc bảng: ${error.message}`);
    }
}

async function insertTestData(sql) {
    try {
        // Check if we already have test data
        const count = await sql`SELECT COUNT(*) FROM nhat_ky_studio`;
        if (count[0].count > 0) {
            console.log(`Bảng nhat_ky_studio đã có ${count[0].count} bản ghi.`);
            await logToFile(`Bảng nhat_ky_studio đã có ${count[0].count} bản ghi`);
            return;
        }

        // Insert test data
        const testData = [
            {
                user_id: 'test-user-1',
                username: 'test_user1',
                action: 'login',
                category: 'auth',
                details: { success: true, method: 'password' },
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 Test User Agent',
                status: 'success',
                component_name: 'LoginForm',
                session_id: 'test-session-1',
                related_ids: { accountId: 'acc-123' }
            },
            {
                user_id: 'test-user-1',
                username: 'test_user1',
                action: 'view_profile',
                category: 'user_action',
                details: { page: 'profile', referrer: 'home' },
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 Test User Agent',
                status: 'success',
                component_name: 'ProfileView',
                session_id: 'test-session-1',
                related_ids: { profileId: 'prof-123' }
            },
            {
                user_id: 'test-user-2',
                username: 'test_user2',
                action: 'upload_submission',
                category: 'content',
                details: { fileType: 'audio', fileName: 'test-song.mp3', fileSize: 3145728 },
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0 Another Test User Agent',
                status: 'success',
                component_name: 'UploadForm',
                session_id: 'test-session-2',
                related_ids: { submissionId: 'sub-456' }
            }
        ];

        for (const data of testData) {
            await sql`
                INSERT INTO nhat_ky_studio (
                    user_id, username, action, category, details, 
                    ip_address, user_agent, status, component_name,
                    session_id, related_ids
                ) VALUES (
                    ${data.user_id}, 
                    ${data.username}, 
                    ${data.action}, 
                    ${data.category}, 
                    ${data.details}, 
                    ${data.ip_address}, 
                    ${data.user_agent}, 
                    ${data.status}, 
                    ${data.component_name}, 
                    ${data.session_id}, 
                    ${data.related_ids}
                )
            `;
        }

        console.log(`Đã thêm ${testData.length} bản ghi mẫu vào bảng nhat_ky_studio.`);
        await logToFile(`Đã thêm ${testData.length} bản ghi mẫu vào bảng nhat_ky_studio`);
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu mẫu:", error);
        await logToFile(`Lỗi khi thêm dữ liệu mẫu: ${error.message}`);
    }
}

main()
    .then(() => {
        console.log("Hoàn thành quá trình khởi tạo bảng nhat_ky_studio.");
    })
    .catch(error => {
        console.error("Lỗi khi thực thi script:", error);
    });
