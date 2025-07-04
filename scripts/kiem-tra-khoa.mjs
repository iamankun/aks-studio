// Check Foreign Key Constraints for submissions table

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔍 CHECKING FOREIGN KEY CONSTRAINTS');
console.log('==================================');

async function checkConstraints() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check submissions table structure
        console.log('\n📋 Submissions table structure:');
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'submissions'
            ORDER BY ordinal_position;
        `);

        console.table(columns.rows);

        // Check foreign key constraints
        console.log('\n🔗 Foreign key constraints:');
        const constraints = await client.query(`
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'submissions';
        `);

        console.table(constraints.rows);

        // Check what uploader_username values exist in submissions
        console.log('\n👤 Uploader username values in submissions:');
        const usernames = await client.query(`
            SELECT DISTINCT uploader_username, COUNT(*) as count
            FROM submissions 
            WHERE uploader_username IS NOT NULL
            GROUP BY uploader_username
            LIMIT 10;
        `);

        console.table(usernames.rows);

        // Check what usernames exist in referenced tables
        const possibleTables = ['users', 'artist', 'label_manager'];

        for (const table of possibleTables) {
            try {
                console.log(`\n📊 Usernames in ${table}:`);
                const tableUsers = await client.query(`
                    SELECT username FROM ${table} 
                    WHERE username IS NOT NULL
                    LIMIT 10;
                `);
                console.table(tableUsers.rows);
            } catch (error) {
                console.log(`   ❌ Table ${table} not accessible: ${error.message}`);
            }
        }

        // Show sample submissions data
        console.log('\n🎵 Sample submissions:');
        const samples = await client.query(`
            SELECT id, title, artist_name, uploader_username, status, submission_date
            FROM submissions 
            ORDER BY submission_date DESC
            LIMIT 5;
        `);

        console.table(samples.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkConstraints().catch(console.error);
