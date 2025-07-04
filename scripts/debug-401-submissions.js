// @ts-check
/**
 * Debug 401 Submissions API - Test với demo credentials
 * Chạy: node scripts/debug-401-submissions.js
 */
import { callApi, getBaseUrl } from './utils/api-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

// Base URL
const BASE_URL = getBaseUrl();

// Demo credentials for testing
const DEMO_CREDENTIALS = {
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'Label Manager'
    },
    artist: {
        username: 'artist',
        password: 'artist123',
        role: 'Artist'
    },
    realdb: {
        username: 'realdb',
        password: 'realdb123',
        role: 'System'
    }
};

console.log('🔍 DEBUGGING 401 SUBMISSIONS API');
console.log('================================');

// Tạo Basic Auth header
function createBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${credentials}`;
}

// Test submissions API
async function testSubmissionsApi(authHeader) {
    console.log('   📋 Testing /api/submissions...');
    try {
        const data = await callApi('api/submissions', {
            headers: {
                'Authorization': authHeader
            }
        });
        
        console.log(`   📊 Status: 200 OK`);
        console.log(`   ✅ SUCCESS! Retrieved ${data.submissions?.length || 0} submissions`);
        console.log(`   🔍 Can view all: ${data.canViewAll ? 'YES' : 'NO'}`);
        console.log(`   👤 User role: ${data.userRole || 'Unknown'}`);

        // Show sample submission
        if (data.submissions) {
            if (data.submissions.length > 0) {
                const firstSubmission = data.submissions[0];
                console.log(`   🎵 Sample: "${firstSubmission.track_title}" by ${firstSubmission.artist_name}`);
            }
        }
        
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test statistics API
async function testStatisticsApi(authHeader) {
    console.log('   📊 Testing /api/submissions/statistics...');
    try {
        const data = await callApi('api/submissions/statistics', {
            headers: {
                'Authorization': authHeader
            }
        });
        
        console.log(`   ✅ SUCCESS! Statistics data received`);
        console.log(`   📊 Total: ${data.total}, Pending: ${data.pending}, Approved: ${data.approved}`);
        
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test authentication với demo credentials
async function testDemoAuth(userKey, credentials) {
    console.log(`\n🧪 Testing ${userKey}: ${credentials.username} (${credentials.role})`);

    const authHeader = createBasicAuth(credentials.username, credentials.password);
    console.log(`   🔑 Auth Header: ${authHeader.substring(0, 20)}...`);

    // Test API endpoints
    const submissionsResult = await testSubmissionsApi(authHeader);
    const statsResult = await testStatisticsApi(authHeader);
    
    // Create result object
    const result = {
        submissionsSuccess: submissionsResult.success,
        statsSuccess: statsResult.success,
        status: submissionsResult.success ? '200 OK' : submissionsResult.error,
        error: submissionsResult.success ? null : submissionsResult.error
    };
    
    // Log result
    await logToFile(
        `Test with user ${userKey}: Submissions=${result.submissionsSuccess}, Stats=${result.statsSuccess}`,
        'debug-401.log'
    );
    
    return result;
}

// Main debug function
async function runDebugTests() {
    const results = {};

    // Test each demo credential
    for (const [userKey, credentials] of Object.entries(DEMO_CREDENTIALS)) {
        results[userKey] = await testDemoAuth(userKey, credentials);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📋 DEBUG SUMMARY');
    console.log('================');

    for (const [userKey, result] of Object.entries(results)) {
        const creds = DEMO_CREDENTIALS[userKey];
        console.log(`\n${userKey} (${creds.role}):`);
        console.log(`  📋 Submissions: ${result.submissionsSuccess ? '✅ SUCCESS' : '❌ FAILED'} (${result.status})`);
        console.log(`  📊 Statistics: ${result.statsSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (result.error) {
            console.log(`  ⚠️ Error: ${result.error}`);
        }
    }

    // Check if any tests passed
    const anySuccess = Object.values(results).some(r => r.submissionsSuccess || r.statsSuccess);
    
    if (anySuccess) {
        console.log('\n✅ Some tests passed! The issue may be related to specific user roles or permissions.');
    } else {
        console.log('\n❌ All tests failed! Possible issues:');
        console.log('- API server not running');
        console.log('- Authentication service issues');
        console.log('- Database connection problems');
        console.log('- Authorization logic errors');
    }

    console.log('\n🔍 Next steps:');
    console.log('1. If demo auth works → Test with real database users');
    console.log('2. If demo auth fails → Check auth service implementation');
    console.log('3. Check server logs for detailed error messages');
}

// Quick single test function
async function quickTest() {
    console.log('⚡ Quick Admin Test');
    return await testDemoAuth('admin', DEMO_CREDENTIALS.admin);
}

// Export functions - ES Module compatible
export { runDebugTests, quickTest, testDemoAuth };

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    runDebugTests().catch(console.error);
}
