// Test// Load environment variables
config({ path: '../.env.local' });

console.log('🔧 Environment check:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   ADMIN_USERNAME: ${process.env.ADMIN_USERNAME || 'Not set'}`);
console.log('');

console.log('🔍 TESTING DIRECT DATABASE AUTHENTICATION');
// Kiểm tra xem tài khoản admin có trong database không

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

// Load environment variables
config({ path: '@/.env.local' });

const { Client } = pg;

console.log('🔍 TESTING DIRECT DATABASE AUTHENTICATION');
console.log('========================================');

async function testDatabaseAuth() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';
        const adminPassword = process.env.ADMIN_PASSWORD || '@iamAnKun';

        console.log(`\n🔐 Testing authentication for: ${adminUsername}`);

        // Check different possible table names
        const tables = ['users', 'label_manager', 'artists'];

        for (const table of tables) {
            console.log(`\n📊 Checking table: ${table}`);

            try {
                // Check if table exists
                const tableCheck = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    );
                `, [table]);

                if (!tableCheck.rows[0].exists) {
                    console.log(`   ❌ Table '${table}' does not exist`);
                    continue;
                }

                console.log(`   ✅ Table '${table}' exists`);

                // Check columns
                const columns = await client.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY ordinal_position;
                `, [table]);

                console.log(`   📋 Columns: ${columns.rows.map(r => r.column_name).join(', ')}`);

                // Try to find admin user
                const possibleUsernameColumns = ['username', 'email', 'user_name'];
                const possiblePasswordColumns = ['password', 'password_hash', 'pass'];

                for (const usernameCol of possibleUsernameColumns) {
                    const hasUsernameCol = columns.rows.some(r => r.column_name === usernameCol);
                    if (!hasUsernameCol) continue;

                    console.log(`   🔍 Searching by ${usernameCol}...`);

                    const userResult = await client.query(`
                        SELECT * FROM ${table} 
                        WHERE ${usernameCol} = $1 
                        LIMIT 1
                    `, [adminUsername]);

                    if (userResult.rows.length > 0) {
                        const user = userResult.rows[0];
                        console.log(`   ✅ Found user in '${table}':`, user);

                        // Check password
                        for (const passwordCol of possiblePasswordColumns) {
                            if (user[passwordCol]) {
                                console.log(`   🔐 Testing password in column '${passwordCol}'...`);

                                const storedPassword = user[passwordCol];

                                // Try direct match
                                if (storedPassword === adminPassword) {
                                    console.log(`   ✅ Direct password match!`);
                                    return { success: true, table, user };
                                }

                                // Try bcrypt match
                                try {
                                    const isMatch = await bcrypt.compare(adminPassword, storedPassword);
                                    if (isMatch) {
                                        console.log(`   ✅ Bcrypt password match!`);
                                        return { success: true, table, user };
                                    } else {
                                        console.log(`   ❌ Bcrypt password mismatch`);
                                    }
                                } catch (bcryptError) {
                                    console.log(`   ⚠️ Not a bcrypt hash: ${storedPassword.substring(0, 20)}...`);
                                }
                            }
                        }
                    } else {
                        console.log(`   ❌ No user found with ${usernameCol} = '${adminUsername}'`);
                    }
                }

                // Show all users in table
                console.log(`   📋 All users in '${table}':`);
                const allUsers = await client.query(`SELECT * FROM ${table} LIMIT 5`);
                allUsers.rows.forEach((user, index) => {
                    const identifier = user.username || user.email || user.user_name || user.id;
                    console.log(`      ${index + 1}. ${identifier} (${user.role || 'no role'})`);
                });

            } catch (tableError) {
                console.log(`   ❌ Error with table '${table}':`, tableError.message);
            }
        }

        console.log('\n❌ Admin user not found in any table');
        return { success: false };

    } catch (error) {
        console.error('❌ Database error:', error);
        return { success: false, error };
    } finally {
        await client.end();
    }
}

// Run test
testDatabaseAuth().then(result => {
    if (result.success) {
        console.log('\n🎉 AUTHENTICATION SETUP FOUND!');
        console.log(`   Table: ${result.table}`);
        console.log(`   User: ${JSON.stringify(result.user, null, 2)}`);
    } else {
        console.log('\n🚨 AUTHENTICATION SETUP NOT FOUND');
        console.log('   Need to create admin user in database');
    }
}).catch(console.error);
