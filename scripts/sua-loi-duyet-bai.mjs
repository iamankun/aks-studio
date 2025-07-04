// Debug Approve/Reject API với Direct Database Call

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🐛 DEBUGGING APPROVE/REJECT API');
console.log('===============================');

async function debugApproveReject() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const submissionId = 14; // Digital Dreams

        // Get submission trước khi update
        console.log(`\n🔍 Getting submission ${submissionId}:`);
        const beforeUpdate = await client.query(`
            SELECT id, title, artist_name, status, uploader_username
            FROM submissions 
            WHERE id = $1;
        `, [submissionId]);

        if (beforeUpdate.rows.length === 0) {
            console.log('❌ Submission not found!');
            return;
        }

        console.table(beforeUpdate.rows);

        // Test direct SQL update theo cách backend sẽ làm
        console.log('\n🔧 Testing direct SQL update...');

        const updateData = {
            status: 'approved'
        };

        const updateResult = await client.query(`
            UPDATE submissions 
            SET 
                status = $1
            WHERE id = $2
            RETURNING *;
        `, [updateData.status, submissionId]);

        if (updateResult.rows.length > 0) {
            console.log('✅ Direct SQL update successful:');
            console.table(updateResult.rows);

            // Reset lại status để test lại
            await client.query(`
                UPDATE submissions 
                SET status = 'pending'
                WHERE id = $1;
            `, [submissionId]);

            console.log('🔄 Reset status back to pending for further testing');
        } else {
            console.log('❌ Direct SQL update failed');
        }

        // Check tất cả columns có thể update
        console.log('\n📊 Available columns in submissions table:');
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'submissions'
            ORDER BY ordinal_position;
        `);

        console.table(columns.rows);

        // Test tất cả possible updates
        console.log('\n🧪 Testing all possible field updates...');

        const testUpdates = {
            title: 'Test Update Title',
            artist_name: 'Test Artist',
            status: 'approved',
            genre: 'Test Genre',
            description: 'Test Description',
            rejection_reason: null,
            updated_at: new Date().toISOString()
        };

        const testResult = await client.query(`
            UPDATE submissions 
            SET 
                title = COALESCE($1, title),
                artist_name = COALESCE($2, artist_name),
                status = COALESCE($3, status),
                genre = COALESCE($4, genre),
                description = COALESCE($5, description),
                rejection_reason = COALESCE($6, rejection_reason)
            WHERE id = $7
            RETURNING *;
        `, [
            testUpdates.title,
            testUpdates.artist_name,
            testUpdates.status,
            testUpdates.genre,
            testUpdates.description,
            testUpdates.rejection_reason,
            submissionId
        ]);

        if (testResult.rows.length > 0) {
            console.log('✅ Full field update successful:');
            console.table(testResult.rows);
        } else {
            console.log('❌ Full field update failed');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
    }
}

debugApproveReject().catch(console.error);
