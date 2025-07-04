import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    logger.info('User logged out successfully');
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    logger.error('Logout API error', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error while logging out.' },
      { status: 500 }
    );
  }
}