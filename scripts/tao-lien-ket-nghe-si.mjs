// Fix Foreign Key - Tạo Artist Account Liên Kết với Label Manager
// An Kun vừa là Label Manager vừa là Artist

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🎵 CREATING LINKED ARTIST ACCOUNT');
console.log('=================================');

async function createLinkedArtist() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';
        const adminPassword = process.env.ADMIN_PASSWORD || '@iamAnKun';

        console.log(`🎤 Creating artist account for: ${adminUsername}`);        // Check if artist already exists
        const existingArtist = await client.query(`
            SELECT username, full_name FROM artist WHERE username = $1
        `, [adminUsername]);

        if (existingArtist.rows.length > 0) {
            console.log('✅ Artist account already exists:', existingArtist.rows[0]);
            return true;
        }

        // Hash password (same as label manager)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create artist account linked to label manager
        const result = await client.query(`
            INSERT INTO artist (
                username, 
                password_hash, 
                full_name, 
                email, 
                bio, 
                avatar, 
                social_links, 
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (username) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                updated_at = NOW()
            RETURNING username, full_name, email
        `, [
            adminUsername,
            hashedPassword,
            'An Kun',  // Artist full_name
            `${adminUsername}@ankun.dev`,
            'An Kun Studio - Digital Music Producer & Label Manager',
            '/face.png',
            JSON.stringify({
                website: 'https://ankun.dev',
                spotify: 'ankunstudio',
                instagram: '@ankunstudio',
                youtube: 'AnKunStudio'
            })
        ]);

        console.log('✅ Artist account created:', result.rows[0]);

        // Verify both accounts exist
        console.log('\n🔍 Verifying dual role setup:');

        const labelManager = await client.query(`
            SELECT username, full_name FROM label_manager WHERE username = $1
        `, [adminUsername]);

        const artist = await client.query(`
            SELECT username, full_name FROM artist WHERE username = $1
        `, [adminUsername]);

        if (labelManager.rows.length > 0 && artist.rows.length > 0) {
            console.log('✅ Dual Role Setup Complete:');
            console.log(`   📋 Label Manager: ${labelManager.rows[0].full_name}`);
            console.log(`   🎤 Artist: ${artist.rows[0].full_name}`);
            console.log(`   🔗 Username: ${adminUsername} (same for both roles)`);

            // Test password for both accounts
            const labelManagerPassword = await client.query(`
                SELECT password_hash FROM label_manager WHERE username = $1
            `, [adminUsername]);

            const artistPassword = await client.query(`
                SELECT password_hash FROM artist WHERE username = $1
            `, [adminUsername]);

            const labelPasswordValid = await bcrypt.compare(adminPassword, labelManagerPassword.rows[0].password_hash);
            const artistPasswordValid = await bcrypt.compare(adminPassword, artistPassword.rows[0].password_hash);

            console.log(`   🔐 Label Manager Auth: ${labelPasswordValid ? '✅' : '❌'}`);
            console.log(`   🔐 Artist Auth: ${artistPasswordValid ? '✅' : '❌'}`);

            return true;
        } else {
            console.log('❌ Dual role setup incomplete');
            return false;
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        await client.end();
    }
}

createLinkedArtist().then(success => {
    if (success) {
        console.log('\n🎉 LINKED ARTIST ACCOUNT READY!');
        console.log('Now you can:');
        console.log('  • Login as Label Manager (approve/reject submissions)');
        console.log('  • Create submissions as Artist');
        console.log('  • No more foreign key constraint errors');
    } else {
        console.log('\n❌ FAILED TO CREATE LINKED ARTIST');
    }
}).catch(console.error);
