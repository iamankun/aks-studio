// Real Database Authorization Test
// Kiểm tra hệ thống phân quyền với dữ liệu thực từ database
// Sử dụng dữ liệu thực: admin, ankun, testartist

const BASE_URL = 'http://localhost:3000';

console.log('🔐 TESTING REAL AUTHORIZATION SYSTEM');
console.log('=====================================');

// Dữ liệu user thực từ database
const REAL_USERS = {
    labelManager: {
        id: '1',
        username: 'admin',
        email: 'admin@ankun.dev',
        role: 'Label Manager'
    },
    artist1: {
        id: '2',
        username: 'ankun',
        email: 'ankun@aksstudio.com',
        role: 'Artist'
    },
    artist2: {
        id: '3',
        username: 'testartist',
        email: 'test@ankun.dev',
        role: 'Artist'
    }
};

// Hàm test với user thực
async function testRealUserAuthorization(userKey, userInfo) {
    console.log(`\n🧪 Testing ${userKey}: ${userInfo.username} (${userInfo.role})`);
    console.log(`📧 Email: ${userInfo.email}`);

    // Tạo headers để simulate authentication với Basic Auth
    const credentials = Buffer.from(`${userInfo.username}:password123`).toString('base64');
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'x-user-id': userInfo.id,
        'x-user-role': userInfo.role,
        'x-username': userInfo.username,
        'x-user-email': userInfo.email
    };

    const results = {
        submissions: false,
        statistics: false,
        approveReject: false,
        submissionCount: 0,
        canViewAll: false
    };

    try {
        // Test 1: Submissions Access
        console.log('  📋 Testing submissions access...');
        const submissionsResponse = await fetch(`${BASE_URL}/api/submissions`, {
            headers: authHeaders
        });

        if (submissionsResponse.ok) {
            const data = await submissionsResponse.json();
            results.submissions = true;
            results.submissionCount = data.submissions?.length || 0;
            results.canViewAll = data.canViewAll || false;

            console.log(`  ✅ Can access submissions: ${results.submissionCount} visible`);
            console.log(`  🔍 Can view all: ${results.canViewAll ? 'YES' : 'NO'}`);
        } else {
            console.log(`  ❌ Cannot access submissions (${submissionsResponse.status})`);
        }

        // Test 2: Statistics Access  
        console.log('  📊 Testing statistics access...');
        const statsResponse = await fetch(`${BASE_URL}/api/submissions/statistics`, {
            headers: authHeaders
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            results.statistics = true;

            console.log(`  ✅ Can access statistics`);
            console.log(`  📈 Total visible: ${statsData.total || 0}`);
            console.log(`  🎯 Scope: ${statsData.canViewAll ? 'ALL USERS' : 'OWN DATA ONLY'}`);
        } else {
            console.log(`  ❌ Cannot access statistics (${statsResponse.status})`);
        }

        // Test 3: Approve/Reject (chỉ test cho Label Manager)
        if (userInfo.role === 'Label Manager') {
            console.log('  🎯 Testing approve/reject access...');
            const approveResponse = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    submissionId: 'test-id',
                    action: 'approve'
                })
            });

            // Even if submission doesn't exist, we check if endpoint is accessible
            if (approveResponse.status !== 403) {
                results.approveReject = true;
                console.log(`  ✅ Can access approve/reject endpoint`);
            } else {
                console.log(`  ❌ Cannot access approve/reject (${approveResponse.status})`);
            }
        } else {
            console.log('  🚫 Testing approve/reject (should be denied)...');
            const approveResponse = await fetch(`${BASE_URL}/api/submissions/approve-reject`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    submissionId: 'test-id',
                    action: 'approve'
                })
            });

            if (approveResponse.status === 403) {
                console.log(`  ✅ Correctly denied approve/reject access`);
            } else {
                console.log(`  ❌ Should be denied but got ${approveResponse.status}`);
            }
        }

    } catch (error) {
        console.log(`  ❌ Error testing ${userKey}:`, error.message);
    }

    return results;
}

// Test tất cả users
async function runAllTests() {
    console.log('🚀 Starting Real User Authorization Tests\n');

    const allResults = {};

    for (const [userKey, userInfo] of Object.entries(REAL_USERS)) {
        allResults[userKey] = await testRealUserAuthorization(userKey, userInfo);

        // Delay giữa các test để tránh overload
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('===============');

    for (const [userKey, results] of Object.entries(allResults)) {
        const user = REAL_USERS[userKey];
        console.log(`\n${userKey} (${user.role}):`);
        console.log(`  📋 Submissions: ${results.submissions ? '✅' : '❌'} (${results.submissionCount} visible)`);
        console.log(`  📊 Statistics: ${results.statistics ? '✅' : '❌'}`);
        console.log(`  🎯 Can view all: ${results.canViewAll ? '✅' : '❌'}`);
        if (user.role === 'Label Manager') {
            console.log(`  🎯 Approve/Reject: ${results.approveReject ? '✅' : '❌'}`);
        }
    }

    // Validation
    console.log('\n🔍 VALIDATION CHECKS');
    console.log('====================');

    const labelManagerResults = allResults.labelManager;
    const artist1Results = allResults.artist1;
    const artist2Results = allResults.artist2;

    console.log('\nExpected vs Actual:');

    // Label Manager should see all
    console.log(`Label Manager can view all: ${labelManagerResults?.canViewAll ? '✅ CORRECT' : '❌ ERROR'}`);

    // Artists should see limited data
    console.log(`Artist1 limited view: ${!artist1Results?.canViewAll ? '✅ CORRECT' : '❌ ERROR'}`);
    console.log(`Artist2 limited view: ${!artist2Results?.canViewAll ? '✅ CORRECT' : '❌ ERROR'}`);

    // Compare submission counts
    if (labelManagerResults && artist1Results) {
        const lmCount = labelManagerResults.submissionCount;
        const artistCount = artist1Results.submissionCount;
        console.log(`Label Manager sees more data: ${lmCount >= artistCount ? '✅ CORRECT' : '❌ ERROR'} (${lmCount} vs ${artistCount})`);
    }

    console.log('\n🎉 Real Authorization Test Complete!');
}

// Chạy test
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { testRealUserAuthorization, REAL_USERS };
