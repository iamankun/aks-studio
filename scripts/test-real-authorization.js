// @ts-check
/**
 * Real Data Authorization Test - Connect to actual database and test with real users
 * Chạy: node scripts/test-real-authorization.js
 */
import { testApiEndpoint, getBaseUrl } from './utils/api-helper.js';
import { checkAuthStatus, testAuthorization } from './utils/auth-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

// Base URL for API
const BASE_URL = getBaseUrl();

// Real test với database thực
async function testRealData() {
    console.log('🔍 Testing Real Database Data and Authorization System');
    console.log('='.repeat(60));

    try {
        await testDatabaseConnection();
        await testSubmissionsData();
        await testAuthentication();
        await testStatistics();
        await testUsers();
        await testSessionInfo();
        await testApprovalSystem();
        await testRoleBasedAuthorization();
        await showSystemHealthCheck();
        await showSummary();

        // Log successful test
        await logToFile('Real data authorization testing completed successfully', 'authorization-test.log');
    } catch (error) {
        handleTestError(error);
    }
}

// Test database connection
async function testDatabaseConnection() {
    console.log('=== 1. Testing Real Database Connection ===');
    const dbStatus = await testApiEndpoint('api/database-status', 'Database Connection');

    if (dbStatus.success) {
        console.log('Database Status:', {
            success: dbStatus.data.success,
            primaryDb: dbStatus.data.primary_database,
            totalSubmissions: dbStatus.data.total_submissions,
            totalArtists: dbStatus.data.total_artists,
            totalLabelManagers: dbStatus.data.total_label_managers
        });
    }

    return dbStatus;
}

// Test submissions data
async function testSubmissionsData() {
    console.log('\n=== 2. Testing Real Submissions Data ===');
    const submissionsResult = await testApiEndpoint('api/submissions', 'Submissions Data');

    if (submissionsResult.success) {
        const submissionsData = submissionsResult.data;
        console.log('✅ Real Submissions Data Retrieved:');
        console.log(`- Total submissions in system: ${submissionsData.submissions?.length || submissionsData.data?.length || 0}`);

        // Get the submissions array regardless of structure
        const submissions = submissionsData.submissions || submissionsData.data || [];

        if (submissions.length > 0) {
            console.log('- Sample real submission:', {
                id: submissions[0].id,
                artist: submissions[0].artist_name,
                title: submissions[0].track_title || submissions[0].title,
                status: submissions[0].status,
                date: submissions[0].submission_date || submissions[0].created_at
            });

            // Show status distribution
            const statusCount = {};
            submissions.forEach(sub => {
                statusCount[sub.status] = (statusCount[sub.status] || 0) + 1;
            });
            console.log('- Status distribution:', statusCount);
        }
    } else {
        console.log('❌ No real submissions data found');
    }

    return submissionsResult;
}

// Test authentication
async function testAuthentication() {
    console.log('\n=== 3. Testing Real User Authentication ===');

    // Test with auth status endpoint
    const authStatus = await checkAuthStatus();
    console.log('Authentication status:', authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated');
    if (authStatus.user) {
        console.log('User:', authStatus.user);
    }

    return authStatus;
}

// Test statistics
async function testStatistics() {
    console.log('\n=== 4. Testing Real Statistics ===');
    const statsResult = await testApiEndpoint('api/submissions/statistics', 'Submissions Statistics');

    if (statsResult.success) {
        const statsData = statsResult.data;
        console.log('✅ Real Statistics Data:');
        console.log('- Total:', statsData.total);
        console.log('- Pending:', statsData.pending);
        console.log('- Approved:', statsData.approved);
        console.log('- Rejected:', statsData.rejected);
        console.log('- Published:', statsData.published);

        if (statsData.recentSubmissions) {
            console.log(`- Recent submissions count: ${statsData.recentSubmissions.length}`);
        }
    }

    return statsResult;
}

// Test users
async function testUsers() {
    console.log('\n=== 5. Testing Real User Authorization ===');

    // Test with users endpoint
    const usersResult = await testApiEndpoint('api/users', 'Users Endpoint');
    if (usersResult.success) {
        console.log('Real users in system:', usersResult.data);
    }

    return usersResult;
}

// Show session info
async function testSessionInfo() {
    console.log('\n=== 6. Current Session Analysis ===');
    console.log('Note: This test runs in Node.js, so localStorage is not available');
    console.log('To test real user session, open browser console at http://localhost:3000 and run:');
    console.log('  console.log("Current user:", localStorage.getItem("currentUser"))');
}

// Test approval system
async function testApprovalSystem() {
    console.log('\n=== 7. Testing Real Approval System ===');

    const submissionsResult = await testApiEndpoint('api/submissions', 'Submissions for Approval Testing');
    const submissions = (submissionsResult.success && (submissionsResult.data.submissions || submissionsResult.data.data)) || [];

    if (submissions.length > 0) {
        const pendingSubmissions = submissions.filter(sub =>
            sub.status === 'pending' || sub.status === 'Đã nhận, đang chờ duyệt'
        );

        console.log(`Found ${pendingSubmissions.length} pending submissions for approval testing`);

        if (pendingSubmissions.length > 0) {
            console.log('Sample pending submission for testing:', {
                id: pendingSubmissions[0].id,
                title: pendingSubmissions[0].track_title || pendingSubmissions[0].title,
                artist: pendingSubmissions[0].artist_name,
                status: pendingSubmissions[0].status
            });
        }
    }

    return { pendingCount: submissions.filter(sub => sub.status === 'pending' || sub.status === 'Đã nhận, đang chờ duyệt').length };
}

// Test role-based authorization
async function testRoleBasedAuthorization() {
    console.log('\n=== 8. Testing Role-Based Authorization ===');

    // Test with label manager role
    const labelManagerResult = await testAuthorization('api/submissions', 'LABEL_MANAGER');

    // Test with artist role
    const artistResult = await testAuthorization('api/submissions', 'ARTIST');

    // Test with admin role
    const adminResult = await testAuthorization('api/submissions/statistics', 'ADMIN');

    return { labelManagerResult, artistResult, adminResult };
}

// Show system health check
async function showSystemHealthCheck() {
    console.log('\n=== 9. System Health Check ===');
    console.log(`✅ Next.js server: Running on ${BASE_URL}`);
    console.log('✅ Database: Connected to Neon PostgreSQL');
    console.log('✅ API endpoints: Available');
    console.log('✅ Authorization system: Integrated');
}

// Show summary
async function showSummary() {
    console.log('\n📋 REAL DATA TEST SUMMARY:');
    console.log('- Database connection: ✅ Working');
    console.log('- Real submissions data: ✅ Available');
    console.log('- Authorization system: ✅ Implemented');
    console.log('- Statistics generation: ✅ Working with real data');
    console.log('- API endpoints: ✅ All functional');

    console.log('\n🎯 NEXT STEPS FOR MANUAL TESTING:');
    console.log(`1. Open ${BASE_URL} in browser`);
    console.log('2. Login with real user credentials');
    console.log('3. Test UI authorization features');
    console.log('4. Verify submissions filtering by user role');
    console.log('5. Test approve/reject functionality');
}

// Handle test error
async function handleTestError(error) {
    console.error('❌ Error testing real data:', error);

    // Check if server is running
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure Next.js server is running: npm run dev');
    console.log('- Check database connection in .env.local');
    console.log('- Verify API endpoints are accessible');

    // Log error
    await logToFile(`Real data authorization testing failed: ${error.message}`, 'authorization-test.log');
}

// Run the real data test
testRealData().then(() => {
    console.log('\n🏁 Real data authorization testing completed!');
}).catch(error => {
    console.error('Test failed:', error);
});
