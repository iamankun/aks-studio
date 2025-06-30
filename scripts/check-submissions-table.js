// Check submissions table structure and add sample data
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkAndAddSubmissions() {
  try {
    console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking submissions table...');
    
    // Check table structure first
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'submissions'
      ORDER BY ordinal_position
    `;
    console.log('Submissions table structure:', tableInfo);
    
    // Count current submissions
    const countResult = await sql`SELECT COUNT(*) as count FROM submissions`;
    console.log('Current submissions count:', countResult[0].count);
    
    // Get sample submissions
    const existingSubmissions = await sql`
      SELECT * 
      FROM submissions 
      LIMIT 3
    `;
    console.log('Existing submissions:', existingSubmissions);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndAddSubmissions();
