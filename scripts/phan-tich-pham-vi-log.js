// @ts-check
/**
 * Script để phân tích và đề xuất nơi cần thêm log hoạt động
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// File và thư mục được loại trừ
const EXCLUDED_DIRS = [
    'node_modules',
    '.next',
    'public',
    'build',
    'dist',
    'logs'
];

const EXCLUDED_FILES = [
    '.env',
    '.gitignore',
    'package-lock.json',
    'yarn.lock'
];

// Các pattern để tìm kiếm các components cần thêm log
const PATTERNS = {
    BUTTON_CLICK: /onClick\s*=\s*\{/g,
    FORM_SUBMIT: /onSubmit\s*=\s*\{/g,
    AUTH_OPERATIONS: /(login|register|logout|authenticate|authorize)/gi,
    MODAL_DIALOG: /(Modal|Dialog|showModal)/g,
    API_CALLS: /(fetch\(|axios\.|api\.)/g,
    STATE_CHANGES: /(useState|useReducer|dispatch\()/g,
    USER_INPUT: /(onChange|onInput|onKeyDown|onBlur)/g
};

// Các file đã có tích hợp log
const FILES_WITH_LOGS = [
    'components/auth/login-view.tsx',
    'components/auth/register-view.tsx',
    'components/views/upload-form-view.tsx',
    'lib/client-activity-log.js',
    'lib/nhat-ky-studio.js',
    'app/api/activity-log/route.js'
];

/**
 * Kiểm tra xem file có chứa import log không
 * @param {string} content - Nội dung file
 * @returns {boolean}
 */
function hasLogImport(content) {
    return content.includes('logActivity') ||
        content.includes('logUIInteraction') ||
        content.includes('logLogin') ||
        content.includes('logPageView') ||
        content.includes('logSubmissionActivity') ||
        content.includes('addActivityLog');
}

/**
 * Kiểm tra xem file có gọi hàm log không
 * @param {string} content - Nội dung file
 * @returns {boolean}
 */
function hasLogCalls(content) {
    return content.includes('logActivity(') ||
        content.includes('logUIInteraction(') ||
        content.includes('logLogin(') ||
        content.includes('logPageView(') ||
        content.includes('logSubmissionActivity(') ||
        content.includes('addActivityLog(');
}

/**
 * Đếm số lượng pattern khớp trong file
 * @param {string} content - Nội dung file
 * @param {RegExp} pattern - Pattern cần tìm
 * @returns {number}
 */
function countPatternMatches(content, pattern) {
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
}

/**
 * Đọc file và kiểm tra nội dung
 * @param {string} filePath - Đường dẫn file
 * @returns {Promise<{needsLogging: boolean, hasImport: boolean, hasLogCalls: boolean, patterns: Object}>}
 */
async function analyzeFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');

        // Kiểm tra import và gọi hàm log
        const hasImport = hasLogImport(content);
        const hasLogs = hasLogCalls(content);

        // Đếm các pattern
        const patternMatches = {};
        let totalPatterns = 0;

        for (const [name, pattern] of Object.entries(PATTERNS)) {
            const count = countPatternMatches(content, pattern);
            patternMatches[name] = count;
            totalPatterns += count;
        }

        // File cần thêm log nếu có pattern nhưng không có log
        const needsLogging = totalPatterns > 0 && !hasLogs;

        return {
            needsLogging,
            hasImport,
            hasLogCalls: hasLogs,
            patterns: patternMatches
        };
    } catch (error) {
        console.error(`Lỗi phân tích file ${filePath}:`, error.message);
        return {
            needsLogging: false,
            hasImport: false,
            hasLogCalls: false,
            patterns: {}
        };
    }
}

/**
 * Quét thư mục để tìm các file cần phân tích
 * @param {string} dir - Thư mục gốc
 * @returns {Promise<string[]>} - Danh sách đường dẫn file
 */
async function scanDirectory(dir) {
    const files = [];

    async function scan(directory) {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            // Bỏ qua các thư mục và file bị loại trừ
            const relativePath = path.relative(process.cwd(), fullPath);
            const dirName = entry.isDirectory() ? entry.name : path.dirname(relativePath);

            if (EXCLUDED_DIRS.some(excluded => dirName.includes(excluded))) {
                continue;
            }

            if (entry.isDirectory()) {
                await scan(fullPath);
            } else {
                // Chỉ xử lý các file .js, .ts, .jsx, .tsx
                if (fullPath.match(/\.(js|ts|jsx|tsx)$/) &&
                    !EXCLUDED_FILES.some(excluded => fullPath.endsWith(excluded))) {
                    files.push(relativePath);
                }
            }
        }
    }

    await scan(dir);
    return files;
}

/**
 * Tìm các component không có log
 * @returns {Promise<void>}
 */
async function findComponentsWithoutLogs() {
    try {
        console.log('🔍 Phân tích cấu trúc ứng dụng để tìm nơi cần thêm log hoạt động');
        console.log('='.repeat(80));

        // Quét thư mục để tìm các file cần phân tích
        const files = await scanDirectory(process.cwd());
        console.log(`Tìm thấy ${files.length} file để phân tích`);

        // Phân tích từng file
        const results = [];

        for (const file of files) {
            // Bỏ qua các file đã biết có log
            if (FILES_WITH_LOGS.some(logFile => file.includes(logFile))) {
                continue;
            }

            const analysis = await analyzeFile(file);

            if (analysis.needsLogging) {
                results.push({
                    file,
                    ...analysis
                });
            }
        }

        // Sắp xếp kết quả theo mức độ ưu tiên
        results.sort((a, b) => {
            // Tính tổng pattern cho mỗi file
            const sumA = Object.values(a.patterns).reduce((sum, count) => sum + count, 0);
            const sumB = Object.values(b.patterns).reduce((sum, count) => sum + count, 0);

            return sumB - sumA;
        });

        // Hiển thị kết quả
        console.log('\n=== CÁC COMPONENT CẦN THÊM LOG HOẠT ĐỘNG ===');

        if (results.length === 0) {
            console.log('Không tìm thấy component nào cần thêm log hoạt động.');
        } else {
            console.log(`Tìm thấy ${results.length} component cần thêm log hoạt động:\n`);

            for (const [index, result] of results.entries()) {
                console.log(`${index + 1}. ${result.file}`);

                // Hiển thị các pattern được tìm thấy
                const patterns = Object.entries(result.patterns)
                    .filter(([_, count]) => count > 0)
                    .map(([name, count]) => `${name}: ${count}`)
                    .join(', ');

                console.log(`   - Phát hiện: ${patterns}`);

                // Gợi ý loại log cần thêm
                const suggestions = [];

                if (result.patterns.BUTTON_CLICK > 0 || result.patterns.USER_INPUT > 0) {
                    suggestions.push('logUIInteraction()');
                }

                if (result.patterns.FORM_SUBMIT > 0) {
                    suggestions.push('logActivity() hoặc logUIInteraction()');
                }

                if (result.patterns.AUTH_OPERATIONS > 0) {
                    suggestions.push('logLogin(), logRegistration()');
                }

                if (result.patterns.API_CALLS > 0) {
                    suggestions.push('logActivity()');
                }

                if (result.patterns.MODAL_DIALOG > 0) {
                    suggestions.push('logUIInteraction()');
                }

                console.log(`   - Gợi ý: Thêm ${suggestions.join(', ')}`);
                console.log('');
            }

            // Gợi ý cách thêm log
            console.log('\n=== CÁCH THÊM LOG HOẠT ĐỘNG ===');
            console.log('1. Import các hàm log:');
            console.log('   ```');
            console.log('   import { logUIInteraction, logActivity } from "@/lib/client-activity-log";');
            console.log('   ```');

            console.log('\n2. Thêm log cho các sự kiện:');
            console.log('   ```');
            console.log('   // Cho nút');
            console.log('   onClick={() => {');
            console.log('     logUIInteraction("button", "save-profile", { section: "settings" });');
            console.log('     // Xử lý logic');
            console.log('   }}');
            console.log('   ```');

            console.log('\n3. Thêm log cho form:');
            console.log('   ```');
            console.log('   const handleSubmit = async (data) => {');
            console.log('     logUIInteraction("form", "update-profile", { fields: Object.keys(data) });');
            console.log('     // Xử lý logic');
            console.log('   }');
            console.log('   ```');

            console.log('\nXem thêm chi tiết trong docs/activity-log-system.md');
        }

    } catch (error) {
        console.error('Lỗi:', error.message);
    }
}

// Chạy phân tích
if (import.meta.url === `file://${process.argv[1]}`) {
    findComponentsWithoutLogs().catch(console.error);
}

export { findComponentsWithoutLogs };
