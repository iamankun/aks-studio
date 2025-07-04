// Update Admin Account in Neon PostgreSQL Database
// Cập nhật tài khoản admin -> ankunstudio với password @iamAnKun

import pg from 'pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

const { Client } = pg;

// Database connection
const connectionString = process.env.DATABASE_URL

console.log('🔄 UPDATING ADMIN ACCOUNT IN DATABASE');
console.log('====================================');

async function updateAdminAccount() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('📡 Connecting to Neon PostgreSQL...');
        await client.connect();
        console.log('✅ Connected successfully!');

        // 1. Check current admin accounts
        console.log('\n👤 Current admin accounts:');
        const currentAdmins = await client.query(`
            SELECT id, username, email, full_name 
            FROM label_manager 
            ORDER BY id
        `);

        currentAdmins.rows.forEach(admin => {
            console.log(`   🔑 ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}`);
        });

        // 2. Hash the new password
        console.log('\n🔐 Hashing new password...');
        const newPassword = '@iamAnKun';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log(`✅ Password hashed: ${hashedPassword.substring(0, 20)}...`);

        // 3. Update or Insert ankunstudio admin
        console.log('\n🔄 Updating admin account...');

        // First, check if ankunstudio user exists
        const existingUser = await client.query(`
            SELECT id FROM label_manager 
            WHERE username = 'ankunstudio'
        `);

        if (existingUser.rows.length > 0) {
            // Update existing user
            console.log('   📝 Updating existing ankunstudio user...');
            const updateResult = await client.query(`
                UPDATE label_manager 
                SET password_hash = $1,
                    email = 'admin@ankun.dev',
                    full_name = 'An Kun Studio Admin',
                    updated_at = CURRENT_TIMESTAMP
                WHERE username = 'ankunstudio'
                RETURNING id, username, email
            `, [hashedPassword]);

            console.log(`   ✅ Updated user ID: ${updateResult.rows[0].id}`);
        } else {
            // Insert new user
            console.log('   ➕ Creating new ankunstudio admin user...');
            const insertResult = await client.query(`
                INSERT INTO label_manager (username, email, password_hash, full_name, avatar, bio, created_at, updated_at)
                VALUES ('ankunstudio', 'admin@ankun.dev', $1, 'An Kun Studio Admin', '/Logo-An-Kun-Studio-Black.png', 'An Kun Studio Digital Music Distribution Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, username, email
            `, [hashedPassword]);

            console.log(`   ✅ Created new user ID: ${insertResult.rows[0].id}`);
        }

        // 4. Also update/remove old admin if exists
        const oldAdmin = await client.query(`
            SELECT id FROM label_manager 
            WHERE username = 'admin' AND username != 'ankunstudio'
        `);

        if (oldAdmin.rows.length > 0) {
            console.log('\n🗑️ Removing old admin account...');
            await client.query(`
                DELETE FROM label_manager 
                WHERE username = 'admin' AND username != 'ankunstudio'
            `);
            console.log('   ✅ Old admin account removed');
        }

        // 5. Verify final result
        console.log('\n✅ Final admin accounts:');
        const finalAdmins = await client.query(`
            SELECT id, username, email, full_name, created_at
            FROM label_manager 
            ORDER BY id
        `);

        finalAdmins.rows.forEach(admin => {
            console.log(`   👤 ${admin.username} (${admin.email}) - ${admin.full_name}`);
            console.log(`      Created: ${admin.created_at}`);
        });

        // 6. Test the new credentials
        console.log('\n🧪 Testing new credentials...');
        const testResult = await client.query(`
            SELECT id, username, email, password_hash 
            FROM label_manager 
            WHERE username = 'ankunstudio'
        `);

        if (testResult.rows.length > 0) {
            const user = testResult.rows[0];
            const passwordValid = await bcrypt.compare('@iamAnKun', user.password_hash);
            console.log(`   🔐 Password test: ${passwordValid ? '✅ VALID' : '❌ INVALID'}`);

            if (passwordValid) {
                console.log('\n🎉 SUCCESS! Admin account updated successfully!');
                console.log('   📋 Login credentials:');
                console.log('   Username: ankunstudio');
                console.log('   Password: @iamAnKun');
                console.log('   Role: Label Manager');
            }
        }

        return {
            success: true,
            username: 'ankunstudio',
            password: '@iamAnKun'
        };

    } catch (error) {
        console.error('❌ Error updating admin account:', error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        await client.end();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the update
if (import.meta.url === `file://${process.argv[1]}`) {
    updateAdminAccount().catch(console.error);
}

export { updateAdminAccount };
