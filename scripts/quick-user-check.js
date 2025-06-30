import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));

async function checkUsers() {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('🔍 Checking users in database...\n');

        // Check artists
        const artists = await sql`SELECT username, full_name, email FROM artist ORDER BY username`;
        console.log('👥 Artists:');
        artists.forEach(user => {
            console.log(`  - ${user.username} (${user.full_name}) - ${user.email}`);
        });

        // Check label managers  
        const managers = await sql`SELECT username, full_name, email FROM label_manager ORDER BY username`;
        console.log('\n🏢 Label Managers:');
        managers.forEach(user => {
            console.log(`  - ${user.username} (${user.full_name}) - ${user.email}`);
        });

        // Test specific user password
        const testUser = 'ankun';
        const userCheck = await sql`SELECT username, password_hash FROM artist WHERE username = ${testUser}`;
        
        if (userCheck.length > 0) {
            console.log(`\n🔐 Password hash for ${testUser}:`, userCheck[0].password_hash.substring(0, 20) + '...');
            
            // Test bcrypt verification
            const bcrypt = await import('bcrypt');
            const isValid = await bcrypt.compare('admin123', userCheck[0].password_hash);
            console.log(`🔍 Password 'admin123' is valid for ${testUser}:`, isValid);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUsers();
