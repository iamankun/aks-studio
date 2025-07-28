// Quick Login Test
console.log('🔐 Testing Login API...');

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'ankunstudio',
                password: '@iamAnKun'
            })
        });
        
        const data = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${data}`);
        
        if (response.ok) {
            console.log('✅ API Login successful!');
        } else {
            console.log('❌ API Login failed');
        }
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
};

testLogin();
