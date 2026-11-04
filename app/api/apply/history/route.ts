import { NextResponse } from 'next/server';
import { getApplicationHistory } from '@/lib/tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = getApplicationHistory();
    return NextResponse.json({
      success: true,
      applications: history,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch application history';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
