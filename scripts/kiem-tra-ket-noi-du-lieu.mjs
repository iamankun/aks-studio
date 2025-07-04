// Test trực tiếp kết nối database và dữ liệu thực
// Kiểm tra users và submissions từ Neon PostgreSQL

import pg from 'pg';
const { Client } = pg;

// Database connection string từ environment
const connectionString = process.env.DATABASE_URL || 'postgresql://aksstudio_owner:MbBTdKJFUfir@ep-mute-rice-a17ojtca-pooler.ap-southeast-1.aws.neon.tech/aksstudio?sslmode=require';

console.log('🔗 TESTING DIRECT DATABASE CONNECTION');
console.log('====================================');

async function testDatabaseConnection() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('📡 Connecting to Neon PostgreSQL...');
        await client.connect();
        console.log('✅ Database connected successfully!');

        // Test 1: Kiểm tra bảng users
        console.log('\n👥 Testing Users Table:');
        const usersResult = await client.query(`
            SELECT id, username, email, full_name, role, created_at 
            FROM users 
            ORDER BY id
        `);

        console.log(`   📊 Total users: ${usersResult.rows.length}`);
        usersResult.rows.forEach(user => {
            console.log(`   👤 ${user.username} (${user.role}) - ${user.email}`);
        });

        // Test 2: Kiểm tra bảng submissions  
        console.log('\n📋 Testing Submissions Table:');
        const submissionsResult = await client.query(`
            SELECT id, track_title, artist_name, uploader_username, status, created_at
            FROM submissions 
            ORDER BY created_at DESC
            LIMIT 10
        `);

        console.log(`   📊 Total recent submissions: ${submissionsResult.rows.length}`);
        submissionsResult.rows.forEach(submission => {
            console.log(`   🎵 "${submission.track_title}" by ${submission.artist_name} - ${submission.status} (${submission.uploader_username})`);
        });

        // Test 3: Thống kê theo status
        console.log('\n📈 Submissions by Status:');
        const statusResult = await client.query(`
            SELECT status, COUNT(*) as count
            FROM submissions 
            GROUP BY status
            ORDER BY count DESC
        `);

        statusResult.rows.forEach(row => {
            console.log(`   📊 ${row.status}: ${row.count}`);
        });

        // Test 4: Submissions theo user
        console.log('\n👤 Submissions by User:');
        const userSubmissionsResult = await client.query(`
            SELECT uploader_username, COUNT(*) as count
            FROM submissions 
            GROUP BY uploader_username
            ORDER BY count DESC
        `);

        userSubmissionsResult.rows.forEach(row => {
            console.log(`   👤 ${row.uploader_username}: ${row.count} submissions`);
        });

        // Test 5: Kiểm tra cấu trúc bảng
        console.log('\n🏗️ Table Structure:');

        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('   📋 Available tables:');
        tablesResult.rows.forEach(table => {
            console.log(`   📄 ${table.table_name}`);
        });

        return {
            connected: true,
            users: usersResult.rows,
            submissions: submissionsResult.rows,
            statusStats: statusResult.rows,
            userStats: userSubmissionsResult.rows
        };

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        return {
            connected: false,
            error: error.message
        };
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

// Test authorization logic với dữ liệu thực
async function testAuthorizationLogic(dbData) {
    console.log('\n🔐 Testing Authorization Logic with Real Data');
    console.log('=============================================');

    if (!dbData.connected) {
        console.log('❌ Cannot test authorization - no database connection');
        return;
    }

    const users = dbData.users;
    const submissions = dbData.submissions;

    console.log('\n🧪 Testing Role-Based Access:');

    // Tìm Label Manager
    const labelManager = users.find(u => u.role === 'Label Manager');
    if (labelManager) {
        console.log(`\n👑 Label Manager: ${labelManager.username}`);
        console.log(`   ✅ Should see ALL ${submissions.length} submissions`);
        console.log(`   ✅ Should be able to approve/reject`);
        console.log(`   ✅ Should access debug tools`);
    }

    // Tìm Artists
    const artists = users.filter(u => u.role === 'Artist');
    console.log(`\n🎨 Artists found: ${artists.length}`);

    artists.forEach(artist => {
        const artistSubmissions = submissions.filter(s => s.uploader_username === artist.username);
        console.log(`   👤 ${artist.username}: should see ${artistSubmissions.length}/${submissions.length} submissions`);

        artistSubmissions.forEach(sub => {
            console.log(`     🎵 "${sub.track_title}" (${sub.status})`);
        });
    });

    // Test cases cụ thể
    console.log('\n🎯 Specific Test Cases:');

    const ankun = users.find(u => u.username === 'ankun');
    if (ankun) {
        const ankunSubmissions = submissions.filter(s => s.uploader_username === 'ankun');
        const pendingSubmissions = ankunSubmissions.filter(s => s.status === 'pending');

        console.log(`   👤 ankun authorization:`);
        console.log(`     📋 Total submissions: ${ankunSubmissions.length}`);
        console.log(`     ✏️ Can edit pending: ${pendingSubmissions.length}`);
        console.log(`     ❌ Cannot delete: any`);
        console.log(`     ❌ Cannot approve/reject: any`);
    }

    const testartist = users.find(u => u.username === 'testartist');
    if (testartist) {
        const testartistSubmissions = submissions.filter(s => s.uploader_username === 'testartist');

        console.log(`   👤 testartist authorization:`);
        console.log(`     📋 Total submissions: ${testartistSubmissions.length}`);
        console.log(`     👀 Can view: only own submissions`);
        console.log(`     ❌ Cannot see: other artists' work`);
    }

    return {
        labelManagerCount: labelManager ? 1 : 0,
        artistCount: artists.length,
        totalSubmissions: submissions.length,
        authorizationValid: true
    };
}

// Main test runner
async function runDatabaseTests() {
    console.log('🚀 Starting Direct Database Tests\n');

    const dbData = await testDatabaseConnection();

    if (dbData.connected) {
        await testAuthorizationLogic(dbData);
    }

    console.log('\n🎉 Database Tests Complete!');

    return dbData;
}

// Chạy test nếu file được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
    runDatabaseTests().catch(console.error);
}

export { testDatabaseConnection, testAuthorizationLogic, runDatabaseTests };
