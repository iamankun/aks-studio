// Check artists table in Neon database
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkArtistsTable() {
    try {
        console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
        const sql = neon(process.env.DATABASE_URL);

        console.log('🔍 Checking artist table...');

        // Check table structure first
        const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artist'
      ORDER BY ordinal_position
    `;
        console.log('Artist table structure:', tableInfo);

        // Count total artists
        const countResult = await sql`SELECT COUNT(*) as count FROM artist`;
        console.log('Total artists:', countResult[0].count);

        // Get sample artists with basic columns
        const artistsResult = await sql`
      SELECT * 
      FROM artist 
      LIMIT 3
    `;
        console.log('Sample artists:', artistsResult);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkArtistsTable();
