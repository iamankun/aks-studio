// Check artist table schema
require('dotenv').config({ path: '.env.local' });

async function checkArtistSchema() {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking artist table schema...');
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'artist' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Artist table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check sample data
    const sampleData = await sql`
      SELECT * FROM artist LIMIT 2;
    `;
    
    console.log(`\n📊 Sample data (${sampleData.length} rows):`);
    sampleData.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, Object.keys(row));
      if (index === 0) {
        console.log('   Values:', row);
      }
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

checkArtistSchema();
