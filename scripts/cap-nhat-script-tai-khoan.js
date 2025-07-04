/**
 * Script để cập nhật tất cả các script cũ sử dụng đúng tài khoản ankunstudio
 * Chạy: node scripts/update-script-accounts.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

/**
 * Cập nhật tất cả các script để sử dụng đúng tài khoản
 */
async function updateScriptAccounts() {
    console.log(chalk.blue('🔄 CẬP NHẬT TẤT CẢ SCRIPTS SỬ DỤNG ĐÚNG TÀI KHOẢN'));
    console.log('='.repeat(60));

    try {
        const scriptsDir = 'f:\\Dev\\DMG\\scripts';
        const updates = [];

        // Danh sách các pattern cần thay thế
        const replacements = [
            // Thay thế tài khoản admin cũ
            { from: /username.*=.*['"]admin['"]/, to: "username = 'ankunstudio'" },
            { from: /username.*:.*['"]admin['"]/, to: "username: 'ankunstudio'" },
            { from: /WHERE username = ['"]admin['"]/, to: "WHERE username = 'ankunstudio'" },
            { from: /username.*=.*['"]testadmin['"]/, to: "username = 'ankunstudio'" },
            
            // Thay thế email admin cũ
            { from: /email.*=.*['"]admin@ankun\.dev['"]/, to: "email = 'ankunstudio@ankun.dev'" },
            { from: /email.*:.*['"]admin@ankun\.dev['"]/, to: "email: 'ankunstudio@ankun.dev'" },
            
            // Thay thế role
            { from: /role.*=.*['"]Admin['"]/, to: "role = 'Label Manager & Artist'" },
            { from: /role.*:.*['"]Admin['"]/, to: "role: 'Label Manager & Artist'" },
            
            // Thay thế trong comment
            { from: /\/\/ Real users.*admin \(Label Manager\)/, to: "// Real users: ankunstudio (Label Manager & Artist)" },
            { from: /admin \(Label Manager\)/, to: "ankunstudio (Label Manager & Artist)" },
            
            // Thay thế trong object definitions
            { from: /labelManager:\s*{\s*username:\s*['"]admin['"]/, to: "labelManager: {\n        username: 'ankunstudio'" },
            { from: /username:\s*['"]admin['"],\s*email:\s*['"]admin@ankun\.dev['"]/, to: "username: 'ankunstudio',\n        email: 'ankunstudio@ankun.dev'" },
        ];

        // Duyệt qua tất cả các file trong thư mục scripts
        await processDirectory(scriptsDir, replacements, updates);

        // Hiển thị kết quả
        console.log(chalk.green(`\n✅ Đã cập nhật ${updates.length} file:`));
        updates.forEach(update => {
            console.log(chalk.gray(`   - ${update.file}: ${update.changes} thay đổi`));
        });

        await logToFile(`Updated ${updates.length} script files for ankunstudio account`, 'update-scripts.log');

    } catch (error) {
        console.error(chalk.red('❌ Lỗi khi cập nhật scripts:'), error.message);
        await logToFile(`Update error: ${error.message}`, 'update-scripts.log');
    }
}

/**
 * Xử lý thư mục và tất cả các file trong đó
 */
async function processDirectory(dirPath, replacements, updates) {
    const items = readdirSync(dirPath);

    for (const item of items) {
        const itemPath = join(dirPath, item);
        const stat = statSync(itemPath);

        if (stat.isDirectory()) {
            // Bỏ qua thư mục logs và node_modules
            if (item !== 'logs' && item !== 'node_modules' && item !== '.git') {
                await processDirectory(itemPath, replacements, updates);
            }
        } else if (stat.isFile()) {
            // Chỉ xử lý các file JavaScript, TypeScript, JSON
            if (item.match(/\.(js|mjs|ts|json)$/)) {
                await processFile(itemPath, replacements, updates);
            }
        }
    }
}

/**
 * Xử lý một file cụ thể
 */
async function processFile(filePath, replacements, updates) {
    try {
        const content = readFileSync(filePath, 'utf8');
        let newContent = content;
        let changeCount = 0;

        // Áp dụng tất cả các thay thế
        for (const replacement of replacements) {
            const matches = newContent.match(replacement.from);
            if (matches) {
                newContent = newContent.replace(replacement.from, replacement.to);
                changeCount++;
            }
        }

        // Nếu có thay đổi, ghi lại file
        if (changeCount > 0) {
            writeFileSync(filePath, newContent, 'utf8');
            updates.push({
                file: filePath.replace('f:\\Dev\\DMG\\scripts\\', ''),
                changes: changeCount
            });
            
            console.log(chalk.yellow(`📝 Cập nhật: ${filePath.replace('f:\\Dev\\DMG\\scripts\\', '')}`));
        }

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi xử lý file ${filePath}:`), error.message);
    }
}

/**
 * Cập nhật các file SQL cụ thể
 */
async function updateSqlFiles() {
    console.log(chalk.yellow('\n=== Cập nhật SQL Files ==='));
    
    const sqlFiles = [
        'f:\\Dev\\DMG\\scripts\\001_create_initial_tables.sql',
        'f:\\Dev\\DMG\\scripts\\002_insert_demo_data.sql',
        'f:\\Dev\\DMG\\scripts\\003_simple_demo_data.sql'
    ];

    for (const sqlFile of sqlFiles) {
        try {
            // Tạo nội dung SQL cơ bản nếu file trống
            const content = readFileSync(sqlFile, 'utf8');
            if (content.trim().length <= 200) { // File hầu như trống
                await createBasicSqlContent(sqlFile);
            }
        } catch (error) {
            console.log(chalk.red(`❌ Lỗi khi cập nhật ${sqlFile}:`), error.message);
        }
    }
}

/**
 * Tạo nội dung SQL cơ bản
 */
async function createBasicSqlContent(filePath) {
    const fileName = filePath.split('\\').pop();
    
    if (fileName === '001_create_initial_tables.sql') {
        const sqlContent = `-- Active: 1751325959747@@ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech@5432@aksstudio
-- Script tạo các bảng cơ bản cho hệ thống AKS Studio
-- Đã được tạo tự động bởi tao-du-lieu-mau.js, tham khảo file đó để có nội dung đầy đủ

-- Các bảng sẽ được tạo:
-- 1. users - Bảng người dùng chính
-- 2. label_manager - Bảng quản lý label
-- 3. artist - Bảng nghệ sĩ
-- 4. submissions - Bảng nộp bài
-- 5. label_templates - Bảng mẫu label
-- 6. label_assignments - Bảng gán label
-- 7. nhat_ky_studio - Bảng nhật ký

-- Chạy: node src/data/tao-du-lieu-mau.js để tạo đầy đủ
`;
        writeFileSync(filePath, sqlContent, 'utf8');
        console.log(chalk.green(`✅ Đã cập nhật ${fileName}`));
    }
    
    if (fileName === '002_insert_demo_data.sql') {
        const sqlContent = `-- Active: 1751325959747@@ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech@5432@aksstudio
-- Script chèn dữ liệu demo cho hệ thống AKS Studio
-- Bao gồm tài khoản thực tế ankunstudio và dữ liệu mẫu

-- Tài khoản thực tế:
-- Username: ankunstudio
-- Role: Label Manager & Artist
-- Email: ankunstudio@ankun.dev

-- Chạy: node src/data/generateData.js để chèn dữ liệu đầy đủ
`;
        writeFileSync(filePath, sqlContent, 'utf8');
        console.log(chalk.green(`✅ Đã cập nhật ${fileName}`));
    }
}

/**
 * Kiểm tra và sửa các script quan trọng
 */
async function fixImportantScripts() {
    console.log(chalk.yellow('\n=== Sửa Scripts Quan Trọng ==='));
    
    const importantScripts = [
        'check-admin-auth.js',
        'test-real-users.js',
        'check-label-manager.js',
        'test-real-authorization.js'
    ];

    for (const script of importantScripts) {
        await ensureScriptUsesCorrectAccount(script);
    }
}

/**
 * Đảm bảo script sử dụng đúng tài khoản
 */
async function ensureScriptUsesCorrectAccount(scriptName) {
    const filePath = `f:\\Dev\\DMG\\scripts\\${scriptName}`;
    
    try {
        let content = readFileSync(filePath, 'utf8');
        let changed = false;

        // Thay thế ADMIN_USERNAME check
        if (content.includes('process.env.ADMIN_USERNAME')) {
            content = content.replace(
                /const adminUsername = process\.env\.ADMIN_USERNAME;/g,
                `const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';`
            );
            changed = true;
        }

        // Thay thế hardcoded admin username
        if (content.includes("'admin'") && !content.includes('ankunstudio')) {
            content = content.replace(
                /WHERE username = ['"]admin['"](?! AND)/g,
                "WHERE username = 'ankunstudio'"
            );
            changed = true;
        }

        if (changed) {
            writeFileSync(filePath, content, 'utf8');
            console.log(chalk.green(`✅ Đã sửa ${scriptName}`));
        } else {
            console.log(chalk.gray(`➡️ ${scriptName} đã đúng`));
        }

    } catch (error) {
        console.log(chalk.red(`❌ Lỗi khi sửa ${scriptName}:`), error.message);
    }
}

// Export functions
export { updateScriptAccounts, updateSqlFiles, fixImportantScripts };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    updateScriptAccounts()
        .then(() => updateSqlFiles())
        .then(() => fixImportantScripts())
        .catch(console.error);
}
