/**
 * Script cài đặt các dependencies cần thiết cho debug
 * Cách sử dụng: node scripts/install-debug-tools.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lấy đường dẫn gốc của dự án
const rootDir = path.join(__dirname, '..');

// Danh sách dependencies cần thiết
const dependencies = {
    // HTTP client
    axios: "^1.6.2",

    // Utils
    chalk: "^5.3.0",
    dotenv: "^16.3.1",

    // Testing
    jest: "^29.7.0",
    supertest: "^6.3.3",
};

// Danh sách dev dependencies
const devDependencies = {
    "@types/jest": "^29.5.10",
    "@types/supertest": "^2.0.16",
};

// Màu sắc cho console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};

// Logo
console.log(`
${colors.cyan}╔═══════════════════════════════════════════╗
║ ${colors.bright}An Kun Studio Digital Music${colors.reset}${colors.cyan}                ║
║ ${colors.bright}Debug Tools Installer${colors.reset}${colors.cyan}                      ║
╚═══════════════════════════════════════════╝${colors.reset}
`);

// Kiểm tra package.json
console.log(`${colors.bright}Checking project configuration...${colors.reset}`);

const packageJsonPath = path.join(rootDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error(`${colors.red}Error: package.json not found!${colors.reset}`);
    process.exit(1);
}

// Đọc package.json
let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
} catch (error) {
    console.error(`${colors.red}Error reading package.json: ${error.message}${colors.reset}`);
    process.exit(1);
}

// Kiểm tra các dependencies đã cài đặt
console.log(`${colors.bright}Checking installed dependencies...${colors.reset}`);

const missingDeps = [];
const missingDevDeps = [];

for (const [dep, version] of Object.entries(dependencies)) {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        missingDeps.push(`${dep}@${version}`);
    }
}

for (const [dep, version] of Object.entries(devDependencies)) {
    if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
        missingDevDeps.push(`${dep}@${version}`);
    }
}

// Cài đặt dependencies còn thiếu
if (missingDeps.length > 0) {
    console.log(`${colors.yellow}Installing missing dependencies: ${missingDeps.join(', ')}${colors.reset}`);
    try {
        execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        console.log(`${colors.green}Dependencies installed successfully!${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Error installing dependencies: ${error.message}${colors.reset}`);
        process.exit(1);
    }
} else {
    console.log(`${colors.green}All dependencies are already installed.${colors.reset}`);
}

// Cài đặt dev dependencies còn thiếu
if (missingDevDeps.length > 0) {
    console.log(`${colors.yellow}Installing missing dev dependencies: ${missingDevDeps.join(', ')}${colors.reset}`);
    try {
        execSync(`npm install --save-dev ${missingDevDeps.join(' ')}`, { stdio: 'inherit' });
        console.log(`${colors.green}Dev dependencies installed successfully!${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Error installing dev dependencies: ${error.message}${colors.reset}`);
        process.exit(1);
    }
} else {
    console.log(`${colors.green}All dev dependencies are already installed.${colors.reset}`);
}

// Tạo script debug mới trong package.json nếu chưa có
if (!packageJson.scripts) {
    packageJson.scripts = {};
}

const scripts = {
    "debug:api": "node scripts/debug-api.mjs",
    "debug:routes": "node scripts/api-routes-check.mjs",
    "debug:db": "node scripts/db-structure-check.mjs",
    "debug:auth": "node scripts/test-authorization.js",
    "debug:handlers": "node scripts/check-route-handlers.mjs",
    "test:api": "node scripts/test-submissions-api.mjs",
};

let scriptsAdded = false;

for (const [name, command] of Object.entries(scripts)) {
    if (!packageJson.scripts[name]) {
        packageJson.scripts[name] = command;
        scriptsAdded = true;
    }
}

if (scriptsAdded) {
    console.log(`${colors.yellow}Adding debug scripts to package.json...${colors.reset}`);
    try {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        console.log(`${colors.green}Scripts added successfully!${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Error updating package.json: ${error.message}${colors.reset}`);
        process.exit(1);
    }
} else {
    console.log(`${colors.green}All debug scripts are already configured.${colors.reset}`);
}

// Đảm bảo thư mục logs tồn tại
const logDirs = [
    path.join(rootDir, 'logs'),
    path.join(rootDir, 'logs', 'api-debug'),
    path.join(rootDir, 'logs', 'api-test'),
    path.join(rootDir, 'logs', 'db'),
    path.join(rootDir, 'logs', 'auth'),
];

console.log(`${colors.bright}Creating log directories...${colors.reset}`);

for (const dir of logDirs) {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`${colors.green}Created directory: ${dir}${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}Error creating directory ${dir}: ${error.message}${colors.reset}`);
        }
    }
}

// Hiển thị hướng dẫn sử dụng
console.log(`
${colors.bright}${colors.green}✅ Debug tools installed successfully!${colors.reset}

${colors.bright}Available debug commands:${colors.reset}
- ${colors.cyan}npm run debug:api${colors.reset} - Test API endpoints
- ${colors.cyan}npm run debug:routes${colors.reset} - Check API routes
- ${colors.cyan}npm run debug:db${colors.reset} - Analyze database structure
- ${colors.cyan}npm run debug:auth${colors.reset} - Test authentication
- ${colors.cyan}npm run debug:handlers${colors.reset} - Check API route handlers
- ${colors.cyan}npm run test:api${colors.reset} - Test submissions API

${colors.bright}Documentation:${colors.reset}
- See ${colors.cyan}debug-guide.md${colors.reset} for comprehensive debug guide
- See ${colors.cyan}api-debug-guide.md${colors.reset} for API debugging

${colors.bright}Happy debugging!${colors.reset}
`);
