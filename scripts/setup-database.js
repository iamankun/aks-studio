/**
 * Database Setup Script - AKs Studio Digital Music Platform
 * Cập nhật: July 2025
 * 
 * Script này sẽ thực hiện:
 * 1. Drop các bảng cũ (nếu có)
 * 2. Tạo lại các bảng với schema mới
 * 3. Insert dữ liệu mẫu
 * 4. Verify kết nối và dữ liệu
 */

import('dotenv').then(dotenv => dotenv.config({ path: '.env.local' }));

async function setupDatabase() {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🚀 Bắt đầu setup database...\n');

    try {
        // STEP 1: Drop existing tables
        console.log('📋 STEP 1: Dropping existing tables...');
        
        await sql`DROP TABLE IF EXISTS submissions CASCADE`;
        await sql`DROP TABLE IF EXISTS artist CASCADE`;
        await sql`DROP TABLE IF EXISTS label_manager CASCADE`;
        
        console.log('✅ Đã drop các bảng cũ');

        // STEP 2: Create tables with updated schema
        console.log('\n📋 STEP 2: Creating new tables...');
        
        // Create artist table
        await sql`
            CREATE TABLE artist (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                bio TEXT,
                avatar VARCHAR(255),
                social_links JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Created artist table');

        // Create label_manager table
        await sql`
            CREATE TABLE label_manager (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                bio TEXT,
                avatar VARCHAR(255),
                permissions JSONB DEFAULT '{"canManageArtists": true, "canViewAllSubmissions": true, "canManageSystem": true}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Created label_manager table');

        // Create submissions table
        await sql`
            CREATE TABLE submissions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                artist_name VARCHAR(100) NOT NULL,
                uploader_username VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                file_path VARCHAR(255),
                artwork_path VARCHAR(255),
                genre VARCHAR(100),
                description TEXT,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSONB DEFAULT '{}',
                FOREIGN KEY (uploader_username) REFERENCES artist(username) ON DELETE CASCADE
            )
        `;
        console.log('✅ Created submissions table');

        // STEP 3: Insert sample data
        console.log('\n📋 STEP 3: Inserting sample data...');
        
        // Insert sample artists with bcrypt hashed passwords
        const bcrypt = await import('bcrypt');
        const password1 = await bcrypt.hash('admin123', 10);
        const password2 = await bcrypt.hash('artist123', 10);
        const password3 = await bcrypt.hash('manager123', 10);

        await sql`
            INSERT INTO artist (username, password_hash, full_name, email, bio, avatar, social_links) VALUES
            ('ankun', ${password1}, 'An Kun', 'ankun@aksstudio.com', 'Producer & Founder of AKs Studio', '/face.png', '{"youtube": "AnKunStudio", "facebook": "aksstudio"}'),
            ('testartist', ${password2}, 'Test Artist', 'test@aksstudio.com', 'Demo nghệ sĩ để test hệ thống', '/face.png', '{"spotify": "testartist", "instagram": "testartist"}')
        `;
        console.log('✅ Inserted sample artists');

        await sql`
            INSERT INTO label_manager (username, password_hash, full_name, email, bio, avatar, permissions) VALUES
            ('admin', ${password3}, 'AKs Studio Admin', 'admin@aksstudio.com', 'Label Manager - Full Access', '/face.png', '{"canManageArtists": true, "canViewAllSubmissions": true, "canManageSystem": true}')
        `;
        console.log('✅ Inserted sample label manager');

        await sql`
            INSERT INTO submissions (title, artist_name, uploader_username, status, genre, description) VALUES
            ('Demo Track 1', 'An Kun', 'ankun', 'approved', 'Electronic', 'Track demo đầu tiên từ AKs Studio'),
            ('Test Song', 'Test Artist', 'testartist', 'pending', 'Pop', 'Bài hát test để kiểm tra hệ thống'),
            ('Summer Vibes', 'An Kun', 'ankun', 'under_review', 'House', 'Track mùa hè với giai điệu sôi động')
        `;
        console.log('✅ Inserted sample submissions');

        // STEP 4: Verify data
        console.log('\n📋 STEP 4: Verifying setup...');
        
        const artistCount = await sql`SELECT COUNT(*) as count FROM artist`;
        const managerCount = await sql`SELECT COUNT(*) as count FROM label_manager`;
        const submissionCount = await sql`SELECT COUNT(*) as count FROM submissions`;
        
        console.log(`✅ Artists: ${artistCount[0].count}`);
        console.log(`✅ Label Managers: ${managerCount[0].count}`);
        console.log(`✅ Submissions: ${submissionCount[0].count}`);

        // Test sample data
        const sampleArtist = await sql`SELECT username, full_name, email FROM artist LIMIT 1`;
        const sampleSubmission = await sql`SELECT title, artist_name, status FROM submissions LIMIT 1`;
        
        console.log('\n📋 Sample Data:');
        console.log('Sample Artist:', sampleArtist[0]);
        console.log('Sample Submission:', sampleSubmission[0]);

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('Artist: ankun / admin123');
        console.log('Artist: testartist / artist123');
        console.log('Label Manager: admin / manager123');

    } catch (error) {
        console.error('❌ Error during database setup:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();
