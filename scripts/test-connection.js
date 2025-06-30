#!/usr/bin/env node

// Database Connection Test for AKs Studio
// Author: An Kun Studio Digital Music Distribution
// Usage: node test-connection.js

const { neon } = require('@neondatabase/serverless');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

async function testDatabaseConnection() {
    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.error('Please check your .env.local file');
        return false;
    }

    try {
        console.log('🔍 Testing database connection...');
        console.log('📡 Database URL:', DATABASE_URL.replace(/:[^:]*@/, ':****@')); // Hide password

        const sql = neon(DATABASE_URL);

        // Test basic connection
        const result = await sql`SELECT 
      version() as postgres_version,
      current_database() as database_name,
      current_user as user_name,
      current_timestamp as server_time
    `;

        console.log('✅ Database connection successful!');
        console.log('📊 Database info:');
        console.log(`   PostgreSQL Version: ${result[0].postgres_version}`);
        console.log(`   Database Name: ${result[0].database_name}`);
        console.log(`   User: ${result[0].user_name}`);
        console.log(`   Server Time: ${result[0].server_time}`);

        // Test table existence
        console.log('\n🔍 Checking table structure...');

        try {
            const tables = await sql`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('label_manager', 'artist', 'submissions')
        ORDER BY table_name
      `;

            if (tables.length > 0) {
                console.log('📋 Found tables:');
                tables.forEach(table => {
                    console.log(`   ✓ ${table.table_name} (${table.table_type})`);
                });

                // Test data counts
                console.log('📊 Data counts:');
                for (const table of tables) {
                    try {
                        if (table.table_name === 'artist') {
                            const count = await sql`SELECT COUNT(*) as count FROM public.artist`;
                            console.log(`   ${table.table_name}: ${count[0].count} records`);
                        } else if (table.table_name === 'label_manager') {
                            const count = await sql`SELECT COUNT(*) as count FROM public.label_manager`;
                            console.log(`   ${table.table_name}: ${count[0].count} records`);
                        } else if (table.table_name === 'submissions') {
                            const count = await sql`SELECT COUNT(*) as count FROM public.submissions`;
                            console.log(`   ${table.table_name}: ${count[0].count} records`);
                        }
                    } catch (error) {
                        console.log(`   ${table.table_name}: Error reading data`);
                    }
                }
            } else {
                console.log('⚠️  No application tables found. Run migrations first:');
                console.log('   node scripts/run-migrations.js');
            }

        } catch (error) {
            console.log('⚠️  Could not check table structure:', error.message);
        }

        return true;

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('\nCommon issues:');
        console.error('1. Check your DATABASE_URL in .env.local');
        console.error('2. Ensure database server is running');
        console.error('3. Verify network connectivity');
        console.error('4. Check database credentials');
        return false;
    }
}

async function testSmtpConfiguration() {
    console.log('\n📧 Testing SMTP configuration...');

    const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? '****' : undefined,
        from: process.env.SMTP_FROM,
        name: process.env.SMTP_NAME
    };

    console.log('📡 SMTP Configuration:');
    Object.entries(smtpConfig).forEach(([key, value]) => {
        const status = value ? '✓' : '❌';
        console.log(`   ${status} ${key}: ${value || 'NOT SET'}`);
    });

    const requiredFields = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missingFields = requiredFields.filter(field => !process.env[field]);

    if (missingFields.length === 0) {
        console.log('✅ SMTP configuration complete');
        return true;
    } else {
        console.log('❌ Missing SMTP configuration:');
        missingFields.forEach(field => {
            console.log(`   Missing: ${field}`);
        });
        return false;
    }
}

async function main() {
    console.log('🚀 AKs Studio - System Configuration Test');
    console.log('==========================================\n');

    const dbSuccess = await testDatabaseConnection();
    const smtpSuccess = await testSmtpConfiguration();

    console.log('\n📋 Test Summary:');
    console.log(`   Database Connection: ${dbSuccess ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   SMTP Configuration: ${smtpSuccess ? '✅ OK' : '❌ FAILED'}`);

    if (dbSuccess && smtpSuccess) {
        console.log('\n🎉 All systems ready!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some configurations need attention');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });
}

module.exports = { testDatabaseConnection, testSmtpConfiguration };
