// Fix Foreign Key Issue by adding admin to artist table

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔧 FIXING FOREIGN KEY CONSTRAINT');
console.log('=================================');

async function fixForeignKey() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';

        // Check if admin exists in artist table
        console.log(`\n🔍 Checking if ${adminUsername} exists in artist table...`);
        const existingArtist = await client.query(`
            SELECT username FROM artist WHERE username = $1
        `, [adminUsername]);

        if (existingArtist.rows.length > 0) {
            console.log('✅ Admin already exists in artist table');
        } else {
            console.log('❌ Admin not found in artist table, creating...');

            // Check artist table structure first
            const artistColumns = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'artist'
                ORDER BY ordinal_position;
            `);

            console.log('📋 Artist table structure:');
            console.table(artistColumns.rows);

            // Insert admin into artist table
            try {
                const insertResult = await client.query(`
                    INSERT INTO artist (username, full_name, email, bio, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    ON CONFLICT (username) 
                    DO UPDATE SET 
                        full_name = EXCLUDED.full_name,
                        email = EXCLUDED.email,
                        updated_at = NOW()
                    RETURNING username, full_name, email
                `, [
                    adminUsername,
                    'An Kun Studio Admin',
                    `${adminUsername}@ankun.dev`,
                    'DMG Label Manager - also Artist account for submissions'
                ]);

                console.log('✅ Admin added to artist table:', insertResult.rows[0]);

            } catch (insertError) {
                console.error('❌ Insert error:', insertError.message);

                // Try simpler insert without optional columns
                console.log('🔄 Trying simpler insert...');
                const simpleInsert = await client.query(`
                    INSERT INTO artist (username) 
                    VALUES ($1)
                    ON CONFLICT (username) DO NOTHING
                    RETURNING username
                `, [adminUsername]);

                if (simpleInsert.rows.length > 0) {
                    console.log('✅ Admin added with minimal data:', simpleInsert.rows[0]);
                }
            }
        }

        // Verify the fix
        console.log('\n🔍 Verification - Admin in artist table:');
        const verification = await client.query(`
            SELECT username, full_name, email 
            FROM artist 
            WHERE username = $1
        `, [adminUsername]);

        console.table(verification.rows);

        // Test creating a submission with admin username
        console.log('\n🧪 Testing submission creation with admin username...');
        try {
            const testSubmission = await client.query(`
                INSERT INTO submissions (title, artist_name, uploader_username, status, genre, description)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, title, uploader_username
            `, [
                'Admin Test Track',
                'An Kun Studio',
                adminUsername,
                'pending',
                'Electronic',
                'Test submission by admin'
            ]);

            console.log('✅ Test submission created:', testSubmission.rows[0]);

        } catch (submissionError) {
            console.error('❌ Test submission failed:', submissionError.message);
        }

        console.log('\n🎉 Foreign key constraint should be fixed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

fixForeignKey().catch(console.error);
