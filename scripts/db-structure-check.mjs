// @ts-check
/**
 * Script kiểm tra và xác nhận cấu trúc database
 * Cách sử dụng: node scripts/db-structure-check.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy directory hiện tại
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Cấu hình
const config = {
    // Danh sách file models/schemas/services cần kiểm tra
    files: [
        { path: './lib/database-service.ts', type: 'service' },
        { path: './lib/multi-database-service.ts', type: 'service' },
        { path: './lib/authorization-service.ts', type: 'service' },
        { path: './types/submission.ts', type: 'type' },
        { path: './types/user.ts', type: 'type' },
    ],
    // Database config files
    configFiles: [
        './storage-config.json',
    ],
    // Output file
    outputFile: path.join(rootDir, 'logs', 'db-structure.md'),
};

/**
 * Đọc nội dung file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readFile(filePath) {
    try {
        return await fs.readFile(path.join(rootDir, filePath), 'utf-8');
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        return '';
    }
}

/**
 * Phân tích file TypeScript để tìm interface, type và class
 * @param {string} content
 * @param {string} type
 * @returns {Object}
 */
function analyzeTypeScriptFile(content, type) {
    const result = {
        interfaces: [],
        types: [],
        classes: [],
        methods: [],
        imports: [],
    };

    // Tìm imports
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+([^\s]+)|([^\s,]+))\s+from\s+['"]([^'"]+)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(content)) !== null) {
        const namedImports = importMatch[1] ? importMatch[1].split(',').map(i => i.trim()) : [];
        const namespaceImport = importMatch[2];
        const defaultImport = importMatch[3];
        const source = importMatch[4];

        result.imports.push({
            source,
            namedImports,
            namespaceImport,
            defaultImport,
        });
    }

    // Tìm interfaces
    const interfaceRegex = /interface\s+([^\s{]+)\s*(?:extends\s+([^\s{]+))?\s*{([^}]*)}/g;
    let interfaceMatch;
    while ((interfaceMatch = interfaceRegex.exec(content)) !== null) {
        const name = interfaceMatch[1];
        const extends_ = interfaceMatch[2];
        const body = interfaceMatch[3];

        // Parse properties
        const properties = body.split(';')
            .map(prop => prop.trim())
            .filter(Boolean)
            .map(prop => {
                const [propName, ...rest] = prop.split(':');
                const propType = rest.join(':').trim();
                return { name: propName.trim(), type: propType };
            });

        result.interfaces.push({
            name,
            extends: extends_,
            properties,
        });
    }

    // Tìm types
    const typeRegex = /type\s+([^\s=]+)\s*=\s*([^;]+)/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(content)) !== null) {
        const name = typeMatch[1];
        const definition = typeMatch[2];

        result.types.push({
            name,
            definition,
        });
    }

    // Tìm classes (nếu là file service)
    if (type === 'service') {
        const classRegex = /class\s+([^\s{]+)(?:\s+extends\s+([^\s{]+))?(?:\s+implements\s+([^\s{]+))?\s*{([^}]*)}/g;
        let classMatch;
        while ((classMatch = classRegex.exec(content)) !== null) {
            const name = classMatch[1];
            const extends_ = classMatch[2];
            const implements_ = classMatch[3];
            const body = classMatch[4];

            // Parse methods
            const methodRegex = /(?:public|private|protected|async)?\s*([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*{/g;
            const methods = [];
            let methodMatch;

            while ((methodMatch = methodRegex.exec(body)) !== null) {
                const methodName = methodMatch[1];
                const params = methodMatch[2];
                const returnType = methodMatch[3];

                methods.push({
                    name: methodName,
                    params: params.split(',').map(p => p.trim()).filter(Boolean),
                    returnType: returnType ? returnType.trim() : 'void',
                });
            }

            result.classes.push({
                name,
                extends: extends_,
                implements: implements_,
                methods,
            });

            // Add methods to separate array for easier reference
            methods.forEach(method => {
                result.methods.push({
                    className: name,
                    ...method,
                });
            });
        }
    }

    return result;
}

/**
 * Tạo Markdown report
 * @param {Object} data
 * @returns {string}
 */
function generateMarkdownReport(data) {
    let markdown = `# Database Structure Analysis\n\n`;
    markdown += `Report generated on: ${new Date().toISOString()}\n\n`;

    // Config files
    markdown += `## Database Config\n\n`;
    for (const configFile of data.configFiles) {
        markdown += `### ${configFile.name}\n\n`;

        if (configFile.content) {
            try {
                // Try to parse as JSON
                const json = JSON.parse(configFile.content);
                markdown += '```json\n';
                markdown += JSON.stringify(json, null, 2);
                markdown += '\n```\n\n';
            } catch {
                // Not valid JSON, just output as text
                markdown += '```\n';
                markdown += configFile.content;
                markdown += '\n```\n\n';
            }
        } else {
            markdown += '*File không tồn tại hoặc không thể đọc*\n\n';
        }
    }

    // Types
    markdown += `## Data Models\n\n`;

    const typeFiles = data.files.filter(f => f.type === 'type');
    for (const file of typeFiles) {
        markdown += `### ${file.path}\n\n`;

        if (file.analysis) {
            // Interfaces
            if (file.analysis.interfaces.length > 0) {
                markdown += `#### Interfaces\n\n`;

                for (const iface of file.analysis.interfaces) {
                    markdown += `##### \`${iface.name}\`${iface.extends ? ` extends ${iface.extends}` : ''}\n\n`;

                    // Properties table
                    markdown += `| Property | Type |\n`;
                    markdown += `|----------|------|\n`;

                    for (const prop of iface.properties) {
                        markdown += `| \`${prop.name}\` | \`${prop.type}\` |\n`;
                    }

                    markdown += '\n';
                }
            }

            // Types
            if (file.analysis.types.length > 0) {
                markdown += `#### Types\n\n`;

                for (const type of file.analysis.types) {
                    markdown += `##### \`${type.name}\`\n\n`;
                    markdown += `\`\`\`typescript\ntype ${type.name} = ${type.definition}\n\`\`\`\n\n`;
                }
            }
        } else {
            markdown += '*File không tồn tại hoặc không thể phân tích*\n\n';
        }
    }

    // Services
    markdown += `## Database Services\n\n`;

    const serviceFiles = data.files.filter(f => f.type === 'service');
    for (const file of serviceFiles) {
        markdown += `### ${file.path}\n\n`;

        if (file.analysis) {
            // Imports
            markdown += `#### Imports\n\n`;
            markdown += '```typescript\n';
            for (const imp of file.analysis.imports) {
                let importStr = 'import ';

                if (imp.defaultImport) {
                    importStr += imp.defaultImport;
                }

                if (imp.namedImports.length > 0) {
                    if (imp.defaultImport) importStr += ', ';
                    importStr += `{ ${imp.namedImports.join(', ')} }`;
                }

                if (imp.namespaceImport) {
                    importStr += `* as ${imp.namespaceImport}`;
                }

                importStr += ` from '${imp.source}';`;
                markdown += `${importStr}\n`;
            }
            markdown += '```\n\n';

            // Classes
            if (file.analysis.classes.length > 0) {
                markdown += `#### Classes\n\n`;

                for (const cls of file.analysis.classes) {
                    let classHeader = `##### \`${cls.name}\``;
                    if (cls.extends) classHeader += ` extends \`${cls.extends}\``;
                    if (cls.implements) classHeader += ` implements \`${cls.implements}\``;

                    markdown += `${classHeader}\n\n`;

                    // Methods table
                    markdown += `| Method | Parameters | Return Type |\n`;
                    markdown += `|--------|------------|------------|\n`;

                    for (const method of cls.methods) {
                        const params = method.params.join(', ');
                        markdown += `| \`${method.name}\` | \`${params}\` | \`${method.returnType}\` |\n`;
                    }

                    markdown += '\n';
                }
            }
        } else {
            markdown += '*File không tồn tại hoặc không thể phân tích*\n\n';
        }
    }

    // Method tổng hợp
    markdown += `## Summary of Database Methods\n\n`;
    markdown += `| Service | Method | Parameters | Return Type |\n`;
    markdown += `|---------|--------|------------|------------|\n`;

    const allMethods = [];
    for (const file of serviceFiles) {
        if (file.analysis && file.analysis.methods) {
            for (const method of file.analysis.methods) {
                allMethods.push({
                    service: file.path,
                    className: method.className,
                    name: method.name,
                    params: method.params.join(', '),
                    returnType: method.returnType,
                });
            }
        }
    }

    // Sort methods by service and then method name
    allMethods.sort((a, b) => {
        if (a.service !== b.service) return a.service.localeCompare(b.service);
        return a.name.localeCompare(b.name);
    });

    for (const method of allMethods) {
        markdown += `| \`${method.className}\` | \`${method.name}\` | \`${method.params}\` | \`${method.returnType}\` |\n`;
    }

    return markdown;
}

/**
 * Lưu report vào file
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
    console.log('🔍 Analyzing database structure...');

    const data = {
        files: [],
        configFiles: [],
    };

    // Đọc và phân tích các file cấu trúc
    for (const fileConfig of config.files) {
        console.log(`📖 Reading file: ${fileConfig.path}`);

        const content = await readFile(fileConfig.path);

        if (content) {
            const analysis = analyzeTypeScriptFile(content, fileConfig.type);

            data.files.push({
                ...fileConfig,
                content,
                analysis,
            });
        } else {
            data.files.push({
                ...fileConfig,
                content: null,
                analysis: null,
            });
        }
    }

    // Đọc các file config
    for (const configPath of config.configFiles) {
        console.log(`📖 Reading config file: ${configPath}`);

        const content = await readFile(configPath);

        data.configFiles.push({
            name: configPath,
            content,
        });
    }

    // Tạo report
    console.log('📊 Generating report...');
    const report = generateMarkdownReport(data);

    // Lưu report
    await saveReport(report, config.outputFile);

    console.log('✅ Analysis complete!');
}

// Chạy script
main().catch(console.error);
