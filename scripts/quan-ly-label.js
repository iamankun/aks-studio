/**
 * Công cụ quản lý và cập nhật label trong database
 * 
 * Script này thực hiện:
 * 1. Liệt kê các label hiện có
 * 2. Kiểm tra trạng thái gán nhãn
 * 3. Cập nhật hoặc gán nhãn mới
 * 4. Xuất báo cáo gán nhãn
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';

const { Pool } = pg;
const program = new Command();

// Khởi tạo môi trường
dotenv.config({ path: '.env.local' });

// Các biến môi trường
const DATABASE_URL = process.env.DATABASE_URL;

// Khai báo lệnh CLI
program
    .name('quan-ly-label')
    .description('Công cụ quản lý và cập nhật label trong database')
    .version('1.0.0');

program
    .command('list')
    .description('Liệt kê tất cả các label hiện có')
    .action(listLabels);

program
    .command('check <labelId>')
    .description('Kiểm tra trạng thái của một label cụ thể')
    .action(checkLabel);

program
    .command('report')
    .description('Xuất báo cáo gán nhãn')
    .option('-o, --output <file>', 'Đường dẫn file xuất báo cáo')
    .action(generateReport);

program
    .command('update <labelId>')
    .description('Cập nhật thông tin cho một label')
    .option('-n, --name <name>', 'Tên mới cho label')
    .option('-d, --description <description>', 'Mô tả mới cho label')
    .option('-s, --status <status>', 'Trạng thái mới (active/inactive)')
    .action(updateLabel);

program
    .command('assign <userId> <labelId>')
    .description('Gán nhãn cho một người dùng')
    .action(assignLabel);

program.parse(process.argv);

// Nếu không có lệnh, hiển thị hướng dẫn
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

async function connectDatabase() {
    if (!DATABASE_URL) {
        console.error(chalk.red('❌ Không tìm thấy DATABASE_URL trong file .env'));
        process.exit(1);
    }

    return new Pool({
        connectionString: DATABASE_URL,
    });
}

async function listLabels() {
    console.log(chalk.blue('📋 Đang liệt kê các label...'));

    const pool = await connectDatabase();

    try {
        const result = await pool.query(`
      SELECT 
        l.id, 
        l.name, 
        l.description, 
        l.status,
        l.created_at,
        COUNT(la.id) as assignments_count
      FROM 
        label_templates l
      LEFT JOIN 
        label_assignments la ON l.id = la.label_id
      GROUP BY 
        l.id
      ORDER BY 
        l.name
    `);

        if (result.rows.length === 0) {
            console.log(chalk.yellow('⚠️ Không tìm thấy label nào'));
            return;
        }

        console.log(chalk.green(`✅ Tìm thấy ${result.rows.length} label:`));

        console.log('\n| ID | Tên | Mô tả | Trạng thái | Ngày tạo | Số lần gán |');
        console.log('|----|-----|-------|------------|----------|------------|');

        result.rows.forEach(label => {
            console.log(`| ${label.id} | ${label.name} | ${label.description || '-'} | ${label.status} | ${new Date(label.created_at).toLocaleDateString()} | ${label.assignments_count} |`);
        });

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi lấy danh sách label: ${error.message}`));
    } finally {
        await pool.end();
    }
}

async function checkLabel(labelId) {
    console.log(chalk.blue(`🔍 Đang kiểm tra label ID: ${labelId}...`));

    const pool = await connectDatabase();

    try {
        // Kiểm tra thông tin label
        const labelResult = await pool.query(`
      SELECT * FROM label_templates WHERE id = $1
    `, [labelId]);

        if (labelResult.rows.length === 0) {
            console.log(chalk.red(`❌ Không tìm thấy label với ID: ${labelId}`));
            return;
        }

        const label = labelResult.rows[0];

        console.log(chalk.green('✅ Thông tin label:'));
        console.log(`- ID: ${label.id}`);
        console.log(`- Tên: ${label.name}`);
        console.log(`- Mô tả: ${label.description || 'N/A'}`);
        console.log(`- Trạng thái: ${label.status}`);
        console.log(`- Ngày tạo: ${new Date(label.created_at).toLocaleString()}`);

        // Kiểm tra các gán nhãn
        const assignmentsResult = await pool.query(`
      SELECT 
        la.id, 
        la.user_id, 
        u.username, 
        la.assigned_at, 
        la.assigned_by
      FROM 
        label_assignments la
      LEFT JOIN 
        users u ON la.user_id = u.id
      WHERE 
        la.label_id = $1
      ORDER BY 
        la.assigned_at DESC
    `, [labelId]);

        if (assignmentsResult.rows.length === 0) {
            console.log(chalk.yellow('\n⚠️ Label này chưa được gán cho bất kỳ người dùng nào'));
            return;
        }

        console.log(chalk.green(`\n✅ Label này đã được gán cho ${assignmentsResult.rows.length} người dùng:`));

        console.log('\n| Assignment ID | User ID | Username | Ngày gán | Gán bởi |');
        console.log('|---------------|---------|----------|----------|---------|');

        assignmentsResult.rows.forEach(assignment => {
            console.log(`| ${assignment.id} | ${assignment.user_id} | ${assignment.username || 'N/A'} | ${new Date(assignment.assigned_at).toLocaleString()} | ${assignment.assigned_by || 'N/A'} |`);
        });

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi kiểm tra label: ${error.message}`));
    } finally {
        await pool.end();
    }
}

async function generateReport(options) {
    console.log(chalk.blue('📊 Đang tạo báo cáo gán nhãn...'));

    const pool = await connectDatabase();

    try {
        const result = await pool.query(`
      SELECT 
        lt.id as label_id,
        lt.name as label_name,
        lt.description,
        lt.status,
        COUNT(la.id) as assignments_count,
        string_agg(DISTINCT u.username, ', ') as assigned_users
      FROM 
        label_templates lt
      LEFT JOIN 
        label_assignments la ON lt.id = la.label_id
      LEFT JOIN 
        users u ON la.user_id = u.id
      GROUP BY 
        lt.id
      ORDER BY 
        assignments_count DESC
    `);

        const report = {
            generated_at: new Date().toISOString(),
            total_labels: result.rows.length,
            labels: result.rows
        };

        // Hiển thị báo cáo trên console
        console.log(chalk.green(`✅ Báo cáo gán nhãn (${result.rows.length} labels):`));

        result.rows.forEach(row => {
            console.log(`\n${chalk.bold(row.label_name)} (ID: ${row.label_id})`);
            console.log(`- Mô tả: ${row.description || 'N/A'}`);
            console.log(`- Trạng thái: ${row.status}`);
            console.log(`- Số lần gán: ${row.assignments_count}`);
            console.log(`- Người dùng được gán: ${row.assignments_count > 0 ? row.assigned_users : 'Không có'}`);
        });

        // Xuất báo cáo ra file nếu có chỉ định
        if (options.output) {
            const outputPath = path.resolve(options.output);
            fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
            console.log(chalk.green(`\n✅ Đã xuất báo cáo ra file: ${outputPath}`));
        }

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi tạo báo cáo: ${error.message}`));
    } finally {
        await pool.end();
    }
}

async function updateLabel(labelId, options) {
    console.log(chalk.blue(`🔄 Đang cập nhật label ID: ${labelId}...`));

    if (!options.name && !options.description && !options.status) {
        console.log(chalk.yellow('⚠️ Không có thông tin nào được cung cấp để cập nhật'));
        return;
    }

    const pool = await connectDatabase();

    try {
        // Kiểm tra label tồn tại
        const checkResult = await pool.query('SELECT * FROM label_templates WHERE id = $1', [labelId]);

        if (checkResult.rows.length === 0) {
            console.log(chalk.red(`❌ Không tìm thấy label với ID: ${labelId}`));
            return;
        }

        // Chuẩn bị câu truy vấn update
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (options.name) {
            updates.push(`name = $${paramIndex}`);
            values.push(options.name);
            paramIndex++;
        }

        if (options.description) {
            updates.push(`description = $${paramIndex}`);
            values.push(options.description);
            paramIndex++;
        }

        if (options.status) {
            if (!['active', 'inactive'].includes(options.status)) {
                console.log(chalk.red('❌ Trạng thái không hợp lệ. Sử dụng: active hoặc inactive'));
                return;
            }

            updates.push(`status = $${paramIndex}`);
            values.push(options.status);
            paramIndex++;
        }

        updates.push(`updated_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;

        values.push(labelId);

        // Thực hiện cập nhật
        const updateQuery = `
      UPDATE label_templates 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        const updateResult = await pool.query(updateQuery, values);

        const updatedLabel = updateResult.rows[0];

        console.log(chalk.green('✅ Đã cập nhật label thành công:'));
        console.log(`- ID: ${updatedLabel.id}`);
        console.log(`- Tên: ${updatedLabel.name}`);
        console.log(`- Mô tả: ${updatedLabel.description || 'N/A'}`);
        console.log(`- Trạng thái: ${updatedLabel.status}`);
        console.log(`- Cập nhật lúc: ${new Date(updatedLabel.updated_at).toLocaleString()}`);

        // Ghi nhật ký hoạt động
        await pool.query(`
      INSERT INTO nhat_ky_studio (username, action, description, created_at)
      VALUES ($1, $2, $3, $4)
    `, [
            'system',
            'update_label',
            `Cập nhật label ID ${labelId}: ${JSON.stringify(options)}`,
            new Date()
        ]);

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi cập nhật label: ${error.message}`));
    } finally {
        await pool.end();
    }
}

async function assignLabel(userId, labelId) {
    console.log(chalk.blue(`🔄 Đang gán label ID: ${labelId} cho user ID: ${userId}...`));

    const pool = await connectDatabase();

    try {
        // Kiểm tra user tồn tại
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            console.log(chalk.red(`❌ Không tìm thấy người dùng với ID: ${userId}`));
            return;
        }

        // Kiểm tra label tồn tại
        const labelResult = await pool.query('SELECT * FROM label_templates WHERE id = $1', [labelId]);

        if (labelResult.rows.length === 0) {
            console.log(chalk.red(`❌ Không tìm thấy label với ID: ${labelId}`));
            return;
        }

        // Kiểm tra đã gán trước đó chưa
        const existingResult = await pool.query(
            'SELECT * FROM label_assignments WHERE user_id = $1 AND label_id = $2',
            [userId, labelId]
        );

        if (existingResult.rows.length > 0) {
            console.log(chalk.yellow(`⚠️ Label này đã được gán cho người dùng trước đó (Assignment ID: ${existingResult.rows[0].id})`));
            return;
        }

        // Thực hiện gán nhãn
        const insertResult = await pool.query(`
      INSERT INTO label_assignments (user_id, label_id, assigned_at, assigned_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
            userId,
            labelId,
            new Date(),
            'system'
        ]);

        const assignment = insertResult.rows[0];

        console.log(chalk.green('✅ Đã gán label thành công:'));
        console.log(`- Assignment ID: ${assignment.id}`);
        console.log(`- User ID: ${assignment.user_id}`);
        console.log(`- Username: ${userResult.rows[0].username}`);
        console.log(`- Label ID: ${assignment.label_id}`);
        console.log(`- Label name: ${labelResult.rows[0].name}`);
        console.log(`- Ngày gán: ${new Date(assignment.assigned_at).toLocaleString()}`);

        // Ghi nhật ký hoạt động
        await pool.query(`
      INSERT INTO nhat_ky_studio (username, action, description, created_at)
      VALUES ($1, $2, $3, $4)
    `, [
            'system',
            'assign_label',
            `Gán label ${labelResult.rows[0].name} (ID: ${labelId}) cho người dùng ${userResult.rows[0].username} (ID: ${userId})`,
            new Date()
        ]);

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi gán label: ${error.message}`));
    } finally {
        await pool.end();
    }
}
