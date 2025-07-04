/**
 * System Verification Script for AKS Studio
 * Chạy: node scripts/verify-system.js
 */

import dotenv from 'dotenv';
import pg from 'pg';
import chalk from 'chalk';

const { Pool } = pg;

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Xác minh hệ thống hoạt động đúng
 */
async function verifySystem() {
    console.log(chalk.blue('🔍 XÁC MINH HỆ THỐNG AKS STUDIO'));
    console.log('='.repeat(50));

    try {
        if (!DATABASE_URL) {
            console.error(chalk.red('❌ DATABASE_URL không tồn tại'));
            return;
        }

        const pool = new Pool({
            connectionString: DATABASE_URL,
        });

        // 1. Kiểm tra kết nối database
        console.log(chalk.yellow('1. Kiểm tra kết nối database...'));
        await pool.query('SELECT NOW()');
        console.log(chalk.green('✅ Database kết nối thành công'));

        // 2. Kiểm tra các bảng chính
        console.log(chalk.yellow('\n2. Kiểm tra các bảng chính...'));
        const tables = ['users', 'submissions', 'label_manager', 'label_templates', 'nhat_ky_studio'];
        
        for (const table of tables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(chalk.green(`✅ ${table}: ${result.rows[0].count} records`));
            } catch (error) {
                console.log(chalk.red(`❌ ${table}: ${error.message}`));
            }
        }

        // 3. Kiểm tra tài khoản ankunstudio
        console.log(chalk.yellow('\n3. Kiểm tra tài khoản ankunstudio...'));
        const user = await pool.query(`
            SELECT id, username, email, role 
            FROM users 
            WHERE username = 'ankunstudio'
        `);

        if (user.rows.length > 0) {
            console.log(chalk.green('✅ Tài khoản ankunstudio tồn tại:'));
            console.log(`   Role: ${user.rows[0].role}`);
            console.log(`   Email: ${user.rows[0].email}`);
        } else {
            console.log(chalk.red('❌ Tài khoản ankunstudio không tồn tại'));
        }

        console.log(chalk.green('\n✅ Xác minh hệ thống hoàn tất!'));
        
        await pool.end();

    } catch (error) {
        console.error(chalk.red('❌ Lỗi xác minh hệ thống:'), error.message);
    }
}

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    verifySystem().catch(console.error);
}

export { verifySystem };