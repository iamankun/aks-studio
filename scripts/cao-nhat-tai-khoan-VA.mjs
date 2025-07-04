// Update username of ID 3 from 'testartist' to 'variousartist'

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔄 UPDATING USERNAME FOR ID 3');
console.log('==============================');
console.log('• testartist -> variousartist');

async function updateVariousArtistUsername() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check current state
        console.log('\n🔍 Current artist ID 3:');
        const currentArtist = await client.query(`
            SELECT id, username, full_name FROM artist WHERE id = 3
        `);
        console.table(currentArtist.rows);

        // Check submissions that will be affected
        console.log('\n📋 Submissions with uploader_username = "testartist":');
        const affectedSubmissions = await client.query(`
            SELECT id, title, uploader_username, status FROM submissions 
            WHERE uploader_username = 'testartist'
            ORDER BY id
        `);
        console.table(affectedSubmissions.rows);

        // Start transaction
        await client.query('BEGIN');

        try {
            // Step 1: Temporarily disable foreign key constraint
            console.log('\n🔄 Step 1: Temporarily disabling foreign key constraint...');
            await client.query(`
                ALTER TABLE submissions DISABLE TRIGGER ALL
            `);
            console.log('✅ Foreign key constraints disabled');

            // Step 2: Update artist username
            console.log('\n🔄 Step 2: Updating artist username...');
            const artistUpdate = await client.query(`
                UPDATE artist 
                SET username = 'variousartist'
                WHERE id = 3
                RETURNING id, username, full_name
            `);
            console.log('✅ Artist updated:', artistUpdate.rows[0]);

            // Step 3: Update submissions uploader_username
            console.log('\n🔄 Step 3: Updating submissions uploader_username...');
            const submissionsUpdate = await client.query(`
                UPDATE submissions 
                SET uploader_username = 'variousartist'
                WHERE uploader_username = 'testartist'
                RETURNING id, title, uploader_username
            `);
            console.log(`✅ Updated ${submissionsUpdate.rows.length} submissions`);

            // Step 4: Re-enable foreign key constraint
            console.log('\n🔄 Step 4: Re-enabling foreign key constraint...');
            await client.query(`
                ALTER TABLE submissions ENABLE TRIGGER ALL
            `);
            console.log('✅ Foreign key constraints re-enabled');

            // Commit transaction
            await client.query('COMMIT');
            console.log('✅ Transaction committed successfully');

            // Verify final state
            console.log('\n🎯 Final state verification:');

            console.log('\n🔍 Artist ID 3:');
            const finalArtist = await client.query(`
                SELECT id, username, full_name FROM artist WHERE id = 3
            `);
            console.table(finalArtist.rows);

            console.log('\n📋 Submissions with new username:');
            const finalSubmissions = await client.query(`
                SELECT id, title, uploader_username, status FROM submissions 
                WHERE uploader_username = 'variousartist'
                ORDER BY id
            `);
            console.table(finalSubmissions.rows);

            // Check foreign key integrity
            console.log('\n🔗 Foreign key integrity check:');
            const integrityCheck = await client.query(`
                SELECT 
                    s.id as submission_id,
                    s.title,
                    s.uploader_username,
                    a.id as artist_id,
                    a.username as artist_username,
                    a.full_name as artist_name
                FROM submissions s
                LEFT JOIN artist a ON s.uploader_username = a.username
                WHERE s.uploader_username = 'variousartist'
                ORDER BY s.id
            `);
            console.table(integrityCheck.rows);

            console.log('\n🎉 USERNAME UPDATE COMPLETED!');
            console.log('Summary:');
            console.log('• Artist ID 3: testartist -> variousartist');
            console.log('• Full name: "Various Artist"');
            console.log(`• ${submissionsUpdate.rows.length} submissions updated`);

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

updateVariousArtistUsername().catch(console.error);
