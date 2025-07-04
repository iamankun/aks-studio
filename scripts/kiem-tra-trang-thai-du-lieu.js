// Debug Database Status - Check for Supabase references
// Kiểm tra tất cả endpoints có thể trả về thông tin database

const BASE_URL = 'http://localhost:3000';

console.log('🔍 DEBUGGING DATABASE STATUS - SUPABASE CHECK');
console.log('==============================================');

// List các endpoints cần kiểm tra
const ENDPOINTS_TO_CHECK = [
    '/api/database-status',
    '/api/submissions',
    '/api/submissions/statistics',
    '/api/artists',
    '/api/debug',
    '/api/health'
];

// Demo auth credentials
const AUTH_HEADER = 'Basic ' + Buffer.from('admin:admin').toString('base64');

async function checkEndpoint(endpoint) {
    console.log(`\n🔍 Checking: ${endpoint}`);
    console.log(''.padEnd(50, '-'));

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_HEADER
            }
        });

        console.log(`📊 Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            const jsonString = JSON.stringify(data, null, 2);

            // Check for Supabase references
            const supabaseReferences = [
                'supabase',
                'Supabase',
                'SUPABASE',
                'supabase.co',
                'sb-'
            ];

            let foundSupabase = false;
            const foundRefs = [];

            supabaseReferences.forEach(ref => {
                if (jsonString.toLowerCase().includes(ref.toLowerCase())) {
                    foundSupabase = true;
                    foundRefs.push(ref);
                }
            });

            if (foundSupabase) {
                console.log(`🚨 FOUND SUPABASE REFERENCES: ${foundRefs.join(', ')}`);
                console.log('📄 Response (truncated):');
                console.log(jsonString.substring(0, 500) + (jsonString.length > 500 ? '...' : ''));
            } else {
                console.log('✅ No Supabase references found');

                // Show database-related info
                if (data.databases || data.database || data.source) {
                    console.log('📊 Database info found:');
                    if (data.databases) console.log(`   📋 Databases: ${Object.keys(data.databases).join(', ')}`);
                    if (data.database) console.log(`   📋 Database: ${JSON.stringify(data.database)}`);
                    if (data.source) console.log(`   📋 Source: ${data.source}`);
                    if (data.primary) console.log(`   📋 Primary: ${data.primary}`);
                }
            }

            // Check response size
            const responseSize = jsonString.length;
            console.log(`📏 Response size: ${responseSize} characters`);

        } else {
            const errorText = await response.text();
            console.log(`❌ Error: ${errorText}`);
        }

    } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
    }
}

// Check tất cả environment variables có Supabase
function checkEnvironmentVariables() {
    console.log('\n🌍 CHECKING ENVIRONMENT VARIABLES');
    console.log('==================================');

    const envVars = process.env;
    const supabaseEnvVars = [];

    Object.keys(envVars).forEach(key => {
        if (key.toLowerCase().includes('supabase') ||
            (envVars[key] && envVars[key].toLowerCase && envVars[key].toLowerCase().includes('supabase'))) {
            supabaseEnvVars.push({
                key,
                value: envVars[key]?.substring(0, 50) + '...' // Truncate for security
            });
        }
    });

    if (supabaseEnvVars.length > 0) {
        console.log('🚨 Found Supabase environment variables:');
        supabaseEnvVars.forEach(env => {
            console.log(`   ${env.key}: ${env.value}`);
        });
    } else {
        console.log('✅ No Supabase environment variables found');
    }
}

// Check trong source code
async function checkSourceCode() {
    console.log('\n📁 CHECKING SOURCE CODE FOR SUPABASE');
    console.log('====================================');

    const filesToCheck = [
        'lib/multi-database-service.ts',
        'app/api/database-status/route.ts',
        'lib/database-service.ts'
    ];

    // Note: Trong browser/Node environment này không thể đọc file system
    // Chỉ log ra gợi ý check
    console.log('📝 Files to manually check for Supabase references:');
    filesToCheck.forEach(file => {
        console.log(`   📄 ${file}`);
    });
    console.log('\n💡 Use: grep -r "supabase\\|Supabase" lib/ app/ --include="*.ts" --include="*.js"');
}

// Main debug function
async function runDatabaseDebug() {
    console.log('🚀 Starting Database Status Debug\n');

    // Check all endpoints
    for (const endpoint of ENDPOINTS_TO_CHECK) {
        await checkEndpoint(endpoint);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    // Check environment
    checkEnvironmentVariables();

    // Check source code
    await checkSourceCode();

    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('1. ✅ Checked all major API endpoints');
    console.log('2. ✅ Checked environment variables');
    console.log('3. ✅ Listed source files to check');
    console.log('\n💡 If Supabase references still appear:');
    console.log('   - Check browser cache (hard refresh)');
    console.log('   - Check .env.local file manually');
    console.log('   - Search codebase with grep command above');
    console.log('   - Check if using different environment/config');
}

// Quick database status check
async function quickDatabaseCheck() {
    console.log('⚡ Quick Database Status Check\n');
    await checkEndpoint('/api/database-status');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runDatabaseDebug, quickDatabaseCheck, checkEndpoint };
}

// Run if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args[0] === 'quick') {
        quickDatabaseCheck().catch(console.error);
    } else {
        runDatabaseDebug().catch(console.error);
    }
}
