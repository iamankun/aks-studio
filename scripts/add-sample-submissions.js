// Add more sample submissions to database
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function addMoreSubmissions() {
    try {
        const sql = neon(process.env.DATABASE_URL);

        console.log('📝 Adding more sample submissions...');

        // Add 7 more submissions for testing
        const newSubmissions = [
            {
                title: 'Midnight Groove',
                artist_name: 'An Kun',
                uploader_username: 'ankun',
                status: 'approved',
                genre: 'Deep House',
                description: 'Track deep house với giai điệu đêm muộn'
            },
            {
                title: 'City Lights',
                artist_name: 'Test Artist',
                uploader_username: 'testartist',
                status: 'pending',
                genre: 'Electronic',
                description: 'Âm thanh của thành phố về đêm'
            },
            {
                title: 'Ocean Waves',
                artist_name: 'An Kun',
                uploader_username: 'ankun',
                status: 'rejected',
                genre: 'Ambient',
                description: 'Âm thanh thiên nhiên kết hợp với electronic'
            },
            {
                title: 'Dance Floor',
                artist_name: 'Test Artist',
                uploader_username: 'testartist',
                status: 'approved',
                genre: 'EDM',
                description: 'Track EDM sôi động cho sàn nhảy'
            },
            {
                title: 'Acoustic Dreams',
                artist_name: 'An Kun',
                uploader_username: 'ankun',
                status: 'under_review',
                genre: 'Acoustic',
                description: 'Kết hợp guitar acoustic với electronic'
            },
            {
                title: 'Neon Nights',
                artist_name: 'Test Artist',
                uploader_username: 'testartist',
                status: 'pending',
                genre: 'Synthwave',
                description: 'Retro synthwave với màu sắc neon'
            },
            {
                title: 'Future Bass',
                artist_name: 'An Kun',
                uploader_username: 'ankun',
                status: 'approved',
                genre: 'Future Bass',
                description: 'Future bass với drop mạnh mẽ'
            }
        ];

        // Insert each submission
        for (const submission of newSubmissions) {
            await sql`
        INSERT INTO submissions (title, artist_name, uploader_username, status, genre, description, submission_date, metadata)
        VALUES (${submission.title}, ${submission.artist_name}, ${submission.uploader_username}, 
                ${submission.status}, ${submission.genre}, ${submission.description}, 
                NOW(), '{}')
      `;
            console.log(`✅ Added: ${submission.title} by ${submission.artist_name}`);
        }

        // Check final count
        const countResult = await sql`SELECT COUNT(*) as count FROM submissions`;
        console.log(`🎉 Total submissions now: ${countResult[0].count}`);

        // Show status distribution
        const statusCounts = await sql`
      SELECT status, COUNT(*) as count 
      FROM submissions 
      GROUP BY status 
      ORDER BY count DESC
    `;
        console.log('📊 Status distribution:', statusCounts);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addMoreSubmissions();
