// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

// Test Authorization System using built-in fetch
async function testAuthorizationSystem() {
    console.log('🔐 Testing Authorization System\n');

    const baseURL = 'http://localhost:3001';

    // Test credentials
    const labelManagerAuth = Buffer.from('ankunstudio:admin').toString('base64');
    const artistAuth = Buffer.from('artist:123456').toString('base64');

    async function makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return { status: response.status, data, ok: response.ok };
        } catch (error) {
            return { error: error.message };
        }
    }

    console.log('=== 1. Testing submissions endpoint with Label Manager ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions?stats=true`, {
            headers: {
                'Authorization': `Basic ${labelManagerAuth}`
            }
        });

        if (result.ok) {
            console.log('✅ Label Manager can access submissions');
            console.log('Response data:', {
                success: result.data.success,
                count: result.data.count,
                userRole: result.data.userRole,
                canViewAll: result.data.canViewAll,
                hasStatistics: !!result.data.statistics
            });
        } else {
            console.log('❌ Error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 2. Testing submissions endpoint with Artist ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions?stats=true`, {
            headers: {
                'Authorization': `Basic ${artistAuth}`
            }
        });

        if (result.ok) {
            console.log('✅ Artist can access submissions');
            console.log('Response data:', {
                success: result.data.success,
                count: result.data.count,
                userRole: result.data.userRole,
                canViewAll: result.data.canViewAll,
                hasStatistics: !!result.data.statistics
            });
        } else {
            console.log('❌ Error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 3. Testing submissions endpoint without auth ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions`);
        if (result.ok) {
            console.log('❌ Unauthorized access allowed (this should not happen)');
        } else if (result.status === 401) {
            console.log('✅ Correctly blocked unauthorized access');
        } else {
            console.log('❌ Unexpected error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 4. Testing statistics endpoint with Label Manager ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions/statistics`, {
            headers: {
                'Authorization': `Basic ${labelManagerAuth}`
            }
        });

        if (result.ok) {
            console.log('✅ Label Manager can access statistics');
            console.log('Statistics:', result.data.statistics);
        } else {
            console.log('❌ Error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 5. Testing statistics endpoint with Artist ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions/statistics`, {
            headers: {
                'Authorization': `Basic ${artistAuth}`
            }
        });

        if (result.ok) {
            console.log('✅ Artist can access statistics');
            console.log('Statistics:', result.data.statistics);
        } else {
            console.log('❌ Error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 6. Testing approve/reject with Label Manager ===');
    try {
        // First get a submission to approve
        const submissionsResult = await makeRequest(`${baseURL}/api/submissions`, {
            headers: {
                'Authorization': `Basic ${labelManagerAuth}`
            }
        });

        if (submissionsResult.ok && submissionsResult.data.data.length > 0) {
            const submissionId = submissionsResult.data.data[0].id;

            const result = await makeRequest(`${baseURL}/api/submissions/approve-reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${labelManagerAuth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    submissionId,
                    action: 'approve',
                    comment: 'Test approval'
                })
            });

            if (result.ok) {
                console.log('✅ Label Manager can approve submissions');
                console.log('Approval response:', result.data);
            } else {
                console.log('❌ Error:', result.data);
            }
        } else {
            console.log('⚠️ No submissions found to test approval');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n=== 7. Testing approve/reject with Artist (should fail) ===');
    try {
        const result = await makeRequest(`${baseURL}/api/submissions/approve-reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${artistAuth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                submissionId: 'test-id',
                action: 'approve'
            })
        });

        if (result.status === 403) {
            console.log('✅ Correctly blocked artist from approving');
        } else if (result.ok) {
            console.log('❌ Artist was allowed to approve (this should not happen)');
        } else {
            console.log('❌ Unexpected error:', result.data);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n🏁 Authorization testing completed!');
}

// Run the test
testAuthorizationSystem().catch(console.error);
