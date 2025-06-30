const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT username, password_hash, artist_name, real_name FROM artist LIMIT 3`;
    
    console.log('🎤 Artists in database:');
    result.forEach((user, i) => {
      console.log(`${i+1}. Username: ${user.username}`);
      console.log(`   Password: ${user.password_hash}`);
      console.log(`   Artist: ${user.artist_name}`);
      console.log(`   Real Name: ${user.real_name}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
