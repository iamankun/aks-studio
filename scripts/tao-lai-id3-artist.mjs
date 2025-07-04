// Recreate ID 3 with username 'variousartist' - Safe approach with data preservation

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔄 RECREATING ID 3 WITH USERNAME "variousartist"');
console.log('================================================');
console.log('Safe approach: Preserve submissions by temporarily moving to ankunstudio');

async function recreateVariousArtist() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check current state
        console.log('\n🔍 Current state before changes:');
        const currentArtists = await client.query(`
            SELECT id, username, full_name FROM artist ORDER BY id
        `);
        console.table(currentArtists.rows);

        const testartistSubmissions = await client.query(`
            SELECT id, title, uploader_username FROM submissions 
            WHERE uploader_username = 'testartist'
            ORDER BY id
        `);
        console.log(`\n📋 Found ${testartistSubmissions.rows.length} submissions by testartist`);
        console.table(testartistSubmissions.rows);

        // Start transaction
        await client.query('BEGIN');

        try {
            // Step 1: Temporarily move testartist submissions to ankunstudio
            console.log('\n🔄 Step 1: Moving testartist submissions to ankunstudio (temporary)...');
            const moveResult = await client.query(`
                UPDATE submissions 
                SET uploader_username = 'ankunstudio'
                WHERE uploader_username = 'testartist'
            `);
            console.log(`✅ Moved ${moveResult.rowCount} submissions to ankunstudio`);

            // Step 2: Delete old testartist account
            console.log('\n🗑️ Step 2: Deleting old testartist account...');
            const deleteResult = await client.query(`
                DELETE FROM artist WHERE username = 'testartist'
            `);
            console.log(`✅ Deleted ${deleteResult.rowCount} artist account`);

            // Step 3: Create new variousartist account with ID 3
            console.log('\n🎨 Step 3: Creating new variousartist account...');

            // Hash a simple password for the account
            const password = 'variousartist123';
            const hashedPassword = await bcrypt.hash(password, 10);

            const createResult = await client.query(`
                INSERT INTO artist (
                    id,
                    username, 
                    password_hash, 
                    full_name, 
                    email, 
                    bio,
                    created_at, 
                    updated_at
                )
                VALUES (3, $1, $2, $3, $4, $5, NOW(), NOW())
                RETURNING id, username, full_name
            `, [
                'variousartist',
                hashedPassword,
                'Various Artist',
                'variousartist@ankunstudio.com',
                'Compilation and Various Artists Collection'
            ]);
            console.log('✅ Created new account:', createResult.rows[0]);

            // Step 4: Move submissions back to variousartist
            console.log('\n🔄 Step 4: Moving submissions back to variousartist...');
            const moveBackResult = await client.query(`
                UPDATE submissions 
                SET uploader_username = 'variousartist'
                WHERE id IN (${testartistSubmissions.rows.map(r => r.id).join(',')})
            `);
            console.log(`✅ Moved ${moveBackResult.rowCount} submissions to variousartist`);

            // Step 5: Reset sequence to ensure no conflicts
            console.log('\n🔄 Step 5: Resetting artist sequence...');
            await client.query(`
                SELECT setval('artist_id_seq', (SELECT MAX(id) FROM artist) + 1, false)
            `);
            console.log('✅ Sequence reset');

            // Commit transaction
            await client.query('COMMIT');
            console.log('✅ Transaction committed successfully');

            // Verify final state
            console.log('\n🎯 Final verification:');

            const finalArtists = await client.query(`
                SELECT id, username, full_name FROM artist ORDER BY id
            `);
            console.log('Artists:');
            console.table(finalArtists.rows);

            const finalSubmissions = await client.query(`
                SELECT uploader_username, COUNT(*) as count 
                FROM submissions 
                GROUP BY uploader_username 
                ORDER BY uploader_username
            `);
            console.log('Submissions by uploader:');
            console.table(finalSubmissions.rows);

            const variousArtistSubmissions = await client.query(`
                SELECT id, title, uploader_username, status 
                FROM submissions 
                WHERE uploader_username = 'variousartist'
                ORDER BY id
            `);
            console.log('Various Artist submissions:');
            console.table(variousArtistSubmissions.rows);

            console.log('\n🎉 SUCCESSFULLY RECREATED ID 3 AS "variousartist"!');
            console.log('Summary:');
            console.log('• ID 1: ankunstudio (Label Manager + Artist)');
            console.log('• ID 2: ankun');
            console.log('• ID 3: variousartist -> "Various Artist"');
            console.log(`• Password for variousartist: ${password}`);

        } catch (error) {
            // Rollback on error
            await client.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
    }
}

recreateVariousArtist().catch(console.error);
