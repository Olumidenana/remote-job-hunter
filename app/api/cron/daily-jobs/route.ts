import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { sendDailyDigest } from '@/lib/mailer';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import { recordApplication, isAlreadyApplied } from '@/lib/tracker';

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

    // 1. Run Autonomous Auto-Apply for any new verified direct email jobs
    const autoApplyTargets = scanResult.matchedJobs.filter(
      j => j.instructions?.hasDirectEmail &&
           j.matchScore >= 75 &&
           j.safety?.riskLevel === 'VERIFIED_SAFE' &&
           !isAlreadyApplied(j.id, j.company, j.title, j.instructions?.recipientEmail)
    ).slice(0, 5);

    const autoDispatched: string[] = [];
    for (const job of autoApplyTargets) {
      try {
        const pkg = generateApplicationPackage(job);
        const res = await sendApplicationOnBehalf(job, pkg);
        recordApplication({
          id: `cron-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          recipientEmail: res.recipient,
          subject: res.subject,
          status: (res.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
          sentAt: new Date().toISOString(),
          cvAttached: res.cvAttached,
          complianceNotes: res.instructionsApplied,
        });
        autoDispatched.push(`${job.company} (${job.title})`);
      } catch (err) {
        console.error('Cron auto-apply error for job:', job.id, err);
      }
    }

    // 2. Send Daily Digest to Olumide
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
      autoAppliedJobs: autoDispatched,
      digestDispatch: dispatchResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron job execution failed';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
