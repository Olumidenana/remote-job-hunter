import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import { recordApplication, isAlreadyApplied, getApplicationHistory } from '@/lib/tracker';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { ApplicationRecord, RemoteJob } from '@/types/job';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutoApply(req);
}

export async function POST(req: NextRequest) {
  return handleAutoApply(req);
}

async function handleAutoApply(req: NextRequest) {
  try {
    const isTest = req.nextUrl.searchParams.get('test') === 'true';
    const testRecipient = req.nextUrl.searchParams.get('recipient') || DEFAULT_CANDIDATE.email;
    const maxApplications = parseInt(req.nextUrl.searchParams.get('limit') || '5', 10);

    // 1. Fetch latest real-time jobs
    const scan = await fetchRemoteJobs();
    const candidate = DEFAULT_CANDIDATE;

    // 2. Filter for safe, unapplied, high-scoring matches
    const eligibleJobs: RemoteJob[] = [];
    const directEmailJobs: RemoteJob[] = [];

    for (const job of scan.matchedJobs) {
      // Must not be scam
      if (job.safety && job.safety.riskLevel === 'SUSPICIOUS_SCAM') {
        continue;
      }

      // Check if already applied
      if (isAlreadyApplied(job.id)) {
        continue;
      }

      // Score threshold >= 75
      if (job.matchScore >= 75) {
        eligibleJobs.push(job);
        if (job.instructions?.hasDirectEmail) {
          directEmailJobs.push(job);
        }
      }
    }

    // If test mode is requested, apply directly to testRecipient using the #1 top match
    if (isTest) {
      const topJob = eligibleJobs[0] || scan.matchedJobs[0];
      if (!topJob) {
        return NextResponse.json({
          success: false,
          error: 'No matching jobs available to test with',
        }, { status: 404 });
      }

      const pkg = generateApplicationPackage(topJob);
      const dispatch = await sendApplicationOnBehalf(topJob, pkg, testRecipient);

      const record: ApplicationRecord = {
        id: `test-app-${Date.now()}`,
        jobId: topJob.id,
        company: topJob.company,
        jobTitle: topJob.title,
        recipientEmail: testRecipient,
        subject: `[TEST RUN] ${dispatch.subject}`,
        status: (dispatch.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
        sentAt: new Date().toISOString(),
        cvAttached: dispatch.cvAttached,
        complianceNotes: dispatch.instructionsApplied,
      };

      recordApplication(record);

      return NextResponse.json({
        success: true,
        mode: 'TEST_DISPATCH',
        recipient: testRecipient,
        jobTitle: topJob.title,
        company: topJob.company,
        cvAttached: dispatch.cvAttached,
        dispatchResult: dispatch,
        record,
        message: `Test application dispatched to ${testRecipient} with ${dispatch.cvAttached} attached! Check your inbox.`,
      });
    }

    // Autonomous Mode: Process direct email matches first, then high matches
    const targetsToApply = directEmailJobs.length > 0
      ? directEmailJobs.slice(0, maxApplications)
      : eligibleJobs.slice(0, Math.min(2, maxApplications));

    const dispatchedRecords: ApplicationRecord[] = [];
    const dispatchNotes: string[] = [];

    for (const job of targetsToApply) {
      try {
        const pkg = generateApplicationPackage(job);
        // Dispatch to recipient (or fallback candidate email)
        const dispatch = await sendApplicationOnBehalf(job, pkg);

        const record: ApplicationRecord = {
          id: `auto-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          recipientEmail: dispatch.recipient,
          subject: dispatch.subject,
          status: (dispatch.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
          sentAt: new Date().toISOString(),
          cvAttached: dispatch.cvAttached,
          complianceNotes: dispatch.instructionsApplied,
        };

        recordApplication(record);
        dispatchedRecords.push(record);
        dispatchNotes.push(`${job.company} (${job.title}) -> ${dispatch.recipient}`);
      } catch (applyErr) {
        console.error(`Failed auto-apply for job ${job.id}:`, applyErr);
      }
    }

    const updatedOutbox = getApplicationHistory();

    return NextResponse.json({
      success: true,
      mode: 'AUTONOMOUS_CYCLE',
      scannedTotal: scan.totalScanned,
      eligibleMatches: eligibleJobs.length,
      directEmailMatches: directEmailJobs.length,
      dispatchedCount: dispatchedRecords.length,
      dispatched: dispatchedRecords,
      outboxCount: updatedOutbox.length,
      notes: dispatchNotes,
      message: dispatchedRecords.length > 0
        ? `Successfully processed ${dispatchedRecords.length} autonomous applications with CVs attached.`
        : 'Scan completed. No new unapplied direct-email matches found in this cycle.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Autonomous apply cycle failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
