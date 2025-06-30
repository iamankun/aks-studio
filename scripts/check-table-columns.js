const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Check label_manager columns
    console.log('🏷️ Label Manager table columns:');
    const labelCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'label_manager'`;
    labelCols.forEach(col => console.log('- ' + col.column_name));
    
    console.log('\n🎤 Artist table columns:');
    const artistCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'artist'`;
    artistCols.forEach(col => console.log('- ' + col.column_name));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
