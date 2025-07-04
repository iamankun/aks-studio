// Test Approve/Reject API with Real Submissions
// Test với submission IDs thực từ database

import { config } from 'dotenv';

config({ path: '../.env.local' });

const BASE_URL = 'http://localhost:3000';

console.log('🎯 TESTING APPROVE/REJECT API WITH REAL SUBMISSIONS');
console.log('================================================');

// Get credentials from environment
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'ankunstudio',
    password: process.env.ADMIN_PASSWORD || '@iamAnKun'
};

// Create Basic Auth header
function createBasicAuth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    return `Basic ${credentials}`;
}

async function testApproveRejectAPI() {
    console.log(`🔐 Using admin credentials: ${ADMIN_CREDENTIALS.username}`);

    const authHeader = createBasicAuth(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);

    try {
        // 1. Get list of submissions first
        console.log('\n📋 Getting current submissions...');
        const submissionsResponse = await fetch(`${BASE_URL}/api/submissions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        if (!submissionsResponse.ok) {
            console.log('❌ Failed to get submissions:', submissionsResponse.status);
            return;
        }

        const submissionsData = await submissionsResponse.json();
        const submissions = submissionsData.submissions || [];

        console.log(`✅ Found ${submissions.length} submissions`);

        if (submissions.length === 0) {
            console.log('❌ No submissions found to test with');
            return;
        }

        // Show available submissions
        console.log('\n📊 Available submissions for testing:');
        submissions.slice(0, 5).forEach((sub, index) => {
            console.log(`   ${index + 1}. [${sub.id}] "${sub.title}" by ${sub.artist_name} (${sub.status})`);
        });

        // Test with first pending submission
        const pendingSubmission = submissions.find(sub => sub.status === 'pending');
        const testSubmission = pendingSubmission || submissions[0];

        console.log(`\n🎯 Testing with submission: [${testSubmission.id}] "${testSubmission.title}"`);
        console.log(`   Current status: ${testSubmission.status}`);

        // 2. Test APPROVE
        console.log('\n✅ Testing APPROVE action...');
        const approveResponse = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                submissionId: testSubmission.id,
                action: 'approve'
            })
        });

        console.log(`   Status: ${approveResponse.status} ${approveResponse.statusText}`);

        if (approveResponse.ok) {
            const approveData = await approveResponse.json();
            console.log('   ✅ APPROVE SUCCESS:', approveData);
        } else {
            const approveError = await approveResponse.text();
            console.log('   ❌ APPROVE FAILED:', approveError);
        }

        // 3. Test REJECT (use another submission)
        const rejectTestSubmission = submissions.find(sub => sub.id !== testSubmission.id && sub.status !== 'rejected');

        if (rejectTestSubmission) {
            console.log('\n❌ Testing REJECT action...');
            console.log(`   Using submission: [${rejectTestSubmission.id}] "${rejectTestSubmission.title}"`);

            const rejectResponse = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify({
                    submissionId: rejectTestSubmission.id,
                    action: 'reject',
                    comment: 'Quality does not meet our standards'
                })
            });

            console.log(`   Status: ${rejectResponse.status} ${rejectResponse.statusText}`);

            if (rejectResponse.ok) {
                const rejectData = await rejectResponse.json();
                console.log('   ✅ REJECT SUCCESS:', rejectData);
            } else {
                const rejectError = await rejectResponse.text();
                console.log('   ❌ REJECT FAILED:', rejectError);
            }
        }

        // 4. Check updated submissions
        console.log('\n🔄 Checking updated submissions...');
        const updatedResponse = await fetch(`${BASE_URL}/api/submissions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        });

        if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            const updatedSubmissions = updatedData.submissions || [];

            console.log('📊 Updated submissions status:');
            updatedSubmissions.slice(0, 5).forEach((sub, index) => {
                const wasChanged = sub.id === testSubmission.id || (rejectTestSubmission && sub.id === rejectTestSubmission.id);
                const indicator = wasChanged ? '🔄' : '  ';
                console.log(`   ${indicator} ${index + 1}. [${sub.id}] "${sub.title}" (${sub.status})`);
            });
        }

        return true;

    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return false;
    }
}

// Run test
testApproveRejectAPI().then(success => {
    if (success) {
        console.log('\n🎉 APPROVE/REJECT API TESTING COMPLETED!');
        console.log('The API is working with real submissions');
    } else {
        console.log('\n🚨 TESTING FAILED');
        console.log('Check the errors above');
    }
}).catch(console.error);
