// Test Updated Admin Credentials from Environment Variables
// Test with ADMIN_USERNAME/ADMIN_PASSWORD from .env.local

require('dotenv').config({ path: '../.env.local' });

const BASE_URL = 'http://localhost:3000';

console.log('🧪 TESTING ADMIN CREDENTIALS FROM ENV');
console.log('====================================');

// Get credentials from environment
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'ankunstudio',
    password: process.env.ADMIN_PASSWORD || '@iamAnKun',
    role: ['Label Manager', 'Artist']
};

console.log(`🔑 Using: ${ADMIN_CREDENTIALS.username} / ${'*'.repeat(ADMIN_CREDENTIALS.password.length)}`);
console.log(`📁 ENV loaded: ${process.env.ADMIN_USERNAME ? '✅' : '❌'}`);

// Create Basic Auth header
function createBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${credentials}`;
}

async function testNewCredentials() {
    console.log(`🔐 Testing: ${ADMIN_CREDENTIALS.username} / ${'*'.repeat(ADMIN_CREDENTIALS.password.length)}`);

    const authHeader = createBasicAuth(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    console.log(`🔑 Auth Header: ${authHeader.substring(0, 30)}...`);

    try {
        // Test Submissions API
        console.log('\n📋 Testing /api/submissions...');
        const submissionsResponse = await fetch(`${BASE_URL}/api/submissions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        console.log(`Status: ${submissionsResponse.status} ${submissionsResponse.statusText}`);

        if (submissionsResponse.ok) {
            const data = await submissionsResponse.json();
            console.log('✅ AUTHENTICATION SUCCESS!');
            console.log(`📊 Submissions count: ${data.submissions?.length || 0}`);
            console.log(`👑 User role: ${data.userRole}`);
            console.log(`🔍 Can view all: ${data.canViewAll ? 'YES' : 'NO'}`);

            // Show first few submissions
            if (data.submissions && data.submissions.length > 0) {
                console.log('\n🎵 Sample submissions:');
                data.submissions.slice(0, 3).forEach((sub, idx) => {
                    console.log(`   ${idx + 1}. "${sub.track_title}" by ${sub.artist_name} (${sub.status})`);
                });
            }
        } else {
            const errorText = await submissionsResponse.text();
            console.log(`❌ AUTHENTICATION FAILED: ${errorText}`);
        }

        // Test Statistics API
        console.log('\n📊 Testing /api/submissions/statistics...');
        const statsResponse = await fetch(`${BASE_URL}/api/submissions/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Statistics API works!');
            console.log(`📈 Total submissions: ${statsData.total || 0}`);
            console.log(`⏳ Pending: ${statsData.pending || 0}`);
            console.log(`✅ Approved: ${statsData.approved || 0}`);
            console.log(`❌ Rejected: ${statsData.rejected || 0}`);
        } else {
            console.log(`❌ Statistics failed: ${statsResponse.status}`);
        }

        // Test Approve/Reject API (Label Manager only)
        console.log('\n🎯 Testing /api/submissions/approve-reject...');
        const approveResponse = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                submissionId: 'test-id',
                action: 'approve'
            })
        });

        console.log(`Approve/Reject Status: ${approveResponse.status}`);
        if (approveResponse.status === 404 || approveResponse.status === 400) {
            console.log('✅ Endpoint accessible (error expected for test ID)');
        } else if (approveResponse.status === 403) {
            console.log('❌ Access denied');
        }

        return {
            success: submissionsResponse.ok,
            status: submissionsResponse.status
        };

    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run test
if (require.main === module) {
    testNewCredentials().then(result => {
        if (result.success) {
            console.log('\n🎉 ADMIN CREDENTIALS WORK PERFECTLY!');
            console.log('📋 You can now login with:');
            console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
            console.log(`   Password: ${'*'.repeat(ADMIN_CREDENTIALS.password.length)}`);
            console.log(`   Role: ${ADMIN_CREDENTIALS.role}`);
        } else {
            console.log('\n🚨 CREDENTIALS NOT WORKING YET');
            console.log('Check database update and try again');
        }
    }).catch(console.error);
}

module.exports = { testNewCredentials, ADMIN_CREDENTIALS };
