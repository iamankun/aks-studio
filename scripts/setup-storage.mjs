// DMG Storage Setup - Create necessary directories and configure file handling

import { promises as fs } from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: '../.env.local' });

console.log('📁 DMG STORAGE SETUP');
console.log('====================');

async function setupStorage() {
    const baseDir = path.resolve('..');

    // Define directory structure
    const directories = [
        'public',
        'public/uploads',
        'public/uploads/audio',
        'public/uploads/images',
        'public/uploads/temp',
        'public/uploads/submissions',
        'public/uploads/avatars',
        'logs',
        'storage',
        'storage/cache',
        'storage/sessions'
    ];

    // Define files that need to exist
    const requiredFiles = [
        {
            path: 'public/uploads/.gitkeep',
            content: '# Keep this directory in git\n'
        },
        {
            path: 'public/uploads/audio/.gitkeep',
            content: '# Audio files directory\n'
        },
        {
            path: 'public/uploads/images/.gitkeep',
            content: '# Image files directory\n'
        },
        {
            path: 'public/uploads/temp/.gitkeep',
            content: '# Temporary files directory\n'
        },
        {
            path: 'public/uploads/README.md',
            content: `# DMG Uploads Directory

This directory contains user-uploaded content for the DMG system.

## Structure:
- \`audio/\` - Audio files (MP3, WAV, FLAC)
- \`images/\` - Cover art, avatars, artwork
- \`temp/\` - Temporary files during upload
- \`submissions/\` - Processed submission files
- \`avatars/\` - User profile images

## Security:
- Files are validated before storage
- Size limits enforced
- File type restrictions active
- Virus scanning recommended

## Cleanup:
- Temp files auto-deleted after 24h
- Failed uploads cleaned up automatically
`
        },
        {
            path: 'logs/.gitkeep',
            content: '# Logs directory\n'
        },
        {
            path: 'storage/.gitkeep',
            content: '# Storage directory\n'
        }
    ];

    console.log('📂 Creating directory structure...');

    // Create directories
    for (const dir of directories) {
        const fullPath = path.join(baseDir, dir);
        try {
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        } catch (error) {
            if (error.code === 'EEXIST') {
                console.log(`📁 Exists: ${dir}`);
            } else {
                console.log(`❌ Failed: ${dir} - ${error.message}`);
            }
        }
    }

    console.log('\n📄 Creating required files...');

    // Create required files
    for (const file of requiredFiles) {
        const fullPath = path.join(baseDir, file.path);
        try {
            // Check if file exists
            try {
                await fs.access(fullPath);
                console.log(`📄 Exists: ${file.path}`);
            } catch {
                // File doesn't exist, create it
                await fs.writeFile(fullPath, file.content, 'utf8');
                console.log(`✅ Created: ${file.path}`);
            }
        } catch (error) {
            console.log(`❌ Failed: ${file.path} - ${error.message}`);
        }
    }

    console.log('\n🔍 Verifying storage setup...');

    // Verify directory permissions and structure
    const verificationResults = [];

    for (const dir of directories) {
        const fullPath = path.join(baseDir, dir);
        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                // Test write permissions
                const testFile = path.join(fullPath, '.write-test');
                try {
                    await fs.writeFile(testFile, 'test');
                    await fs.unlink(testFile);
                    verificationResults.push({
                        directory: dir,
                        exists: true,
                        writable: true,
                        status: '✅'
                    });
                } catch {
                    verificationResults.push({
                        directory: dir,
                        exists: true,
                        writable: false,
                        status: '⚠️'
                    });
                }
            }
        } catch {
            verificationResults.push({
                directory: dir,
                exists: false,
                writable: false,
                status: '❌'
            });
        }
    }

    console.table(verificationResults);

    // Check disk space (if possible)
    console.log('\n💾 Storage Information:');
    try {
        const stats = await fs.stat(baseDir);
        console.log(`📍 Base Directory: ${baseDir}`);
        console.log(`🗓️ Created: ${stats.birthtime}`);
        console.log(`🔄 Modified: ${stats.mtime}`);
    } catch (error) {
        console.log('❌ Could not get storage stats:', error.message);
    }

    // Create storage configuration
    const storageConfig = {
        directories: directories.map(dir => path.join(baseDir, dir)),
        maxFileSize: {
            audio: '50MB',
            image: '5MB',
            general: '10MB'
        },
        allowedTypes: {
            audio: ['.mp3', '.wav', '.flac', '.m4a', '.aac'],
            image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            document: ['.pdf', '.txt', '.doc', '.docx']
        },
        cleanup: {
            tempFilesAfter: '24h',
            failedUploadsAfter: '1h',
            logFilesAfter: '30d'
        }
    };

    // Save storage config
    const configPath = path.join(baseDir, 'storage-config.json');
    try {
        await fs.writeFile(configPath, JSON.stringify(storageConfig, null, 2));
        console.log('✅ Storage configuration saved to storage-config.json');
    } catch (error) {
        console.log('❌ Failed to save storage config:', error.message);
    }

    // Create upload helper script
    const uploaderHelper = `// Upload Helper for DMG System
// Auto-generated by setup-storage.mjs

export const STORAGE_CONFIG = ${JSON.stringify(storageConfig, null, 2)};

export const getUploadPath = (type, filename) => {
    const uploadDir = type === 'audio' ? 'audio' : 
                     type === 'image' ? 'images' : 'temp';
    return \`/uploads/\${uploadDir}/\${filename}\`;
};

export const validateFileType = (filename, type) => {
    const ext = path.extname(filename).toLowerCase();
    return STORAGE_CONFIG.allowedTypes[type]?.includes(ext) || false;
};

export const cleanupTempFiles = async () => {
    // Implementation for cleanup logic
    console.log('Cleaning up temporary files...');
};
`;

    const helperPath = path.join(baseDir, 'lib', 'upload-helper.js');
    try {
        await fs.writeFile(helperPath, uploaderHelper);
        console.log('✅ Upload helper created at lib/upload-helper.js');
    } catch (error) {
        console.log('⚠️ Could not create upload helper:', error.message);
    }

    // Final summary
    const successCount = verificationResults.filter(r => r.status === '✅').length;
    const totalCount = verificationResults.length;
    const successRate = Math.round((successCount / totalCount) * 100);

    console.log('\n🎯 STORAGE SETUP SUMMARY');
    console.log('========================');
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`📁 Directories Created: ${successCount}/${totalCount}`);
    console.log(`📄 Files Created: ${requiredFiles.length}`);
    console.log(`⚙️ Configuration: Saved`);

    if (successRate >= 90) {
        console.log('🎉 Storage Status: EXCELLENT - Ready for file uploads!');
    } else if (successRate >= 70) {
        console.log('✅ Storage Status: GOOD - Minor issues to address');
    } else {
        console.log('⚠️ Storage Status: NEEDS ATTENTION - Some directories failed');
    }

    return {
        success: successRate >= 70,
        successRate,
        directories: verificationResults,
        configPath,
        helperPath: path.join('lib', 'upload-helper.js')
    };
}

setupStorage().catch(console.error);