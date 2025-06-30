// Check submissions table schema
require('dotenv').config({ path: '.env.local' });

async function checkSubmissionsSchema() {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking submissions table schema...');
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Submissions table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Also check some sample data
    const sampleData = await sql`
      SELECT * FROM submissions LIMIT 3;
    `;
    
    console.log(`\n📊 Sample data (${sampleData.length} rows):`);
    sampleData.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, Object.keys(row));
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

checkSubmissionsSchema();
