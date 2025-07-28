// @ts-check
/**
 * Script thống kê nhật ký theo ngày
 * Hiển thị biểu đồ hoạt động theo thời gian
 */

import { neon } from "@neondatabase/serverless";
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function logToFile(message) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, "thong-ke-nhat-ky-theo-ngay.log");
        const timestamp = new Date().toISOString();
        await fs.appendFile(logFile, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

async function connectToDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL không tìm thấy trong .env.local');
    }
    return neon(DATABASE_URL);
}

// Tạo biểu đồ đơn giản trong terminal
function drawBarChart(data, label) {
    const maxValue = Math.max(...data.map(item => item.count));
    const maxLabelLength = Math.max(...data.map(item => item.label.length));
    const chartWidth = 50;

    console.log(`\n${label}:`);
    console.log('-'.repeat(chartWidth + maxLabelLength + 15));

    data.forEach(item => {
        const barLength = Math.round((item.count / maxValue) * chartWidth);
        const bar = '█'.repeat(barLength);
        const paddedLabel = item.label.padEnd(maxLabelLength, ' ');
        console.log(`${paddedLabel} | ${item.count.toString().padStart(5)} | ${bar}`);
    });

    console.log('-'.repeat(chartWidth + maxLabelLength + 15));
}

async function thongKeTheoNgay(days = 30) {
    console.log(`🔍 Thống kê nhật ký hoạt động ${days} ngày gần đây`);
    console.log('='.repeat(70));
    await logToFile(`Bắt đầu thống kê ${days} ngày gần đây`);

    try {
        // Kết nối đến database
        const sql = await connectToDatabase();
        await logToFile('Kết nối database thành công');

        // Kiểm tra bảng tồn tại
        const existingTable = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'nhat_ky_studio'
        `;

        if (existingTable.length === 0) {
            console.error('❌ Bảng nhat_ky_studio không tồn tại');
            await logToFile('Bảng nhat_ky_studio không tồn tại');
            console.log('Vui lòng chạy script tao-bang-nhat-ky.js trước');
            return;
        }

        console.log('✅ Đang truy vấn dữ liệu...');

        // Thống kê theo ngày
        const dailyStats = await sql`
            SELECT 
                DATE(created_at) as date, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;

        if (dailyStats.length === 0) {
            console.log(`❌ Không có dữ liệu trong ${days} ngày qua`);
            await logToFile(`Không có dữ liệu trong ${days} ngày qua`);
            return;
        }

        // Tổng số hoạt động
        const totalActivities = dailyStats.reduce((sum, day) => sum + parseInt(day.count), 0);
        console.log(`✅ Tổng số hoạt động: ${totalActivities} trong ${days} ngày qua`);
        await logToFile(`Tổng số hoạt động: ${totalActivities}`);

        // Vẽ biểu đồ hoạt động theo ngày
        const chartData = dailyStats.map(day => ({
            label: day.date.toISOString().split('T')[0],
            count: parseInt(day.count)
        }));

        drawBarChart(chartData, `Hoạt động theo ngày (${days} ngày gần đây)`);

        // Thống kê theo action trong khoảng thời gian
        const actionStats = await sql`
            SELECT 
                action, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY action
            ORDER BY count DESC
            LIMIT 10
        `;

        // Vẽ biểu đồ theo action
        const actionChartData = actionStats.map(stat => ({
            label: stat.action,
            count: parseInt(stat.count)
        }));

        drawBarChart(actionChartData, 'Top 10 actions');

        // Thống kê theo username
        const userStats = await sql`
            SELECT 
                username, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY username
            ORDER BY count DESC
            LIMIT 7
        `;

        // Vẽ biểu đồ theo username
        const userChartData = userStats.map(stat => ({
            label: stat.username,
            count: parseInt(stat.count)
        }));

        drawBarChart(userChartData, 'Top 7 users');

        // Thống kê theo thời gian trong ngày
        const hourlyStats = await sql`
            SELECT 
                EXTRACT(HOUR FROM created_at) as hour, 
                COUNT(*) as count
            FROM nhat_ky_studio
            WHERE created_at > NOW() - INTERVAL '${days} days'
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY hour ASC
        `;

        // Vẽ biểu đồ theo giờ
        const hourlyChartData = hourlyStats.map(stat => ({
            label: `${stat.hour}h`,
            count: parseInt(stat.count)
        }));

        drawBarChart(hourlyChartData, 'Hoạt động theo giờ trong ngày');

        // Thống kê tổng quan
        console.log('\n=== Thống kê tổng quan ===');

        // Ngày có nhiều hoạt động nhất
        const maxDay = chartData.reduce((max, day) => day.count > max.count ? day : max, { count: 0 });
        console.log(`- Ngày hoạt động nhiều nhất: ${maxDay.label} (${maxDay.count} hoạt động)`);

        // Ngày có ít hoạt động nhất
        const minDay = chartData.reduce((min, day) => day.count < min.count ? day : min, { count: Number.MAX_SAFE_INTEGER });
        console.log(`- Ngày hoạt động ít nhất: ${minDay.label} (${minDay.count} hoạt động)`);

        // Trung bình hoạt động mỗi ngày
        const avgActivities = totalActivities / dailyStats.length;
        console.log(`- Trung bình: ${avgActivities.toFixed(2)} hoạt động/ngày`);

        // Xem xu hướng
        const trend = analyzeActivityTrend(chartData);
        console.log(`- Xu hướng: ${trend}`);

        await logToFile(`Thống kê hoàn tất. Xu hướng: ${trend}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await logToFile(`❌ Error: ${error.message}`);
    }
}

// Phân tích xu hướng hoạt động
function analyzeActivityTrend(data) {
    if (data.length < 2) return "Không đủ dữ liệu để phân tích xu hướng";

    // Chia dữ liệu thành 2 nửa để so sánh
    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);

    // Tính trung bình của mỗi nửa
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.count, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.count, 0) / secondHalf.length;

    // So sánh để xác định xu hướng
    const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (percentChange > 10) {
        return `Tăng (${percentChange.toFixed(2)}%)`;  
    } else if (percentChange < -10) {
        return `Giảm (${Math.abs(percentChange).toFixed(2)}%)`;
    } else {
        return `Ổn định (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`;
    }
}

// Tham số ngày từ command line
const daysParam = process.argv[2];
const days = daysParam ? parseInt(daysParam) : 30;

// Chạy function chính
thongKeTheoNgay(days).catch(console.error);
