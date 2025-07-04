// @ts-check
/**
 * Test script để kiểm tra submissions API
 * Chạy: node scripts/test-submissions.js
 */
import { logToFile } from './utils/env-loader.js';

async function testSubmissions() {
    console.log('🔍 Testing submissions API...');
    console.log('='.repeat(50));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`🌐 API URL: ${baseUrl}`);

    try {
        console.log('Đang gửi request đến /api/submissions...');
        const response = await fetch(`${baseUrl}/api/submissions`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log(`📋 Total submissions: ${data.count || data.data?.length || 0}`);
        console.log(`✅ Success: ${data.success}`);

        if (data.data && data.data.length > 0) {
            console.log('\n🎵 Sample submissions:');
            data.data.slice(0, 3).forEach((submission, index) => {
                console.log(`\n  ${index + 1}. ${submission.track_title || submission.title}`);
                console.log(`     🎤 Artist: ${submission.artist_name}`);
                console.log(`     🖼️ Cover: ${submission.cover_art_url || submission.imageUrl || 'N/A'}`);
                console.log(`     🎵 Audio: ${submission.audio_file_url || submission.audioUrl || 'N/A'}`);
                console.log(`     📊 Status: ${submission.status}`);
                console.log(`     📅 Date: ${submission.submission_date || submission.created_at}`);
            });
        } else {
            console.log('⚠️ Không có submissions nào được trả về');
        }

        // Lưu kết quả kiểm tra vào file log
        await logToFile(`Test submissions API: Success=${data.success}, Count=${data.count || data.data?.length || 0}`, 'api-tests.log');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Kiểm tra Next.js server đã chạy chưa: npm run dev');
        console.log('- Kiểm tra kết nối database trong .env.local');
        console.log('- Kiểm tra API endpoint /api/submissions có hoạt động không');

        await logToFile(`Test submissions API error: ${error.message}`, 'api-tests.log');
    }
}

// Chạy test
testSubmissions().then(() => {
    console.log('\n✅ Test hoàn tất!');
}).catch(error => {
    console.error('Test failed:', error);
});
