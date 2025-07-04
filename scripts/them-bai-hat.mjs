// Add Real Submissions to Database for Testing
// Thêm submission thực để test approve/reject API

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🎵 ADDING REAL SUBMISSIONS FOR TESTING');
console.log('====================================');

async function addTestSubmissions() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check submissions table structure
        console.log('\n📋 Checking submissions table structure...');
        const tableInfo = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'submissions'
            ORDER BY ordinal_position;
        `);

        if (tableInfo.rows.length === 0) {
            console.log('❌ Submissions table not found');
            return false;
        }

        console.log('✅ Submissions table columns:');
        tableInfo.rows.forEach(col => {
            console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Sample submissions data
        const testSubmissions = [
            {
                title: 'Sunset Dreams',
                artist_name: 'An Kun Studio',
                uploader_username: 'ankunstudio',
                genre: 'Electronic',
                status: 'pending',
                description: 'A beautiful electronic track about sunset dreams',
                file_path: '/uploads/sunset-dreams.mp3',
                artwork_path: '/uploads/sunset-dreams.jpg'
            },
            {
                title: 'Morning Coffee',
                artist_name: 'Café Beats',
                uploader_username: 'cafebeats',
                genre: 'Lo-Fi',
                status: 'pending',
                description: 'Relaxing lo-fi beats for your morning coffee',
                file_path: '/uploads/morning-coffee.mp3',
                artwork_path: '/uploads/morning-coffee.jpg'
            },
            {
                title: 'Neon Lights',
                artist_name: 'Synthwave Master',
                uploader_username: 'synthmaster',
                genre: 'Synthwave',
                status: 'pending',
                description: 'Retro synthwave with neon vibes',
                file_path: '/uploads/neon-lights.mp3',
                artwork_path: '/uploads/neon-lights.jpg'
            }
        ]; console.log('\n🎵 Adding test submissions...');

        for (const submission of testSubmissions) {
            try {
                const result = await client.query(`
                    INSERT INTO submissions (
                        title, artist_name, uploader_username, genre, 
                        status, description, file_path, artwork_path, 
                        submission_date, metadata
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
                    RETURNING id, title, artist_name, status
                `, [
                    submission.title,
                    submission.artist_name,
                    submission.uploader_username,
                    submission.genre,
                    submission.status,
                    submission.description,
                    submission.file_path,
                    submission.artwork_path,
                    JSON.stringify({ added_by: 'test_script' })
                ]);

                console.log(`✅ Added: "${result.rows[0].title}" by ${result.rows[0].artist_name} (ID: ${result.rows[0].id})`);

            } catch (insertError) {
                console.log(`❌ Failed to add "${submission.title}":`, insertError.message);
            }
        }

        // Show all submissions
        console.log('\n📊 All submissions in database:');
        const allSubmissions = await client.query(`
            SELECT id, title, artist_name, status, submission_date
            FROM submissions 
            ORDER BY submission_date DESC
            LIMIT 10
        `);

        allSubmissions.rows.forEach((sub, index) => {
            console.log(`   ${index + 1}. [${sub.id}] "${sub.title}" by ${sub.artist_name} (${sub.status})`);
        });

        return true;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

addTestSubmissions().then(success => {
    if (success) {
        console.log('\n🎉 TEST SUBMISSIONS ADDED!');
        console.log('Now you can test approve/reject API with real submission IDs');
    } else {
        console.log('\n❌ FAILED TO ADD SUBMISSIONS');
    }
}).catch(console.error);
