// Debug script để xem logs trong app
// Chạy trong browser console hoặc sử dụng node script

console.log('=== AKs Studio App Logs ===');

// Function để format log entry
function formatLog(log) {
    const time = new Date(log.timestamp).toLocaleString();
    const level = log.level.toUpperCase().padEnd(5);
    const component = log.component ? `[${log.component}] ` : '';
    const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';

    return `${time} | ${level} | ${component}${log.message}${data}`;
}

// Kiểm tra logs trong localStorage
try {
    const logs = JSON.parse(localStorage.getItem('aks_logs') || '[]');

    if (logs.length === 0) {
        console.log('Không có logs nào được tìm thấy.');
    } else {
        console.log(`\nTìm thấy ${logs.length} log entries:\n`);

        // Hiển thị 20 logs gần nhất
        logs.slice(0, 20).forEach((log, index) => {
            console.log(`${index + 1}. ${formatLog(log)}`);
        });

        if (logs.length > 20) {
            console.log(`\n... và ${logs.length - 20} logs khác`);
        }
    }

    // Group logs by level
    const logsByLevel = logs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
    }, {});

    console.log('\n=== Log Summary ===');
    Object.entries(logsByLevel).forEach(([level, count]) => {
        console.log(`${level.toUpperCase()}: ${count} entries`);
    });

} catch (error) {
    console.error('Lỗi khi đọc logs:', error);
}
