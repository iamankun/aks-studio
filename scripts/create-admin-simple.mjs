import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔧 CREATING ADMIN IN LABEL_MANAGER TABLE');
console.log('========================================');

async function createAdmin() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const username = process.env.ADMIN_USERNAME || 'ankunstudio';
        const password = process.env.ADMIN_PASSWORD || '@iamAnKun';

        console.log(`🔐 Creating admin: ${username}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('🔐 Password hashed');

        // Insert admin into label_manager
        try {
            const result = await client.query(`
                INSERT INTO label_manager (username, password_hash, full_name, email, bio, permissions, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                ON CONFLICT (username) 
                DO UPDATE SET 
                    password_hash = EXCLUDED.password_hash,
                    updated_at = NOW()
                RETURNING id, username, email
            `, [
                username,
                hashedPassword,
                'An Kun Studio Admin',
                `${username}@ankun.dev`,
                'DMG Label Manager Account',
                JSON.stringify({ role: 'admin', access: 'all' })
            ]);

            console.log('✅ Admin created/updated:', result.rows[0]);

            // Verify
            const verify = await client.query(`
                SELECT username, email, full_name FROM label_manager WHERE username = $1
            `, [username]);

            console.log('✅ Verification:', verify.rows[0]);

            // Test password
            const passwordTest = await client.query(`
                SELECT password_hash FROM label_manager WHERE username = $1
            `, [username]);

            const isValid = await bcrypt.compare(password, passwordTest.rows[0].password_hash);
            console.log(`🔐 Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

            return true;

        } catch (insertError) {
            console.error('❌ Insert error:', insertError.message);
            return false;
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

createAdmin().then(success => {
    if (success) {
        console.log('\n🎉 ADMIN ACCOUNT READY!');
        console.log('Now you can test authentication');
    } else {
        console.log('\n❌ FAILED TO CREATE ADMIN');
    }
}).catch(console.error);
