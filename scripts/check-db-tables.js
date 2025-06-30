// Check database tables
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking database tables...');
    
    // Query to get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    if (tables.length === 0) {
      console.log('❌ No tables found in the database');
      
      // Try to create basic tables
      console.log('🔧 Creating basic tables...');
      
      // Create artist table
      await sql`
        CREATE TABLE IF NOT EXISTS artist (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          fullname VARCHAR(100),
          avatar VARCHAR(255),
          bio TEXT,
          facebook VARCHAR(255),
          youtube VARCHAR(255),
          spotify VARCHAR(255),
          applemusic VARCHAR(255),
          tiktok VARCHAR(255),
          instagram VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      // Create submission table
      await sql`
        CREATE TABLE IF NOT EXISTS submission (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          song_title VARCHAR(200) NOT NULL,
          artist_name VARCHAR(100) NOT NULL,
          album_name VARCHAR(200),
          main_category VARCHAR(50),
          sub_category VARCHAR(50),
          release_type VARCHAR(50),
          release_date DATE,
          status VARCHAR(100) DEFAULT 'Đã nhận, đang chờ duyệt',
          submission_date DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (username) REFERENCES artist(username)
        );
      `;
      
      console.log('✅ Basic tables created successfully');
      
      // Check again
      const newTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      console.log('📋 Tables after creation:');
      newTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check error:', error.message);
  }
}

checkTables();
