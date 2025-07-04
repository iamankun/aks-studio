// DMG System Stability Test - Comprehensive system health check

import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';

config({ path: '../.env.local' });

const { Client } = pg;

console.log('🔍 DMG SYSTEM STABILITY TEST');
console.log('============================');

async function stabilityTest() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const results = {
        database: false,
        authentication: false,
        authorization: false,
        submissions: false,
        foreignKeys: false,
        storage: false,
        environment: false
    };

    try {
        // Test 1: Database Connection
        console.log('\n🔌 TEST 1: Database Connection');
        console.log('------------------------------');
        await client.connect();
        console.log('✅ Database connection successful');
        results.database = true;

        // Test 2: Environment Variables
        console.log('\n🌍 TEST 2: Environment Variables');
        console.log('--------------------------------');
        const requiredEnvs = [
            'DATABASE_URL',
            'ADMIN_USERNAME',
            'ADMIN_PASSWORD',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL'
        ];

        let envCount = 0;
        for (const env of requiredEnvs) {
            if (process.env[env]) {
                console.log(`✅ ${env}: ✓`);
                envCount++;
            } else {
                console.log(`❌ ${env}: Missing`);
            }
        }
        results.environment = envCount === requiredEnvs.length;
        console.log(`📊 Environment Score: ${envCount}/${requiredEnvs.length}`);

        // Test 3: Database Schema
        console.log('\n🗄️ TEST 3: Database Schema');
        console.log('---------------------------');
        const requiredTables = ['artist', 'label_manager', 'submissions'];
        let tableCount = 0;

        for (const table of requiredTables) {
            try {
                const result = await client.query(`
                    SELECT COUNT(*) FROM information_schema.tables 
                    WHERE table_name = $1
                `, [table]);

                if (result.rows[0].count > 0) {
                    console.log(`✅ Table ${table}: Exists`);
                    tableCount++;
                } else {
                    console.log(`❌ Table ${table}: Missing`);
                }
            } catch (error) {
                console.log(`❌ Table ${table}: Error - ${error.message}`);
            }
        }
        console.log(`📊 Schema Score: ${tableCount}/${requiredTables.length}`);

        // Test 4: Authentication System
        console.log('\n🔐 TEST 4: Authentication System');
        console.log('--------------------------------');
        try {
            const adminUsername = process.env.ADMIN_USERNAME || 'ankunstudio';
            const adminPassword = process.env.ADMIN_PASSWORD || '@iamAnKun';

            // Test Label Manager auth
            const labelManager = await client.query(`
                SELECT id, username, password_hash FROM label_manager 
                WHERE username = $1
            `, [adminUsername]);

            if (labelManager.rows.length > 0) {
                const isValidPassword = await bcrypt.compare(
                    adminPassword,
                    labelManager.rows[0].password_hash
                );

                if (isValidPassword) {
                    console.log('✅ Label Manager authentication: Valid');
                    results.authentication = true;
                } else {
                    console.log('❌ Label Manager authentication: Invalid password');
                }
            } else {
                console.log('❌ Label Manager authentication: User not found');
            }

            // Test Artist auth
            const artist = await client.query(`
                SELECT id, username, password_hash FROM artist 
                WHERE username = $1
            `, [adminUsername]);

            if (artist.rows.length > 0) {
                const isValidPassword = await bcrypt.compare(
                    adminPassword,
                    artist.rows[0].password_hash
                );
                console.log(`✅ Artist authentication: ${isValidPassword ? 'Valid' : 'Invalid'}`);
            }

        } catch (error) {
            console.log('❌ Authentication test failed:', error.message);
        }

        // Test 5: Authorization Logic
        console.log('\n🛡️ TEST 5: Authorization Logic');
        console.log('-------------------------------');
        try {
            // Test dual role setup
            const dualRole = await client.query(`
                SELECT 
                    lm.id as label_id, lm.username as label_username,
                    a.id as artist_id, a.username as artist_username
                FROM label_manager lm
                FULL OUTER JOIN artist a ON lm.username = a.username
                WHERE lm.username = $1 OR a.username = $1
            `, [process.env.ADMIN_USERNAME || 'ankunstudio']);

            if (dualRole.rows.length > 0 && dualRole.rows[0].label_id && dualRole.rows[0].artist_id) {
                console.log('✅ Dual role (Label Manager + Artist): Configured');
                results.authorization = true;
            } else {
                console.log('❌ Dual role: Not properly configured');
            }

        } catch (error) {
            console.log('❌ Authorization test failed:', error.message);
        }

        // Test 6: Foreign Key Constraints
        console.log('\n🔗 TEST 6: Foreign Key Constraints');
        console.log('-----------------------------------');
        try {
            const constraints = await client.query(`
                SELECT 
                    tc.constraint_name,
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = 'submissions'
            `);

            if (constraints.rows.length > 0) {
                console.log('✅ Foreign key constraints: Active');
                console.table(constraints.rows);
                results.foreignKeys = true;
            } else {
                console.log('❌ Foreign key constraints: None found');
            }

        } catch (error) {
            console.log('❌ Foreign key test failed:', error.message);
        }

        // Test 7: Submissions System
        console.log('\n📋 TEST 7: Submissions System');
        console.log('------------------------------');
        try {
            const submissionsCount = await client.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM submissions 
                GROUP BY status
                ORDER BY status
            `);

            console.log('Submissions by status:');
            console.table(submissionsCount.rows);

            const totalSubmissions = submissionsCount.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
            if (totalSubmissions > 0) {
                console.log(`✅ Submissions system: ${totalSubmissions} submissions found`);
                results.submissions = true;
            } else {
                console.log('⚠️ Submissions system: No submissions found (might be normal)');
                results.submissions = true; // Not an error if no submissions yet
            }

        } catch (error) {
            console.log('❌ Submissions test failed:', error.message);
        }

        // Test 8: Storage Directories
        console.log('\n📁 TEST 8: Storage Structure');
        console.log('-----------------------------');
        try {
            const storageDirectories = [
                '../public',
                '../public/uploads',
                '../public/uploads/audio',
                '../public/uploads/images',
                '../public/uploads/temp'
            ];

            let storageCount = 0;
            for (const dir of storageDirectories) {
                try {
                    await fs.access(path.resolve(dir));
                    console.log(`✅ Directory ${dir}: Exists`);
                    storageCount++;
                } catch {
                    console.log(`❌ Directory ${dir}: Missing`);
                }
            }

            results.storage = storageCount >= 3; // At least basic directories
            console.log(`📊 Storage Score: ${storageCount}/${storageDirectories.length}`);

        } catch (error) {
            console.log('❌ Storage test failed:', error.message);
        }

    } catch (error) {
        console.error('❌ Stability test error:', error.message);
    } finally {
        await client.end();
    }

    // Final Report
    console.log('\n📊 STABILITY TEST RESULTS');
    console.log('==========================');

    const testResults = [
        { test: 'Database Connection', status: results.database },
        { test: 'Environment Variables', status: results.environment },
        { test: 'Authentication System', status: results.authentication },
        { test: 'Authorization Logic', status: results.authorization },
        { test: 'Foreign Key Constraints', status: results.foreignKeys },
        { test: 'Submissions System', status: results.submissions },
        { test: 'Storage Structure', status: results.storage }
    ];

    console.table(testResults);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const healthScore = Math.round((passedTests / totalTests) * 100);

    console.log(`\n🎯 OVERALL SYSTEM HEALTH: ${healthScore}%`);
    console.log(`📈 Tests Passed: ${passedTests}/${totalTests}`);

    if (healthScore >= 90) {
        console.log('🎉 System Status: EXCELLENT - Ready for production!');
    } else if (healthScore >= 70) {
        console.log('✅ System Status: GOOD - Minor issues to address');
    } else if (healthScore >= 50) {
        console.log('⚠️ System Status: FAIR - Several issues need attention');
    } else {
        console.log('❌ System Status: POOR - Major issues require immediate attention');
    }

    return results;
}

stabilityTest().catch(console.error);