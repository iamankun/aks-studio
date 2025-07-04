import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getSession();
    const user = session.user;

    if (user) {
      logger.info('User status checked: logged in', { userId: user.id });
      return NextResponse.json({ isLoggedIn: true, user });
    } else {
      logger.info('User status checked: not logged in');
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    logger.error('Error checking auth status', error);
    return NextResponse.json(
      { isLoggedIn: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}