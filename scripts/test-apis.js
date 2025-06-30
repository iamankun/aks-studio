/**
 * Debug API Endpoints
 * Test all API endpoints to diagnose issues
 */

async function testAPIs() {
    console.log('🧪 Testing API Endpoints...\n');

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

    const endpoints = [
        { name: 'Artists API', url: '/api/artists' },
        { name: 'Submissions API', url: '/api/submissions' },
        { name: 'Auth API', url: '/api/auth/login', method: 'POST', body: { username: 'test', password: 'invalid' } }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testing ${endpoint.name}...`);

            const options = {
                method: endpoint.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                ...(endpoint.body && { body: JSON.stringify(endpoint.body) })
            };

            const response = await fetch(`${baseUrl}${endpoint.url}`, options);
            const data = await response.json();

            console.log(`✅ ${endpoint.name}: Status ${response.status}`);
            console.log(`📊 Response:`, data);
            console.log('---');

        } catch (error) {
            console.error(`❌ ${endpoint.name} failed:`, error);
            console.log('---');
        }
    }
}

// Run if in browser
if (typeof window !== 'undefined') {
    testAPIs();
} else {
    // Node.js environment
    import('node-fetch').then(fetch => {
        global.fetch = fetch.default;
        testAPIs();
    }).catch(() => {
        console.log('node-fetch not available, skipping test');
    });
}
