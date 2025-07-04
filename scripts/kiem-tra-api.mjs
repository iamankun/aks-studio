// @ts-check
/**
 * Script để kiểm tra tất cả API route trong Next.js
 * Chạy: node scripts/api-routes-check.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Config
const config = {
    apiRoot: path.join(rootDir, 'app', 'api'),
    logFile: path.join(rootDir, 'logs', 'api-routes-check.log'),
    exclude: ['.DS_Store', '.git', 'node_modules']
};

/**
 * Phân tích một file route.ts/js để xác định phương thức HTTP
 * @param {string} filePath
 * @returns {Promise<string[]>}
 */
async function analyzeRouteFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const methods = [];

        // Tìm các phương thức HTTP (GET, POST, PUT, DELETE, PATCH, OPTIONS)
        if (content.includes('export async function GET') || content.includes('export function GET')) {
            methods.push('GET');
        }
        if (content.includes('export async function POST') || content.includes('export function POST')) {
            methods.push('POST');
        }
        if (content.includes('export async function PUT') || content.includes('export function PUT')) {
            methods.push('PUT');
        }
        if (content.includes('export async function DELETE') || content.includes('export function DELETE')) {
            methods.push('DELETE');
        }
        if (content.includes('export async function PATCH') || content.includes('export function PATCH')) {
            methods.push('PATCH');
        }
        if (content.includes('export async function OPTIONS') || content.includes('export function OPTIONS')) {
            methods.push('OPTIONS');
        }

        return methods;
    } catch (error) {
        console.error(`Error analyzing file ${filePath}:`, error);
        return [];
    }
}

/**
 * Chuyển đổi đường dẫn hệ thống thành API route
 * @param {string} filePath
 * @returns {string}
 */
function convertToApiRoute(filePath) {
    // Loại bỏ đường dẫn gốc và extension
    let relativePath = filePath.replace(config.apiRoot, '')
        .replace(/\\/g, '/') // Chuyển đổi Windows path separator
        .replace(/\/route\.(js|ts)$/i, '');

    // Xử lý các route động (với [param])
    const dynamicSegments = relativePath.match(/\/\[(.*?)\]/g);
    if (dynamicSegments) {
        dynamicSegments.forEach(segment => {
            const paramName = segment.match(/\[(.*?)\]/)[1];
            relativePath = relativePath.replace(segment, `/{${paramName}}`);
        });
    }

    return `/api${relativePath}`;
}

/**
 * Quét đệ quy để tìm tất cả các route file
 * @param {string} dir
 * @param {Array} results
 * @returns {Promise<Array>}
 */
async function scanRoutes(dir, results = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Bỏ qua các thư mục/file trong danh sách loại trừ
        if (config.exclude.includes(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            await scanRoutes(fullPath, results);
        } else if (
            (entry.name === 'route.js' || entry.name === 'route.ts') &&
            !entry.name.startsWith('_')
        ) {
            const methods = await analyzeRouteFile(fullPath);
            const apiRoute = convertToApiRoute(fullPath);

            results.push({
                file: path.relative(rootDir, fullPath),
                apiRoute,
                methods,
            });
        }
    }

    return results;
}

/**
 * Tạo báo cáo tổng hợp
 * @param {Array} routes
 * @returns {string}
 */
function generateReport(routes) {
    let report = `# API Routes Check - ${new Date().toISOString()}\n\n`;

    report += `Total routes found: ${routes.length}\n\n`;

    report += `## API Routes\n\n`;

    // Table header
    report += `| API Route | File | HTTP Methods |\n`;
    report += `|-----------|------|-------------|\n`;

    // Sort routes alphabetically
    routes.sort((a, b) => a.apiRoute.localeCompare(b.apiRoute));

    // Generate table rows
    for (const route of routes) {
        const methodsStr = route.methods.length ? route.methods.join(', ') : 'None';
        report += `| \`${route.apiRoute}\` | ${route.file} | ${methodsStr} |\n`;
    }

    report += `\n## Grouped by HTTP Method\n\n`;

    // Group by method
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

    for (const method of httpMethods) {
        const routesWithMethod = routes.filter(r => r.methods.includes(method));

        if (routesWithMethod.length === 0) continue;

        report += `### ${method}\n\n`;

        for (const route of routesWithMethod) {
            report += `- \`${route.apiRoute}\`\n`;
        }

        report += `\n`;
    }

    // Empty methods
    const routesWithoutMethods = routes.filter(r => r.methods.length === 0);
    if (routesWithoutMethods.length > 0) {
        report += `### Routes Without HTTP Methods\n\n`;

        for (const route of routesWithoutMethods) {
            report += `- \`${route.apiRoute}\` (${route.file})\n`;
        }

        report += `\n`;
    }

    return report;
}

/**
 * Lưu báo cáo vào file
 * @param {string} content
 */
async function saveReport(content) {
    try {
        // Đảm bảo thư mục logs tồn tại
        await fs.mkdir(path.dirname(config.logFile), { recursive: true });

        await fs.writeFile(config.logFile, content, 'utf-8');
        console.log(`📝 Report saved to: ${config.logFile}`);
    } catch (error) {
        console.error('❌ Error saving report:', error);
    }
}

/**
 * Hàm chính
 */
async function main() {
    console.log('🔍 Scanning API routes...');

    try {
        const routes = await scanRoutes(config.apiRoot);

        console.log(`✅ Found ${routes.length} API routes`);

        // Generate report
        const report = generateReport(routes);

        // Display summary
        console.log('\n📊 API Routes Summary:');

        // Group by method
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        for (const method of httpMethods) {
            const count = routes.filter(r => r.methods.includes(method)).length;
            console.log(`- ${method}: ${count} routes`);
        }

        // Display routes with issues
        const routesWithoutMethods = routes.filter(r => r.methods.length === 0);
        if (routesWithoutMethods.length > 0) {
            console.log(`\n⚠️ ${routesWithoutMethods.length} routes without HTTP methods:`);
            for (const route of routesWithoutMethods) {
                console.log(`  - ${route.apiRoute} (${route.file})`);
            }
        }

        // Save report
        await saveReport(report);

        // Display table
        console.log('\n📋 API Routes:');
        for (const route of routes) {
            console.log(`${route.apiRoute} [${route.methods.join(', ')}]`);
        }

    } catch (error) {
        console.error('❌ Error scanning API routes:', error);
    }
}

// Run the script
main().catch(console.error);
