// Delete and recreate ID 3 with new username 'variousartist'

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🗑️ DELETE & RECREATE ID 3');
console.log('==========================');
console.log('• Delete old: testartist (ID 3)');
console.log('• Create new: variousartist (ID 3)');

async function deleteAndRecreateId3() {
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

        if (affectedSubmissions.rows.length === 0) {
            console.log('ℹ️ No submissions to update');
        }

        // Start transaction
        await client.query('BEGIN');

        try {
            // Step 1: Update all submissions to use new username
            console.log('\n🔄 Step 1: Updating submissions to new username...');
            if (affectedSubmissions.rows.length > 0) {
                const updateSubmissions = await client.query(`
                    UPDATE submissions 
                    SET uploader_username = 'variousartist'
                    WHERE uploader_username = 'testartist'
                    RETURNING id, title, uploader_username
                `);
                console.log(`✅ Updated ${updateSubmissions.rows.length} submissions:`);
                console.table(updateSubmissions.rows);
            }

            // Step 2: Delete old artist account
            console.log('\n🗑️ Step 2: Deleting old artist account...');
            const deletedArtist = await client.query(`
                DELETE FROM artist WHERE id = 3
                RETURNING id, username, full_name
            `);
            console.log('✅ Deleted artist:', deletedArtist.rows[0]);

            // Step 3: Create new artist account with ID 3
            console.log('\n🆕 Step 3: Creating new artist account...');

            // Hash password for new account
            const password = 'variousartist123'; // Default password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newArtist = await client.query(`
                INSERT INTO artist (
                    id,
                    username, 
                    password_hash, 
                    full_name, 
                    email, 
                    bio, 
                    avatar, 
                    social_links, 
                    created_at, 
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING id, username, full_name, email
            `, [
                3, // Specific ID
                'variousartist',
                hashedPassword,
                'Various Artist',
                'variousartist@ankunstudio.com',
                'Collective artist account for various contributors',
                '/face.png',
                JSON.stringify({
                    website: 'https://ankunstudio.com',
                    spotify: 'various-artist',
                    instagram: '@variousartist'
                })
            ]);

            console.log('✅ Created new artist:', newArtist.rows[0]);

            // Step 4: Reset sequence to ensure no conflicts
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
            console.log('\n🎯 Final verification:');

            // Check new artist account
            const finalArtist = await client.query(`
                SELECT id, username, full_name, email FROM artist WHERE id = 3
            `);
            console.log('🎤 New artist account:');
            console.table(finalArtist.rows);

            // Check submissions are linked correctly
            const finalSubmissions = await client.query(`
                SELECT 
                    s.id as submission_id,
                    s.title,
                    s.uploader_username,
                    a.id as artist_id,
                    a.full_name as artist_name
                FROM submissions s
                LEFT JOIN artist a ON s.uploader_username = a.username
                WHERE s.uploader_username = 'variousartist'
                ORDER BY s.id
            `);

            if (finalSubmissions.rows.length > 0) {
                console.log('📋 Linked submissions:');
                console.table(finalSubmissions.rows);
            }

            // Show all artists for overview
            console.log('\n📊 All artists overview:');
            const allArtists = await client.query(`
                SELECT id, username, full_name FROM artist ORDER BY id
            `);
            console.table(allArtists.rows);

            console.log('\n🎉 DELETE & RECREATE COMPLETED!');
            console.log('Summary:');
            console.log('• Deleted: testartist (old ID 3)');
            console.log('• Created: variousartist (new ID 3) - "Various Artist"');
            console.log(`• Password: ${password}`);
            console.log('• All submissions updated to new username');

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

deleteAndRecreateId3().catch(console.error);
