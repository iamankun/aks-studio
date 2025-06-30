#!/usr/bin/env node

// PostgreSQL Direct Migration Runner for DMG Project
// Author: An Kun Studio Digital Music Distribution
// Usage: node pg-migrate.js

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🚀 DMG PostgreSQL Migration Runner');
console.log('==========================================');

async function runMigration() {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        console.log('🔍 Connecting to PostgreSQL...');
        await client.connect();
        console.log('✅ Database connection successful!');

        // Script execution order
        const scripts = [
            {
                file: 'step2_create_tables.sql',
                description: 'Creating fresh table structure'
            },
            {
                file: 'step3_insert_data.sql',
                description: 'Inserting initial data'
            }
        ];

        for (const script of scripts) {
            console.log(`\n📝 ${script.description}...`);
            console.log(`📂 Running: ${script.file}`);

            const scriptPath = path.join(__dirname, script.file);

            if (!fs.existsSync(scriptPath)) {
                console.error(`❌ Script not found: ${script.file}`);
                process.exit(1);
            }

            const sqlContent = fs.readFileSync(scriptPath, 'utf8');

            try {
                // Execute the entire SQL script as one transaction
                await client.query(sqlContent);
                console.log(`✅ ${script.file} executed successfully`);
            } catch (error) {
                console.error(`❌ Error executing ${script.file}:`);
                console.error(error.message);
                process.exit(1);
            }
        }

        // Verify final state
        console.log('\n🔍 Verifying final database state...');

        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log('📋 Tables created:');
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        // Check data counts
        try {
            const labelManagerResult = await client.query('SELECT COUNT(*) as count FROM public.label_manager');
            const artistResult = await client.query('SELECT COUNT(*) as count FROM public.artist');
            const submissionsResult = await client.query('SELECT COUNT(*) as count FROM public.submissions');

            console.log('\n📊 Data Summary:');
            console.log(`   Label Managers: ${labelManagerResult.rows[0].count}`);
            console.log(`   Artists: ${artistResult.rows[0].count}`);
            console.log(`   Submissions: ${submissionsResult.rows[0].count}`);
        } catch (error) {
            console.warn('⚠️  Could not verify data counts:', error.message);
        }

        console.log('\n🎉 Migration completed successfully!');
        console.log('🔗 Database ready for DMG Project');
        console.log('👥 User Types Created:');
        console.log('   📋 Label Managers: Full admin privileges (can edit all submissions, manage artists, edit usernames)');
        console.log('   🎵 Artists: Restricted privileges (can only edit own submissions, view own analytics)');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Main execution
if (require.main === module) {
    runMigration().catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { runMigration };
