/**
 * Công cụ kiểm tra cấu trúc bảng dữ liệu cho hệ thống Label Manager
 * 
 * Script này thực hiện:
 * 1. Kết nối đến database
 * 2. Kiểm tra các bảng liên quan đến label manager
 * 3. Phân tích cấu trúc các bảng
 * 4. Kiểm tra quan hệ giữa các bảng
 * 5. Đề xuất tối ưu hóa (nếu cần)
 */

import dotenv from 'dotenv';
import pg from 'pg';
import chalk from 'chalk';
const { Pool } = pg;

// Khởi tạo môi trường
dotenv.config({ path: '.env.local' });

// Các biến môi trường
const DATABASE_URL = process.env.DATABASE_URL;

// Các bảng cần kiểm tra
const TABLES_TO_CHECK = [
    'label_manager',
    'label_templates',
    'label_assignments',
    'nhat_ky_studio',
    'users'
];

console.log(chalk.blue('🔍 Kiểm tra cấu trúc bảng dữ liệu cho Label Manager...'));
console.log('='.repeat(60));

async function checkTablesExist(pool) {
    console.log(chalk.yellow('=== Kiểm tra các bảng tồn tại ==='));
    for (const table of TABLES_TO_CHECK) {
        try {
            const tableResult = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [table]);
            const exists = tableResult.rows[0].exists;
            if (exists) {
                console.log(chalk.green(`✅ Bảng ${table} tồn tại`));
            } else {
                console.log(chalk.red(`❌ Bảng ${table} không tồn tại`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Lỗi khi kiểm tra bảng ${table}: ${error.message}`));
        }
    }
    console.log('-'.repeat(60));
}

async function analyzeTableStructures(pool) {
    console.log(chalk.yellow('=== Phân tích cấu trúc các bảng ==='));
    for (const table of TABLES_TO_CHECK) {
        try {
            const columnsResult = await pool.query(`
                SELECT column_name, data_type, character_maximum_length, is_nullable 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            if (columnsResult.rows.length > 0) {
                console.log(chalk.green(`📋 Cấu trúc bảng ${table}:`));
                console.log('| Tên cột | Kiểu dữ liệu | Độ dài tối đa | Nullable |');
                console.log('|---------|-------------|--------------|----------|');
                columnsResult.rows.forEach(column => {
                    const lengthInfo = column.character_maximum_length ?
                        column.character_maximum_length.toString() :
                        'N/A';
                    console.log(`| ${column.column_name} | ${column.data_type} | ${lengthInfo} | ${column.is_nullable} |`);
                });
                console.log();
            } else {
                console.log(chalk.yellow(`⚠️ Không tìm thấy thông tin cột cho bảng ${table}`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Lỗi khi phân tích cấu trúc bảng ${table}: ${error.message}`));
        }
    }
    console.log('-'.repeat(60));
}

async function checkForeignKeys(pool) {
    console.log(chalk.yellow('=== Kiểm tra khóa ngoại và quan hệ ==='));
    try {
        const foreignKeysResult = await pool.query(`
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu 
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ANY($1)
        `, [TABLES_TO_CHECK]);
        if (foreignKeysResult.rows.length > 0) {
            console.log(chalk.green(`✅ Tìm thấy ${foreignKeysResult.rows.length} khóa ngoại:`));
            console.log('| Bảng | Cột | Tham chiếu đến | Cột tham chiếu |');
            console.log('|------|-----|---------------|----------------|');
            foreignKeysResult.rows.forEach(fk => {
                console.log(`| ${fk.table_name} | ${fk.column_name} | ${fk.foreign_table_name} | ${fk.foreign_column_name} |`);
            });
            console.log();
        } else {
            console.log(chalk.yellow('⚠️ Không tìm thấy khóa ngoại nào giữa các bảng đã chọn'));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi kiểm tra khóa ngoại: ${error.message}`));
    }
    console.log('-'.repeat(60));
}

async function analyzeLabelManagerData(pool) {
    console.log(chalk.yellow('=== Phân tích dữ liệu bảng label_manager ==='));
    try {
        const labelManagerResult = await pool.query('SELECT COUNT(*) FROM label_manager');
        const count = parseInt(labelManagerResult.rows[0].count);
        console.log(`Số lượng Label Manager: ${count}`);
        if (count > 0) {
            // Kiểm tra các loại role
            const rolesResult = await pool.query(`
                SELECT role, COUNT(*) 
                FROM label_manager 
                GROUP BY role
            `);
            console.log('Phân bố theo vai trò:');
            rolesResult.rows.forEach(role => {
                console.log(`- ${role.role || 'NULL'}: ${role.count}`);
            });
            // Lấy mẫu vài bản ghi
            const sampleResult = await pool.query('SELECT * FROM label_manager LIMIT 3');
            console.log('\nMẫu dữ liệu:');
            sampleResult.rows.forEach((row, index) => {
                console.log(`\nMẫu #${index + 1}:`);
                Object.entries(row).forEach(([key, value]) => {
                    if (key === 'password' || key === 'password_hash') {
                        console.log(`- ${key}: [HIDDEN]`);
                    } else {
                        console.log(`- ${key}: ${JSON.stringify(value)}`);
                    }
                });
            });
        }
    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi phân tích dữ liệu bảng label_manager: ${error.message}`));
    }
}

async function main() {
    if (!DATABASE_URL) {
        console.error(chalk.red('❌ Không tìm thấy DATABASE_URL trong file .env'));
        process.exit(1);
    }
    console.log('Đang kết nối database...');
    const pool = new Pool({
        connectionString: DATABASE_URL,
    });
    try {
        await checkTablesExist(pool);
        await analyzeTableStructures(pool);
        await checkForeignKeys(pool);
        await analyzeLabelManagerData(pool);
    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi truy vấn database: ${error.message}`));
    } finally {
        await pool.end();
    }
}

main().catch(error => {
    console.error(chalk.red(`❌ Lỗi không mong muốn: ${error.message}`));
    process.exit(1);
});
