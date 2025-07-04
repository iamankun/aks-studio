import { NextResponse } from 'next/server';
import { multiDB } from '@/lib/multi-database-service';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/session';

// The frontend component expects this structure
interface File {
  id: string;
  name: string;
  type: 'folder' | 'audio' | 'image' | 'document' | 'other';
  size: string;
  items?: number; // For folders
  // Add other relevant fields from submission if needed
  artist_name?: string;
  status?: string;
  submission_date?: string;
}

// Helper to determine file type from a filename
function getFileType(fileName: string | null | undefined): File['type'] {
    if (!fileName) return 'other';
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'other';

    if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document';
    return 'other';
}

export async function GET() {
    try {
        const session = await getSession();
        const user = session.user;

        if (!user) {
            logger.warn('Unauthorized attempt to access /api/files');
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        logger.info('Fetching files for user', { userId: user.id, role: user.role });

        // Depending on the role, fetch specific or all submissions
        const usernameToFetch = user.role === 'Artist' ? user.username : undefined;
        const result = await multiDB.getSubmissions(usernameToFetch);

        if (!result.success || !result.data) {
            logger.error('Failed to get submissions from DB service', { error: result.message });
            return NextResponse.json({ success: false, error: result.message || 'Failed to retrieve files.' }, { status: 500 });
        }

        // Map the database submission data to the File structure the frontend expects
        const files: File[] = result.data.map((submission: any) => ({
            id: String(submission.id),
            name: submission.track_title || 'Untitled Track',
            type: getFileType(submission.audio_file_url),
            size: submission.file_size ? `${(submission.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
            artist_name: submission.artist_name,
            status: submission.status,
            submission_date: submission.submission_date,
        }));

        return NextResponse.json({ success: true, data: files });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        logger.error('Error in /api/files endpoint', { error: errorMessage });
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}