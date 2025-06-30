/**
 * Quick API Test Script
 */

async function quickTest() {
    console.log('🔍 Quick API Test...\n');
    
    try {
        // Use native fetch in Node.js 18+
        const response = await fetch('http://localhost:3001/api/artists');
        const data = await response.json();
        
        console.log('✅ Artists API Response:', {
            status: response.status,
            success: data.success,
            count: data.count,
            dataLength: data.artists?.length
        });
        
        if (data.artists && data.artists.length > 0) {
            console.log('👤 Sample artist:', {
                username: data.artists[0].username,
                fullName: data.artists[0].full_name,
                email: data.artists[0].email
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

quickTest();
