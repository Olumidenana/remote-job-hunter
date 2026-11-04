import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { sendDailyDigest } from '@/lib/mailer';
import { DEFAULT_CANDIDATE } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleJobAlert(req);
}

export async function POST(req: NextRequest) {
  return handleJobAlert(req);
}

async function handleJobAlert(req: NextRequest) {
  try {
    // Optional secret check if invoked by Vercel Cron with CRON_SECRET
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In development or when manual trigger, allow if no strict header
    }

    const scanResult = await fetchRemoteJobs();
    const recipient = req.nextUrl.searchParams.get('email') || DEFAULT_CANDIDATE.email;

    const dispatchResult = await sendDailyDigest(
      scanResult.matchedJobs,
      scanResult.stats,
      recipient
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      recipient,
      scannedCount: scanResult.totalScanned,
      highMatchCount: scanResult.stats.highMatchCount,
      urgentCount: scanResult.stats.urgentCount,
      dispatch: dispatchResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron job execution failed';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
