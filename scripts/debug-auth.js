const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Test authentication logic
    const username = 'artist1';
    const password = 'admin';
    
    console.log('🔍 Testing authentication for:', username);
    
    const result = await sql`SELECT * FROM artist WHERE username = ${username}`;
    
    if (result.length > 0) {
      const user = result[0];
      console.log('👤 User found:', {
        username: user.username,
        password_hash: user.password_hash,
        email: user.email,
        artist_name: user.artist_name
      });
      
      // Test password verification
      let passwordValid = false;
      
      if (user.password_hash?.startsWith('$2b$')) {
        console.log('🔐 Testing bcrypt password...');
        passwordValid = await bcrypt.compare(password, user.password_hash);
        console.log('🔐 Bcrypt result:', passwordValid);
      } else {
        console.log('🔑 Testing plain text password...');
        passwordValid = user.password_hash === password;
        console.log('🔑 Plain text result:', passwordValid);
      }
      
      console.log('✅ Final authentication result:', passwordValid);
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
