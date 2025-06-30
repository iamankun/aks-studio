/**
 * Complete API and Data Verification Script
 * AKs Studio Digital Music Platform
 * July 2025
 */

import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));

async function verifySystem() {
    console.log('🔍 Verifying AKs Studio Digital Music Platform...\n');

    try {
        // 1. Database Connection Test
        console.log('📋 1. Testing Database Connection...');
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.DATABASE_URL);
        
        const dbTest = await sql`SELECT NOW() as current_time`;
        console.log('✅ Database connected:', dbTest[0].current_time);

        // 2. Schema Verification
        console.log('\n📋 2. Verifying Database Schema...');
        
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        const tableNames = tables.map(t => t.table_name).sort();
        console.log('✅ Tables found:', tableNames);
        
        const expectedTables = ['artist', 'label_manager', 'submissions'];
        const missingTables = expectedTables.filter(t => !tableNames.includes(t));
        
        if (missingTables.length > 0) {
            console.log('❌ Missing tables:', missingTables);
            console.log('💡 Run: node scripts/setup-database.js');
            return;
        }

        // 3. Data Count Verification
        console.log('\n📋 3. Checking Data Counts...');
        
        const artistCount = await sql`SELECT COUNT(*) as count FROM artist`;
        const managerCount = await sql`SELECT COUNT(*) as count FROM label_manager`;
        const submissionCount = await sql`SELECT COUNT(*) as count FROM submissions`;
        
        console.log(`✅ Artists: ${artistCount[0].count}`);
        console.log(`✅ Label Managers: ${managerCount[0].count}`);
        console.log(`✅ Submissions: ${submissionCount[0].count}`);

        // 4. API Endpoints Test (if server is running)
        console.log('\n📋 4. Testing API Endpoints...');
        
        const testEndpoints = [
            { path: '/api/artists', method: 'GET' },
            { path: '/api/submissions', method: 'GET' },
            { path: '/api/auth/login', method: 'POST' }
        ];

        const serverUrl = 'http://localhost:3001'; // or 3000
        
        for (const endpoint of testEndpoints) {
            try {
                let response;
                if (endpoint.method === 'GET') {
                    response = await fetch(`${serverUrl}${endpoint.path}`);
                } else if (endpoint.method === 'POST' && endpoint.path.includes('login')) {
                    response = await fetch(`${serverUrl}${endpoint.path}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'test', password: 'invalid' })
                    });
                }
                
                if (response && response.status < 500) {
                    console.log(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`);
                } else {
                    console.log(`⚠️  ${endpoint.method} ${endpoint.path}: ${response?.status || 'No response'}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint.method} ${endpoint.path}: Server not running`);
            }
        }

        // 5. Sample Data Check
        console.log('\n📋 5. Sample Data Verification...');
        
        const sampleArtist = await sql`
            SELECT username, full_name, email, created_at 
            FROM artist 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        
        const sampleSubmission = await sql`
            SELECT title, artist_name, status, submission_date 
            FROM submissions 
            ORDER BY submission_date DESC 
            LIMIT 1
        `;
        
        if (sampleArtist.length > 0) {
            console.log('✅ Latest Artist:', sampleArtist[0]);
        }
        
        if (sampleSubmission.length > 0) {
            console.log('✅ Latest Submission:', sampleSubmission[0]);
        }

        // 6. Password Hash Check
        console.log('\n📋 6. Password Security Check...');
        
        const passwordCheck = await sql`
            SELECT username, 
                   CASE 
                       WHEN password_hash LIKE '$2b$%' OR password_hash LIKE '$2a$%' THEN 'bcrypt'
                       ELSE 'weak/plain'
                   END as hash_type
            FROM artist
            UNION ALL
            SELECT username,
                   CASE 
                       WHEN password_hash LIKE '$2b$%' OR password_hash LIKE '$2a$%' THEN 'bcrypt'
                       ELSE 'weak/plain'
                   END as hash_type
            FROM label_manager
        `;
        
        passwordCheck.forEach(user => {
            if (user.hash_type === 'bcrypt') {
                console.log(`✅ ${user.username}: Secure password hash`);
            } else {
                console.log(`❌ ${user.username}: Weak password hash - needs update`);
            }
        });

        console.log('\n🎉 System verification completed!');
        
        if (process.env.NODE_ENV === 'development') {
            console.log('\n📝 Development Login Credentials:');
            console.log('Artist: ankun / admin123');
            console.log('Artist: testartist / artist123');
            console.log('Label Manager: admin / manager123');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

// Run verification
verifySystem();
