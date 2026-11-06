import { NextRequest, NextResponse } from 'next/server';
import { getApplicationHistory, syncPersistentHistory, recordApplicationsBatch } from '@/lib/tracker';
import { ApplicationRecord } from '@/types/job';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const history = await syncPersistentHistory();
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientHistory: ApplicationRecord[] = Array.isArray(body?.clientHistory) ? body.clientHistory : [];
    
    const merged = await syncPersistentHistory(clientHistory);
    return NextResponse.json({
      success: true,
      applications: merged,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to sync application history';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
