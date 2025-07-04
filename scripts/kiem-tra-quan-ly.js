// Test Scripts Manager - Quản lý tất cả các test script
// Chạy các test authorization và database

console.log('🧪 DMG AUTHORIZATION TEST SUITE');
console.log('===============================');
console.log('Available test scripts:');
console.log('');

const testScripts = {
    '1': {
        name: 'Basic Authorization Test',
        file: 'test-authorization.js',
        description: 'Test cơ bản với demo users'
    },
    '2': {
        name: 'Real Users Authorization Test',
        file: 'test-real-users.js',
        description: 'Test với real users từ database'
    },
    '3': {
        name: 'Real Database Test',
        file: 'test-real-database-auth.js',
        description: 'Test toàn diện với dữ liệu thực'
    },
    '4': {
        name: 'Direct Database Connection',
        file: 'test-direct-database.mjs',
        description: 'Test trực tiếp kết nối database'
    },
    '5': {
        name: 'Submissions Test',
        file: 'test-submissions.js',
        description: 'Test CRUD operations cho submissions'
    }
};

// Hiển thị menu
function showMenu() {
    console.log('📋 Select a test to run:\n');

    Object.entries(testScripts).forEach(([key, script]) => {
        console.log(`${key}. ${script.name}`);
        console.log(`   📄 File: ${script.file}`);
        console.log(`   📝 ${script.description}\n`);
    });

    console.log('0. Run all tests');
    console.log('q. Quit\n');
}

// Chạy một test cụ thể
async function runTest(scriptKey) {
    const script = testScripts[scriptKey];
    if (!script) {
        console.log('❌ Invalid test selection');
        return;
    }

    console.log(`\n🚀 Running: ${script.name}`);
    console.log(`📄 File: ${script.file}`);
    console.log(''.padEnd(50, '='));

    try {
        if (script.file.endsWith('.mjs')) {
            // ES Module
            const { runDatabaseTests } = await import(`./${script.file}`);
            await runDatabaseTests();
        } else {
            // CommonJS
            require(`./${script.file}`);
        }

        console.log(`\n✅ ${script.name} completed\n`);

    } catch (error) {
        console.error(`\n❌ Error running ${script.name}:`, error.message);
    }
}

// Chạy tất cả tests
async function runAllTests() {
    console.log('\n🔥 Running ALL authorization tests...\n');

    for (const [key, script] of Object.entries(testScripts)) {
        await runTest(key);

        // Delay giữa các test
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 All tests completed!\n');
}

// Interactive mode
async function interactive() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (question) => {
        return new Promise(resolve => {
            rl.question(question, resolve);
        });
    };

    while (true) {
        showMenu();
        const choice = await askQuestion('Enter your choice: ');

        if (choice.toLowerCase() === 'q') {
            console.log('👋 Goodbye!');
            break;
        }

        if (choice === '0') {
            await runAllTests();
        } else if (testScripts[choice]) {
            await runTest(choice);
        } else {
            console.log('❌ Invalid choice. Please try again.\n');
        }

        await askQuestion('\nPress Enter to continue...');
        console.clear();
    }

    rl.close();
}

// Command line mode
async function commandLine() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showMenu();
        console.log('Usage: node kiem-tra-quan-ly.js [test-number]');
        console.log('       node kiem-tra-quan-ly.js all');
        console.log('       node kiem-tra-quan-ly.js interactive');
        return;
    }

    const command = args[0];

    if (command === 'all') {
        await runAllTests();
    } else if (command === 'interactive') {
        await interactive();
    } else if (testScripts[command]) {
        await runTest(command);
    } else {
        console.log(`❌ Unknown command: ${command}`);
        showMenu();
    }
}

// Quick test functions
const quickTests = {
    // Test nhanh authorization API
    async api() {
        console.log('🔌 Quick API Authorization Test');
        try {
            const response = await fetch('http://localhost:3000/api/submissions');
            console.log(`Status: ${response.status}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ API accessible, ${data.submissions?.length || 0} submissions`);
            }
        } catch (error) {
            console.log(`❌ API Error: ${error.message}`);
        }
    },

    // Test nhanh database
    async db() {
        console.log('🗄️ Quick Database Test');
        try {
            const { testDatabaseConnection } = await import('./test-direct-database.mjs');
            const result = await testDatabaseConnection();
            console.log(`Database connected: ${result.connected ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`❌ Database Error: ${error.message}`);
        }
    }
};

// Export cho sử dụng bên ngoài
module.exports = {
    runTest,
    runAllTests,
    testScripts,
    quickTests
};

// Main execution
if (require.main === module) {
    commandLine().catch(console.error);
}
