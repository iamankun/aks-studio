// @ts-check
/**
 * Script để kiểm tra bảng artists trong database
 * Chạy: node scripts/check-artists-table.js
 */
import {
    connectToDatabase,
    checkTableExists,
    getTableStructure,
    countRecords
} from './utils/db-helper.js';
import { loadEnvVariables, logToFile } from './utils/env-loader.js';

// Load environment variables
loadEnvVariables();

async function checkArtistsTable() {
    console.log('🔍 Kiểm tra bảng artists...');
    console.log('='.repeat(50));

    try {
        // Kiểm tra kết nối database
        const sql = await connectToDatabase();

        // Kiểm tra bảng artists tồn tại không
        const tableExists = await checkTableExists('artists');

        if (!tableExists) {
            console.error('❌ Bảng artists không tồn tại trong database!');
            await logToFile('Bảng artists không tồn tại!', 'artists-check.log');
            return;
        }

        console.log('✅ Bảng artists tồn tại');

        // Lấy cấu trúc bảng
        const columns = await getTableStructure('artists');

        console.log('\n=== Cấu trúc bảng artists ===');
        columns.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // Đếm số lượng artists
        const artistCount = await countRecords('artists');
        console.log(`\n✅ Tổng số artists: ${artistCount}`);

        // Lấy danh sách artists
        const artists = await sql`
            SELECT * FROM artists
            ORDER BY id
            LIMIT 5
        `;

        console.log('\n=== Mẫu dữ liệu artists ===');
        if (artists.length > 0) {
            artists.forEach((artist, index) => {
                console.log(`\n${index + 1}. Artist ID: ${artist.id}`);
                console.log(`   Username: ${artist.username}`);
                console.log(`   Name: ${artist.name || artist.artist_name || 'N/A'}`);
                console.log(`   Email: ${artist.email || 'N/A'}`);
                console.log(`   Created: ${artist.created_at || 'N/A'}`);
            });
        } else {
            console.log('❌ Không có dữ liệu trong bảng artists');
        }

        // Kiểm tra cấu trúc permissions nếu có
        console.log('\n=== Kiểm tra cấu trúc permissions ===');
        const hasPermissions = columns.some(col => col.column_name === 'permissions');

        if (hasPermissions) {
            console.log('✅ Bảng artists có trường permissions');

            // Kiểm tra dữ liệu permissions của một số artist
            const artistsWithPermissions = await sql`
                SELECT id, username, permissions 
                FROM artists 
                WHERE permissions IS NOT NULL
                LIMIT 3
            `;

            if (artistsWithPermissions.length > 0) {
                console.log('Mẫu dữ liệu permissions:');
                artistsWithPermissions.forEach(artist => {
                    console.log(`- ${artist.username}: ${JSON.stringify(artist.permissions)}`);
                });
            } else {
                console.log('⚠️ Không tìm thấy artist nào có dữ liệu permissions');
            }
        } else {
            console.log('⚠️ Bảng artists không có trường permissions');
        }

        console.log('\n=== Kiểm tra kết nối với bảng submissions ===');
        // Kiểm tra artist có submissions không
        const artistWithSubmissions = await sql`
            SELECT a.id, a.username, COUNT(s.id) as submission_count
            FROM artists a
            LEFT JOIN submissions s ON a.id = s.artist_id
            GROUP BY a.id, a.username
            ORDER BY submission_count DESC
            LIMIT 3
        `;

        if (artistWithSubmissions.length > 0) {
            console.log('Artists với submissions:');
            artistWithSubmissions.forEach(row => {
                console.log(`- ${row.username}: ${row.submission_count} submissions`);
            });
        } else {
            console.log('⚠️ Không tìm thấy mối liên kết giữa artists và submissions');
        }

        console.log('\n✅ Kiểm tra hoàn tất!');
        console.log('Đã ghi log vào thư mục logs/');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        await logToFile(`Error: ${error.message}`, 'artists-check.log');
    }
}

// Chạy kiểm tra
checkArtistsTable().catch(console.error);
