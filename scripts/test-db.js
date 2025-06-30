// Test database connection
const fetch = require('node-fetch');

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        const response = await fetch('http://localhost:3000/api/database-status');
        const result = await response.json();
        
        console.log('📊 Database status:', result);
        
        if (result.success) {
            console.log('✅ Database connection successful!');
        } else {
            console.log('❌ Database connection failed:', result.error);
        }
    } catch (error) {
        console.log('🚨 Test error:', error.message);
    }
}

testDatabase();
