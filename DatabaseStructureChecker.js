import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function kiemTraCauTrucDatabase() {
  try {
    console.log('🔍 KIỂM TRA CẤU TRÚC DATABASE AKS STUDIO');
    console.log('================================================');
    
    // Kiểm tra danh sách bảng
    const danhSachBang = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 DANH SÁCH CÁC BẢNG:');
    console.log('------------------------');
    danhSachBang.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Kiểm tra từng bảng chi tiết
    for (const bang of danhSachBang.rows) {
      const tenBang = bang.table_name;
      
      // Lấy cấu trúc cột
      const cauTrucCot = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tenBang]);
      
      console.log(`\n🗂️  BẢNG: ${tenBang.toUpperCase()}`);
      console.log('----------------------------------------');
      
      cauTrucCot.rows.forEach(cot => {
        const nullable = cot.is_nullable === 'YES' ? '(có thể null)' : '(không null)';
        const defaultVal = cot.column_default ? ` [mặc định: ${cot.column_default}]` : '';
        console.log(`   └─ ${cot.column_name}: ${cot.data_type} ${nullable}${defaultVal}`);
      });
      
      // Đếm số lượng dữ liệu
      try {
        const soLuongDuLieu = await pool.query(`SELECT COUNT(*) FROM ${tenBang}`);
        console.log(`   📊 Số lượng dữ liệu: ${soLuongDuLieu.rows[0].count} records`);
      } catch (err) {
        console.log(`   ❌ Không thể đếm dữ liệu: ${err.message}`);
      }
    }
    
    // Kiểm tra bảng users cụ thể
    console.log('\n👤 KIỂM TRA BẢNG USERS:');
    console.log('------------------------');
    try {
      const nguoiDung = await pool.query(`
        SELECT id, username, email, role, "fullName", "createdAt" 
        FROM users 
        ORDER BY id 
        LIMIT 10
      `);
      
      if (nguoiDung.rows.length > 0) {
        nguoiDung.rows.forEach(user => {
          console.log(`   ID: ${user.id} | ${user.username} | ${user.role} | ${user.email || 'Chưa có email'}`);
        });
      } else {
        console.log('   ⚠️  Chưa có dữ liệu người dùng');
      }
    } catch (err) {
      console.log(`   ❌ Lỗi truy vấn bảng users: ${err.message}`);
    }
    
    // Kiểm tra bảng nhat-ky-studio nếu có
    console.log('\n📝 KIỂM TRA BẢNG NHẬT KÝ:');
    console.log('---------------------------');
    try {
      const nhatKy = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE '%nhat%' OR table_name LIKE '%log%'
      `);
      
      if (nhatKy.rows.length > 0) {
        nhatKy.rows.forEach(bang => {
          console.log(`   ✅ Tìm thấy bảng: ${bang.table_name}`);
        });
      } else {
        console.log('   ⚠️  Không tìm thấy bảng nhật ký');
      }
    } catch (err) {
      console.log(`   ❌ Lỗi kiểm tra bảng nhật ký: ${err.message}`);
    }
    
    // Kiểm tra submissions
    console.log('\n🎵 KIỂM TRA BẢNG SUBMISSIONS:');
    console.log('------------------------------');
    try {
      const baiHat = await pool.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
               COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM submissions
      `);
      
      if (baiHat.rows.length > 0) {
        const stats = baiHat.rows[0];
        console.log(`   📊 Tổng bài hát: ${stats.total}`);
        console.log(`   ✅ Đã duyệt: ${stats.approved}`);
        console.log(`   ⏳ Chờ duyệt: ${stats.pending}`);
      }
    } catch (err) {
      console.log(`   ❌ Lỗi kiểm tra submissions: ${err.message}`);
    }
    
    console.log('\n🎯 KẾT THÚC KIỂM TRA DATABASE');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ LỖI KẾT NỐI DATABASE:', error.message);
    console.error('🔧 Kiểm tra lại DATABASE_URL trong .env.local');
  } finally {
    await pool.end();
  }
}

// Chạy script
kiemTraCauTrucDatabase().catch(console.error);
