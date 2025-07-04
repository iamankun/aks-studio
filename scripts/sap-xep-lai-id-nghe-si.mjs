// Reorganize Artist IDs: ankun -> 2, testartist -> 3 (rename to Various Artist)

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔄 REORGANIZING ARTIST IDs');
console.log('==========================');
console.log('• ankun -> ID 2');
console.log('• testartist -> ID 3 (rename to "Various Artist")');

async function reorganizeArtistIds() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // First, check current artist IDs
        console.log('\n🔍 Current artist accounts:');
        const currentArtists = await client.query(`
            SELECT id, username, full_name FROM artist ORDER BY id
        `);
        console.table(currentArtists.rows);

        // Check submissions before update
        console.log('\n📋 Current submissions by uploader:');
        const submissionsBefore = await client.query(`
            SELECT uploader_username, COUNT(*) as count 
            FROM submissions 
            GROUP BY uploader_username 
            ORDER BY uploader_username
        `);
        console.table(submissionsBefore.rows);

        // Start transaction
        await client.query('BEGIN');

        try {
            // Step 1: Move all artists to temporary IDs to avoid conflicts
            console.log('\n🔄 Step 1: Moving to temporary IDs...');

            await client.query(`
                UPDATE artist SET id = 1001 WHERE username = 'ankun'
            `);

            await client.query(`
                UPDATE artist SET id = 1002 WHERE username = 'testartist'
            `);

            // Step 2: Update ankun to ID 2
            console.log('\n🔄 Step 2: Setting ankun to ID 2...');
            const ankunUpdate = await client.query(`
                UPDATE artist 
                SET id = 2 
                WHERE username = 'ankun'
                RETURNING id, username, full_name
            `);
            console.log('✅ ankun updated:', ankunUpdate.rows[0]);

            // Step 3: Update testartist to ID 3 and rename to "Various Artist"
            console.log('\n🔄 Step 3: Setting testartist to ID 3 and renaming...');
            const testartistUpdate = await client.query(`
                UPDATE artist 
                SET id = 3, full_name = 'Various Artist'
                WHERE username = 'testartist'
                RETURNING id, username, full_name
            `);
            console.log('✅ testartist updated:', testartistUpdate.rows[0]);

            // Step 4: Reset sequence to avoid future conflicts
            console.log('\n🔄 Step 4: Resetting artist ID sequence...');
            const maxId = await client.query(`
                SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM artist
            `);
            const nextId = maxId.rows[0].next_id;

            await client.query(`
                SELECT setval('artist_id_seq', $1, false)
            `, [nextId]);

            console.log(`✅ Sequence reset to start from ${nextId}`);

            // Commit transaction
            await client.query('COMMIT');
            console.log('✅ Transaction committed successfully');

            // Verify final state
            console.log('\n🎯 Final artist accounts:');
            const finalArtists = await client.query(`
                SELECT id, username, full_name FROM artist ORDER BY id
            `);
            console.table(finalArtists.rows);

            // Check submissions are still linked correctly
            console.log('\n📋 Submissions linking verification:');
            const submissionsCheck = await client.query(`
                SELECT 
                    s.id as submission_id,
                    s.title,
                    s.uploader_username,
                    a.id as artist_id,
                    a.full_name as artist_name
                FROM submissions s
                LEFT JOIN artist a ON s.uploader_username = a.username
                ORDER BY s.id DESC
                LIMIT 10
            `);
            console.table(submissionsCheck.rows);

            console.log('\n🎉 ARTIST ID REORGANIZATION COMPLETED!');
            console.log('Summary:');
            console.log('• ID 1: ankunstudio (Label Manager + Artist)');
            console.log('• ID 2: ankun');
            console.log('• ID 3: testartist -> "Various Artist"');

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

reorganizeArtistIds().catch(console.error);
