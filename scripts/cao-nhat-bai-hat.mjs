// Update Submissions với Admin Username để fix Foreign Key

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔄 UPDATING SUBMISSIONS WITH ADMIN USERNAME');
console.log('==========================================');

async function updateSubmissions() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';

        // Add some submissions with admin as uploader
        console.log('📋 Creating submissions for admin...');

        const submissions = [
            {
                title: 'Digital Dreams',
                artist: 'An Kun',
                genre: 'Electronic',
                description: 'An atmospheric electronic track with digital soundscapes'
            },
            {
                title: 'Studio Sessions Vol.1',
                artist: 'An Kun',
                genre: 'Lo-Fi Hip Hop',
                description: 'Collection of lo-fi beats recorded in the studio'
            },
            {
                title: 'Midnight Coding',
                artist: 'An Kun',
                genre: 'Ambient',
                description: 'Perfect background music for late night coding sessions'
            }
        ];

        for (const sub of submissions) {
            try {
                const result = await client.query(`
                    INSERT INTO submissions (
                        title, artist_name, genre, description, status, 
                        uploader_username, submission_date
                    )
                    VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
                    RETURNING id, title, artist_name, uploader_username
                `, [sub.title, sub.artist, sub.genre, sub.description, adminUsername]);

                console.log(`✅ Created: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
            } catch (error) {
                console.log(`⚠️ Skip duplicate: ${sub.title}`);
            }
        }

        // Check all submissions
        console.log('\n📊 All submissions in database:');
        const allSubmissions = await client.query(`
            SELECT id, title, artist_name, status, uploader_username 
            FROM submissions 
            ORDER BY id
        `);

        console.table(allSubmissions.rows);

        console.log(`\n📈 Total submissions: ${allSubmissions.rows.length}`);
        console.log(`🎤 Admin submissions: ${allSubmissions.rows.filter(s => s.uploader_username === adminUsername).length}`);

        return true;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

updateSubmissions().then(success => {
    if (success) {
        console.log('\n🎉 SUBMISSIONS UPDATED SUCCESSFULLY!');
        console.log('Now you can test approve/reject API with real submission IDs');
    } else {
        console.log('\n❌ FAILED TO UPDATE SUBMISSIONS');
    }
}).catch(console.error);
