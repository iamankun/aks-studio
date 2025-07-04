// Update ankunstudio account ID to 1 for both Label Manager and Artist roles

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔄 UPDATING ANKUNSTUDIO ID TO 1');
console.log('===============================');

async function updateAnkunstudioId() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const username = 'ankunstudio';

        // First, check current IDs
        console.log('\n🔍 Current account IDs:');

        const currentLabelManager = await client.query(`
            SELECT id, username, full_name FROM label_manager WHERE username = $1
        `, [username]);

        const currentArtist = await client.query(`
            SELECT id, username, full_name FROM artist WHERE username = $1
        `, [username]);

        if (currentLabelManager.rows.length > 0) {
            console.log('📋 Label Manager:', currentLabelManager.rows[0]);
        }

        if (currentArtist.rows.length > 0) {
            console.log('🎤 Artist:', currentArtist.rows[0]);
        }

        // Check if ID 1 is already taken in either table
        console.log('\n🔍 Checking if ID 1 is available:');

        const labelManagerId1 = await client.query(`
            SELECT id, username FROM label_manager WHERE id = 1
        `);

        const artistId1 = await client.query(`
            SELECT id, username FROM artist WHERE id = 1
        `);

        if (labelManagerId1.rows.length > 0) {
            console.log('⚠️ Label Manager ID 1 is taken by:', labelManagerId1.rows[0]);
        } else {
            console.log('✅ Label Manager ID 1 is available');
        }

        if (artistId1.rows.length > 0) {
            console.log('⚠️ Artist ID 1 is taken by:', artistId1.rows[0]);
        } else {
            console.log('✅ Artist ID 1 is available');
        }

        // Begin transaction
        await client.query('BEGIN');

        try {
            // Check and handle submissions that reference the current artist ID
            if (currentArtist.rows.length > 0) {
                const currentArtistId = currentArtist.rows[0].id;

                console.log(`\n🔗 Checking submissions linked to artist ID ${currentArtistId}:`);
                const linkedSubmissions = await client.query(`
                    SELECT id, title, uploader_username 
                    FROM submissions 
                    WHERE uploader_username = $1
                `, [username]);

                console.log(`Found ${linkedSubmissions.rows.length} submissions linked to ${username}`);
                if (linkedSubmissions.rows.length > 0) {
                    console.table(linkedSubmissions.rows);
                }
            }

            // Update Label Manager ID to 1 (if needed)
            if (currentLabelManager.rows.length > 0 && currentLabelManager.rows[0].id !== 1) {
                if (labelManagerId1.rows.length > 0) {
                    // Move existing ID 1 to a temporary ID first
                    await client.query(`
                        UPDATE label_manager 
                        SET id = (SELECT COALESCE(MAX(id), 0) + 1 FROM label_manager)
                        WHERE id = 1
                    `);
                    console.log('🔄 Moved existing Label Manager ID 1 to temporary ID');
                }

                await client.query(`
                    UPDATE label_manager 
                    SET id = 1 
                    WHERE username = $1
                `, [username]);

                console.log('✅ Updated Label Manager ID to 1');
            }

            // Update Artist ID to 1 (if needed)
            if (currentArtist.rows.length > 0 && currentArtist.rows[0].id !== 1) {
                if (artistId1.rows.length > 0) {
                    // Move existing ID 1 to a temporary ID first
                    await client.query(`
                        UPDATE artist 
                        SET id = (SELECT COALESCE(MAX(id), 0) + 1 FROM artist)
                        WHERE id = 1
                    `);
                    console.log('🔄 Moved existing Artist ID 1 to temporary ID');
                }

                await client.query(`
                    UPDATE artist 
                    SET id = 1 
                    WHERE username = $1
                `, [username]);

                console.log('✅ Updated Artist ID to 1');
            }

            // Reset sequence to ensure new records get proper IDs
            await client.query(`
                SELECT setval('label_manager_id_seq', (SELECT COALESCE(MAX(id), 0) FROM label_manager), true)
            `);

            await client.query(`
                SELECT setval('artist_id_seq', (SELECT COALESCE(MAX(id), 0) FROM artist), true)
            `);

            console.log('🔄 Reset ID sequences');

            // Commit transaction
            await client.query('COMMIT');
            console.log('✅ Transaction committed successfully');

            // Verify final state
            console.log('\n🎯 Final verification:');

            const finalLabelManager = await client.query(`
                SELECT id, username, full_name FROM label_manager WHERE username = $1
            `, [username]);

            const finalArtist = await client.query(`
                SELECT id, username, full_name FROM artist WHERE username = $1
            `, [username]);

            if (finalLabelManager.rows.length > 0) {
                console.log('📋 Label Manager final:', finalLabelManager.rows[0]);
            }

            if (finalArtist.rows.length > 0) {
                console.log('🎤 Artist final:', finalArtist.rows[0]);
            }

            // Verify submissions still work
            console.log('\n🔗 Verifying submissions still link correctly:');
            const verifySubmissions = await client.query(`
                SELECT s.id, s.title, s.uploader_username, a.id as artist_id, a.full_name
                FROM submissions s
                LEFT JOIN artist a ON s.uploader_username = a.username
                WHERE s.uploader_username = $1
                LIMIT 5
            `, [username]);

            if (verifySubmissions.rows.length > 0) {
                console.table(verifySubmissions.rows);
            }

            return true;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Transaction rolled back due to error:', error.message);
            throw error;
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

updateAnkunstudioId().then(success => {
    if (success) {
        console.log('\n🎉 ANKUNSTUDIO ID UPDATE COMPLETED!');
        console.log('✅ Both Label Manager and Artist now have ID = 1');
        console.log('✅ All submissions still link correctly');
        console.log('✅ Database sequences reset properly');
    } else {
        console.log('\n❌ ID UPDATE FAILED');
    }
}).catch(console.error);
