// Test Approve/Reject API với Submission IDs thực

require('dotenv').config({ path: '../.env.local' });

const BASE_URL = 'http://localhost:3000';

console.log('🎯 TESTING APPROVE/REJECT API WITH REAL SUBMISSIONS');
console.log('=================================================');

// Get credentials from environment
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'ankunstudio',
    password: process.env.ADMIN_PASSWORD || '@iamAnKun'
};

function createBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${credentials}`;
}

async function testApproveReject() {
    const authHeader = createBasicAuth(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);

    console.log(`🔐 Testing with: ${ADMIN_CREDENTIALS.username}`);

    // Test submissions từ database (ID 14, 15, 16)
    const testCases = [
        { id: 14, action: 'approve', title: 'Digital Dreams' },
        { id: 15, action: 'reject', title: 'Studio Sessions Vol.1', comment: 'Needs audio quality improvement' },
        { id: 16, action: 'approve', title: 'Midnight Coding' }
    ];

    for (const testCase of testCases) {
        console.log(`\n📋 Testing ${testCase.action} submission ID ${testCase.id} (${testCase.title})`);

        try {
            const response = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify({
                    submissionId: testCase.id,
                    action: testCase.action,
                    ...(testCase.comment && { comment: testCase.comment })
                })
            });

            console.log(`   Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ SUCCESS: ${data.message}`);
                console.log(`   📊 Action: ${data.action}`);
                console.log(`   🏷️ New Status: ${data.status}`);
            } else {
                const errorData = await response.json();
                console.log(`   ❌ FAILED: ${errorData.message}`);
            }

        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
        }
    }

    // Test với invalid submission ID
    console.log('\n🚫 Testing with invalid submission ID...');
    try {
        const response = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                submissionId: 99999,
                action: 'approve'
            })
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const errorData = await response.json();
            console.log(`   ✅ Expected error: ${errorData.message}`);
        }

    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
    }

    // Verify submissions sau khi approve/reject
    console.log('\n📊 Checking updated submissions...');
    try {
        const submissionsResponse = await fetch(`${BASE_URL}/api/submissions`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader
            }
        });

        if (submissionsResponse.ok) {
            const data = await submissionsResponse.json();
            const updatedSubmissions = data.submissions.filter(s => [14, 15, 16].includes(s.id));

            console.log('   Updated submissions:');
            updatedSubmissions.forEach(sub => {
                console.log(`     ID ${sub.id}: "${sub.title}" → ${sub.status}`);
            });
        }

    } catch (error) {
        console.log(`   ❌ ERROR checking submissions: ${error.message}`);
    }
}

// Run test
if (require.main === module) {
    testApproveReject().then(() => {
        console.log('\n🎉 APPROVE/REJECT API TESTING COMPLETED!');
    }).catch(console.error);
}

module.exports = { testApproveReject };
