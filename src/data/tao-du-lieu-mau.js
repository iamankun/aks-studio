/**
 * Data Generation Script for AKS Studio
 * 
 * This script generates sampl    full_name: 'An Kun Studio',
    profile_picture: '/face.png',
    is_active: true,
    created_at: new Date('2025-07-02 11:38:14.506125'),
    updated_at: new Date()
  },
  {
    username: 'ankunstudio',
    email: 'ankunstudio@ankun.dev',
    password_hash: '$2b$10$example.hash.for.manager.password',
    role: 'Artist',
    full_name: 'An Kun Studio',
    profile_picture: '/face.png',
    is_active: true,
    created_at: new Date('2025-07-02 11:38:14.506125'),
    updated_at: new Date()
  },plication including:
 * - Users (artists, label managers, admins)
 * - Submissions (songs, albums, artwork)
 * - Labels and label assignments
 * - File management data
 * - Activity logs
 * 
 * Usage: npm run generate
 */

import dotenv from 'dotenv';
import pg from 'pg';
import chalk from 'chalk';
import { resolve } from 'path';

const { Pool } = pg;

// Load environment variables - Thử nhiều cách khác nhau
console.log('🔍 Đang tải biến môi trường...');

// Cách 1: Thử load từ .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Đường dẫn .env.local:', envPath);

const result = dotenv.config({ path: envPath });
console.log('Kết quả dotenv:', result.error || 'Success');

// Cách 2: Thử load từ .env nếu .env.local không có
if (result.error) {
  console.log('⚠️  .env.local failed, thử .env...');
  const envResult = dotenv.config({ path: resolve(process.cwd(), '.env') });
  console.log('Kết quả .env:', envResult.error || 'Success');
}

// Cách 3: Thử load mặc định
dotenv.config();

// Kiểm tra biến môi trường
let DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Kiểm tra biến môi trường:');
console.log('DATABASE_URL tồn tại:', !!DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL ? DATABASE_URL.length : 0);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Tất cả biến có chứa DATABASE:', Object.keys(process.env).filter(key => key.includes('DATABASE')));

// Cách 4: Nếu vẫn không có, thử đọc trực tiếp từ file
if (!DATABASE_URL) {
  console.log('⚠️  Không tìm thấy DATABASE_URL, thử đọc trực tiếp từ file...');
  try {
    const fs = await import('fs');
    const fileContent = fs.readFileSync('.env.local', 'utf8');
    const lines = fileContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        DATABASE_URL = line.split('=')[1].replace(/"/g, '');
        console.log('✅ Đã tìm thấy DATABASE_URL từ file trực tiếp');
        break;;
      }
    }
  } catch (error) {
    console.log('❌ Không thể đọc file .env.local:', error.message);
  }
}

if (!DATABASE_URL) {
  console.error(chalk.red('❌ DATABASE_URL not found in environment variables'));
  console.error(chalk.yellow('Make sure .env.local file exists with DATABASE_URL'));
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

// Sample data generators
const generateUsers = () => [
  // === TÀI KHOẢN THỰC (CHÍNH CHỦ) ===
  // ankunstudio là tài khoản chính của chủ sở hữu hệ thống
  // Có cả 2 quyền: Label Manager và Artist
  {
    username: 'ankunstudio',
    email: 'ankunstudio@ankun.dev',
    password_hash: '$2b$10$CnaLK1FPWHiHNrBa4FToxOutmeDM7uapyR2K.cUrCYKRn5v8rWQxi',
    role: 'Label Manager & Artist', // Quyền đặc biệt: cả Label Manager và Artist
    full_name: 'An Kun Studio',
    profile_picture: '/face.png',
    is_active: true,
    created_at: new Date('2025-07-02 11:38:14.506125'),
    updated_at: new Date()
  }
]

const generateSubmissions = (userIds) => [
  {
    title: 'Summer Vibes',
    artist_name: 'Independent Artist',
    genre: 'Pop',
    description: 'An upbeat summer anthem perfect for the beach',
    submission_type: 'song',
    file_path: '/uploads/summer_vibes.mp3',
    artwork_path: '/uploads/summer_vibes_cover.jpg',
    status: 'pending',
    user_id: userIds[2], // artist1
    submitted_at: new Date('2024-03-01'),
    reviewed_at: null,
    reviewed_by: null,
    feedback: null
  },
  {
    title: 'Midnight Dreams Album',
    artist_name: 'Rising Star',
    genre: 'R&B',
    description: 'A collection of soulful tracks exploring love and life',
    submission_type: 'album',
    file_path: '/uploads/midnight_dreams_album.zip',
    artwork_path: '/uploads/midnight_dreams_cover.jpg',
    status: 'approved',
    user_id: userIds[3], // artist2
    submitted_at: new Date('2024-02-20'),
    reviewed_at: new Date('2024-02-25'),
    reviewed_by: userIds[1], // labelmanager1
    feedback: 'Excellent work! Love the production quality.'
  },
  {
    title: 'City Lights',
    artist_name: 'Independent Artist',
    genre: 'Electronic',
    description: 'Atmospheric electronic piece inspired by urban nightlife',
    submission_type: 'song',
    file_path: '/uploads/city_lights.mp3',
    artwork_path: '/uploads/city_lights_cover.jpg',
    status: 'rejected',
    user_id: userIds[2], // artist1
    submitted_at: new Date('2024-01-30'),
    reviewed_at: new Date('2024-02-05'),
    reviewed_by: userIds[1], // labelmanager1
    feedback: 'Good concept but needs better mixing. Please resubmit after improvements.'
  }
];

const generateActivityLogs = (userIds) => [
  {
    user_id: userIds[0],
    action: 'user_login',
    description: 'Admin logged into the system',
    entity_type: 'auth',
    entity_id: null,
    status: 'success',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date()
  },
  {
    user_id: userIds[2],
    action: 'submission_create',
    description: 'New song submission: Summer Vibes',
    entity_type: 'submission',
    entity_id: 1,
    status: 'success',
    ip_address: '192.168.1.105',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date('2024-03-01')
  },
  {
    user_id: userIds[1],
    action: 'submission_review',
    description: 'Reviewed and approved album submission',
    entity_type: 'submission',
    entity_id: 2,
    status: 'success',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date('2024-02-25')
  }
];

const generateLabelData = () => ({
  templates: [
    {
      name: 'Standard Music Release',
      description: 'Template for standard music releases',
      fields: JSON.stringify([
        { name: 'title', type: 'text', required: true },
        { name: 'artist', type: 'text', required: true },
        { name: 'genre', type: 'select', options: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B'] },
        { name: 'release_date', type: 'date', required: true }
      ]),
      created_at: new Date('2024-01-01'),
      updated_at: new Date()
    },
    {
      name: 'Album Release',
      description: 'Template for full album releases',
      fields: JSON.stringify([
        { name: 'album_title', type: 'text', required: true },
        { name: 'artist', type: 'text', required: true },
        { name: 'track_count', type: 'number', required: true },
        { name: 'total_duration', type: 'text', required: true },
        { name: 'genre', type: 'select', options: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B'] }
      ]),
      created_at: new Date('2024-01-01'),
      updated_at: new Date()
    }
  ],
  managers: [
    {
      name: 'Main Label Manager',
      description: 'Primary label management for AKS Studio',
      settings: JSON.stringify({
        auto_approve: false,
        email_notifications: true,
        workflow_stages: ['submission', 'review', 'approval', 'release']
      }),
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date()
    }
  ]
});

async function createTables(pool) {
  console.log(chalk.yellow('Creating tables if they don\'t exist...'));
  
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Artist',
      full_name VARCHAR(100),
      profile_picture TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Submissions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      artist_name VARCHAR(100) NOT NULL,
      genre VARCHAR(50),
      description TEXT,
      submission_type VARCHAR(50) DEFAULT 'song',
      file_path TEXT,
      artwork_path TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      user_id INTEGER REFERENCES users(id),
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP,
      reviewed_by INTEGER REFERENCES users(id),
      feedback TEXT
    )
  `);

  // Activity logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS nhat_ky_studio (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      description TEXT,
      entity_type VARCHAR(50),
      entity_id INTEGER,
      status VARCHAR(20) DEFAULT 'success',
      ip_address INET,
      user_agent TEXT,
      details JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Label templates table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS label_templates (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      fields JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Label manager table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS label_manager (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      settings JSONB,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Label assignments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS label_assignments (
      id SERIAL PRIMARY KEY,
      label_manager_id INTEGER REFERENCES label_manager(id),
      user_id INTEGER REFERENCES users(id),
      submission_id INTEGER REFERENCES submissions(id),
      template_id INTEGER REFERENCES label_templates(id),
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      status VARCHAR(50) DEFAULT 'assigned'
    )
  `);

  console.log(chalk.green('✅ Tables created successfully'));
}

async function insertSampleData(pool) {
  console.log(chalk.yellow('Inserting sample data...'));
  
  // Clear existing data
  await pool.query('TRUNCATE label_assignments, submissions, nhat_ky_studio, label_manager, label_templates, users RESTART IDENTITY CASCADE');
  
  // Insert users
  const users = generateUsers();
  const userIds = [];
  
  for (const user of users) {
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, full_name, profile_picture, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [user.username, user.email, user.password_hash, user.role, user.full_name, user.profile_picture, user.is_active, user.created_at, user.updated_at]);
    userIds.push(result.rows[0].id);
  }
  
  console.log(chalk.green(`✅ Inserted ${users.length} users`));
  
  // Insert submissions
  const submissions = generateSubmissions(userIds);
  for (const submission of submissions) {
    await pool.query(`
      INSERT INTO submissions (title, artist_name, genre, description, submission_type, file_path, artwork_path, status, user_id, submitted_at, reviewed_at, reviewed_by, feedback)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [submission.title, submission.artist_name, submission.genre, submission.description, submission.submission_type, submission.file_path, submission.artwork_path, submission.status, submission.user_id, submission.submitted_at, submission.reviewed_at, submission.reviewed_by, submission.feedback]);
  }
  
  console.log(chalk.green(`✅ Inserted ${submissions.length} submissions`));
  
  // Insert activity logs
  const activityLogs = generateActivityLogs(userIds);
  for (const log of activityLogs) {
    await pool.query(`
      INSERT INTO nhat_ky_studio (user_id, action, description, entity_type, entity_id, status, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [log.user_id, log.action, log.description, log.entity_type, log.entity_id, log.status, log.ip_address, log.user_agent, log.created_at]);
  }
  
  console.log(chalk.green(`✅ Inserted ${activityLogs.length} activity logs`));
  
  // Insert label data
  const labelData = generateLabelData();
  
  // Insert label templates
  for (const template of labelData.templates) {
    await pool.query(`
      INSERT INTO label_templates (name, description, fields, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [template.name, template.description, template.fields, template.created_at, template.updated_at]);
  }
  
  console.log(chalk.green(`✅ Inserted ${labelData.templates.length} label templates`));
  
  // Insert label managers
  for (const manager of labelData.managers) {
    await pool.query(`
      INSERT INTO label_manager (name, description, settings, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [manager.name, manager.description, manager.settings, manager.is_active, manager.created_at, manager.updated_at]);
  }
  
  console.log(chalk.green(`✅ Inserted ${labelData.managers.length} label managers`));
}

async function main() {
  if (!DATABASE_URL) {
    console.error(chalk.red('❌ DATABASE_URL not found in environment variables'));
    console.error(chalk.yellow('Make sure .env.local file exists with DATABASE_URL'));
    process.exit(1);
  }

  console.log(chalk.blue('🎵 AKS Studio Data Generator'));
  console.log('='.repeat(50));
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log(chalk.green('✅ Database connection successful'));
    
    // Create tables
    await createTables(pool);
    
    // Insert sample data
    await insertSampleData(pool);
    
    console.log('='.repeat(50));
    console.log(chalk.green('🎉 Sample data generation completed successfully!'));
    console.log(chalk.blue('You can now start the development server with: npm run dev'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error during data generation:'));
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main().catch(error => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  process.exit(1);
});
