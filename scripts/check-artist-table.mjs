// Check Artist Table Structure

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

async function checkArtistTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('📊 ARTIST TABLE STRUCTURE:');
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'artist'
            ORDER BY ordinal_position;
        `);

        console.table(columns.rows);

        console.log('\n📋 Sample artist data:');
        const sample = await client.query(`SELECT * FROM artist LIMIT 3`);
        console.table(sample.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkArtistTable();
