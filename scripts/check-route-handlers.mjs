// @ts-check
/**
 * Script kiểm tra định nghĩa handlers trong các file API route.ts
 * Cách sử dụng: node scripts/check-route-handlers.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy directory hiện tại
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Cấu hình
const config = {
    apiRoot: path.join(rootDir, 'app', 'api'),
    outputFile: path.join(rootDir, 'logs', 'route-handlers-check.md'),
    excludeFolders: ['.git', 'node_modules', '.next'],
};

// HTTP Methods cần kiểm tra
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

/**
 * Đọc nội dung file
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
async function readFileContent(filePath) {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Phân tích file route.ts để tìm các handlers
 * @param {string} content
 * @returns {Object}
 */
function analyzeRouteFile(content) {
    const result = {
        handlers: [],
        imports: [],
        issues: [],
    };

    // Kiểm tra file có rỗng không
    if (!content || content.trim() === '') {
        result.issues.push('Empty file');
        return result;
    }

    // Tìm imports
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+([^\s]+)|([^\s,]+))\s+from\s+['"]([^'"]+)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
        const source = importMatch[4];
        result.imports.push(source);
    }

    // Tìm handler cho mỗi HTTP method
    for (const method of HTTP_METHODS) {
        const handlerRegex = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\s*\\(([^)]*)\\)`, 'g');
        let handlerMatch;

        while ((handlerMatch = handlerRegex.exec(content)) !== null) {
            const isAsync = !!handlerMatch[1];
            const params = handlerMatch[2];

            result.handlers.push({
                method,
                isAsync,
                params: params.split(',').map(p => p.trim()).filter(Boolean),
                position: handlerMatch.index,
            });
        }
    }

    // Kiểm tra các vấn đề phổ biến

    // 1. Thiếu method OPTIONS
    if (!result.handlers.some(h => h.method === 'OPTIONS') &&
        (result.handlers.some(h => h.method === 'POST') ||
            result.handlers.some(h => h.method === 'PUT') ||
            result.handlers.some(h => h.method === 'DELETE'))) {
        result.issues.push('Missing OPTIONS method handler for CORS preflight requests');
    }

    // 2. Kiểm tra request parameter
    for (const handler of result.handlers) {
        if (handler.params.length === 0) {
            result.issues.push(`${handler.method} handler missing request parameter`);
        } else {
            // Kiểm tra có dùng NextRequest không
            const hasNextRequest = handler.params.some(p => p.includes('NextRequest'));
            if (!hasNextRequest) {
                result.issues.push(`${handler.method} handler should use NextRequest type`);
            }
        }
    }

    // 3. Kiểm tra imports cần thiết
    const requiredImports = ['next/server'];
    for (const imp of requiredImports) {
        if (!result.imports.some(i => i.includes(imp))) {
            result.issues.push(`Missing import from '${imp}'`);
        }
    }

    return result;
}

/**
 * Quét đệ quy tất cả file route.ts
 * @param {string} dir
 * @param {Array} results
 * @returns {Promise<Array>}
 */
async function scanRouteFiles(dir, results = []) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // Bỏ qua các thư mục loại trừ
            if (config.excludeFolders.includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                await scanRouteFiles(fullPath, results);
            } else if (
                (entry.name === 'route.ts' || entry.name === 'route.js') &&
                !entry.name.startsWith('_')
            ) {
                const content = await readFileContent(fullPath);
                if (content !== null) {
                    const analysis = analyzeRouteFile(content);

                    // Tạo API path từ file path
                    const apiPath = fullPath
                        .replace(config.apiRoot, '')
                        .replace(/\\/g, '/')
                        .replace(/\/route\.(js|ts)$/i, '');

                    results.push({
                        file: fullPath,
                        apiPath: `/api${apiPath}`,
                        handlers: analysis.handlers,
                        imports: analysis.imports,
                        issues: analysis.issues,
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error(`❌ Error scanning directory ${dir}:`, error);
        return results;
    }
}

/**
 * Tạo báo cáo Markdown
 * @param {Array} routeFiles
 * @returns {string}
 */
function generateReport(routeFiles) {
    let report = `# API Route Handlers Check\n\n`;
    report += `Report generated on: ${new Date().toISOString()}\n\n`;

    // Tổng quan
    report += `## Overview\n\n`;
    report += `- Total route files: ${routeFiles.length}\n`;

    const totalHandlers = routeFiles.reduce((total, route) => total + route.handlers.length, 0);
    report += `- Total handlers: ${totalHandlers}\n`;

    const routesWithIssues = routeFiles.filter(r => r.issues.length > 0);
    report += `- Routes with issues: ${routesWithIssues.length}\n\n`;

    // Danh sách tất cả các routes
    report += `## API Routes\n\n`;
    report += `| API Path | HTTP Methods | Issues |\n`;
    report += `|----------|--------------|--------|\n`;

    // Sort routes by path
    routeFiles.sort((a, b) => a.apiPath.localeCompare(b.apiPath));

    for (const route of routeFiles) {
        const methods = route.handlers.map(h => h.method).join(', ');
        const issues = route.issues.length > 0 ? '⚠️ Yes' : '✅ No';

        report += `| \`${route.apiPath}\` | ${methods} | ${issues} |\n`;
    }

    // Chi tiết về các routes có issues
    if (routesWithIssues.length > 0) {
        report += `\n## Routes with Issues\n\n`;

        for (const route of routesWithIssues) {
            report += `### ${route.apiPath}\n\n`;
            report += `File: \`${route.file}\`\n\n`;

            report += `#### Issues:\n\n`;
            for (const issue of route.issues) {
                report += `- ⚠️ ${issue}\n`;
            }

            report += `\n#### Handlers:\n\n`;
            for (const handler of route.handlers) {
                report += `- ${handler.isAsync ? 'async ' : ''}function ${handler.method}(${handler.params.join(', ')})\n`;
            }

            report += `\n#### Imports:\n\n`;
            for (const imp of route.imports) {
                report += `- ${imp}\n`;
            }

            report += `\n`;
        }
    }

    // Phân tích theo HTTP method
    report += `\n## Analysis by HTTP Method\n\n`;

    const methodCounts = {};
    HTTP_METHODS.forEach(method => {
        methodCounts[method] = 0;
    });

    for (const route of routeFiles) {
        for (const handler of route.handlers) {
            methodCounts[handler.method]++;
        }
    }

    report += `| HTTP Method | Count |\n`;
    report += `|------------|-------|\n`;

    for (const method of HTTP_METHODS) {
        report += `| ${method} | ${methodCounts[method]} |\n`;
    }

    // Best practices
    report += `\n## Best Practices for API Routes\n\n`;

    report += `1. **Always include OPTIONS method** for CORS preflight requests when using POST, PUT, or DELETE.\n`;
    report += `2. **Use NextRequest and NextResponse** from 'next/server' for type safety.\n`;
    report += `3. **Add CORS headers** in all response handlers and in OPTIONS handler.\n`;
    report += `4. **Proper error handling** with try/catch blocks and meaningful error responses.\n`;
    report += `5. **Consistent response format** across all API endpoints.\n`;
    report += `6. **Authentication checks** at the beginning of handlers when required.\n`;
    report += `7. **Validate input data** before processing.\n`;

    return report;
}

/**
 * Lưu báo cáo vào file
 * @param {string} content
 * @param {string} filePath
 */
async function saveReport(content, filePath) {
    try {
        // Đảm bảo thư mục logs tồn tại
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`📝 Report saved to: ${filePath}`);
    } catch (error) {
        console.error('❌ Error saving report:', error);
    }
}

/**
 * Hàm chính
 */
async function main() {
    console.log('🔍 Checking API route handlers...');

    try {
        // Quét tất cả file route.ts
        const routeFiles = await scanRouteFiles(config.apiRoot);

        console.log(`✅ Found ${routeFiles.length} API route files`);

        // Đếm số lượng issues
        const totalIssues = routeFiles.reduce((total, route) => total + route.issues.length, 0);

        // Hiển thị thông tin tổng quan
        console.log(`📊 Overview:`);
        console.log(`- Total API routes: ${routeFiles.length}`);
        console.log(`- Routes with issues: ${routeFiles.filter(r => r.issues.length > 0).length}`);
        console.log(`- Total issues found: ${totalIssues}`);

        // Tạo báo cáo
        const report = generateReport(routeFiles);

        // Lưu báo cáo
        await saveReport(report, config.outputFile);

        // Hiển thị các routes có issues
        if (totalIssues > 0) {
            console.log(`\n⚠️ Issues found in the following routes:`);

            for (const route of routeFiles.filter(r => r.issues.length > 0)) {
                console.log(`- ${route.apiPath} (${route.issues.length} issues)`);
            }

            console.log(`\nCheck the report for details: ${config.outputFile}`);
        } else {
            console.log(`\n✅ No issues found in API routes!`);
        }

    } catch (error) {
        console.error('❌ Error checking API route handlers:', error);
    }
}

// Chạy script
main().catch(console.error);
