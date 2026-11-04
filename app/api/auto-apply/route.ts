import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import {
  recordApplication,
  isAlreadyApplied,
  getApplicationHistory,
  normalizeCompany,
  extractDomain,
} from '@/lib/tracker';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { ApplicationRecord, RemoteJob } from '@/types/job';
import { getQuotaStatus } from '@/lib/quota-tracker';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutoApply(req);
}

export async function POST(req: NextRequest) {
  return handleAutoApply(req);
}

/**
 * Strict Anti-Spam Selection:
 * Ensures every single target in a batch belongs to a 100% UNIQUE company and UNIQUE domain.
 * Never applies to the same employer twice.
 */
function selectDiverseUniqueCompanies(jobs: RemoteJob[], limit: number): RemoteJob[] {
  const seenCompanies = new Set<string>();
  const seenDomains = new Set<string>();
  const selected: RemoteJob[] = [];

  // Sort by match score descending to pick the single best job for each employer
  const sorted = [...jobs].sort((a, b) => b.matchScore - a.matchScore);

  for (const job of sorted) {
    const cNorm = normalizeCompany(job.company);
    const domain = extractDomain(job.instructions?.recipientEmail) || extractDomain(job.url);

    // 1. Prevent selecting the same company twice in this run
    if (cNorm && seenCompanies.has(cNorm)) {
      continue;
    }

    // 2. Prevent selecting the same corporate domain twice in this run
    if (domain && seenDomains.has(domain)) {
      continue;
    }

    // 3. Prevent selecting any company/domain already in historical outbox
    if (isAlreadyApplied(job.id, job.company, job.title, job.instructions?.recipientEmail, job.url)) {
      continue;
    }

    if (cNorm) seenCompanies.add(cNorm);
    if (domain) seenDomains.add(domain);
    selected.push(job);

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
}

async function handleAutoApply(req: NextRequest) {
  try {
    const isTest = req.nextUrl.searchParams.get('test') === 'true';
    const testRecipient = req.nextUrl.searchParams.get('recipient') || DEFAULT_CANDIDATE.email;
    const maxApplications = parseInt(req.nextUrl.searchParams.get('limit') || '25', 10);

    // 1. Fetch latest real-time jobs
    const scan = await fetchRemoteJobs();

    // 2. Filter for safe, unapplied, high-scoring matches
    const eligibleJobs: RemoteJob[] = [];
    const directEmailJobs: RemoteJob[] = [];

    for (const job of scan.matchedJobs) {
      // Must not be scam
      if (job.safety && job.safety.riskLevel === 'SUSPICIOUS_SCAM') {
        continue;
      }

      // Check against duplicate company or domain
      if (isAlreadyApplied(job.id, job.company, job.title, job.instructions?.recipientEmail, job.url)) {
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
        messageId: dispatch.messageId,
        jobId: topJob.id,
        company: topJob.company,
        jobTitle: topJob.title,
        recipientEmail: topJob.instructions?.recipientEmail || `jobs@${normalizeCompany(topJob.company)}.com`,
        companyEmailPicked: topJob.instructions?.recipientEmail || `jobs@${normalizeCompany(topJob.company)}.com`,
        actualDeliveredTo: testRecipient,
        deliveryMode: 'SANDBOX_FORWARD_READY',
        mailtoUrl: dispatch.mailtoUrl,
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

    // 3. Autonomous Mode: Check daily safety quota first
    const quota = getQuotaStatus();
    if (quota.isHardCapped || quota.remainingJobApps <= 0) {
      return NextResponse.json({
        success: true,
        mode: 'QUOTA_LIMIT_PROTECTED',
        message: `Daily job application quota reached (${quota.jobAppCount}/${quota.jobAppBudget} sent today). Pausing batch dispatches until midnight UTC to protect your Resend account.`,
        quota,
      });
    }

    const safeBatchLimit = Math.min(maxApplications, quota.remainingJobApps);
    const pool = directEmailJobs.length > 0 ? directEmailJobs : eligibleJobs;

    // Filter for strictly UNIQUE companies and domains across the batch
    const targetsToApply = selectDiverseUniqueCompanies(pool, safeBatchLimit);

    const dispatchedRecords: ApplicationRecord[] = [];
    const dispatchNotes: string[] = [];

    for (const job of targetsToApply) {
      try {
        const pkg = generateApplicationPackage(job);
        const dispatch = await sendApplicationOnBehalf(job, pkg);

        const record: ApplicationRecord = {
          id: `auto-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          messageId: dispatch.messageId,
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          recipientEmail: dispatch.targetCompanyEmail || dispatch.recipient,
          companyEmailPicked: dispatch.targetCompanyEmail || dispatch.recipient,
          actualDeliveredTo: dispatch.actualDeliveredTo,
          deliveryMode: dispatch.deliveryMode,
          mailtoUrl: dispatch.mailtoUrl,
          subject: dispatch.subject,
          status: (dispatch.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
          sentAt: new Date().toISOString(),
          cvAttached: dispatch.cvAttached,
          complianceNotes: dispatch.instructionsApplied,
        };

        recordApplication(record);
        dispatchedRecords.push(record);
        dispatchNotes.push(`[UNIQUE EMPLOYER] ${job.company} (${job.title}) -> ${dispatch.recipient}`);
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
      uniqueCompaniesReached: dispatchedRecords.length,
      dispatchedCount: dispatchedRecords.length,
      dispatched: dispatchedRecords,
      outboxCount: updatedOutbox.length,
      notes: dispatchNotes,
      antiSpamPolicy: 'Strict 1-Email-Per-Employer Rule Enforced (100% Unique Companies & Domains)',
      message: dispatchedRecords.length > 0
        ? `Successfully dispatched ${dispatchedRecords.length} applications across ${dispatchedRecords.length} completely unique companies.`
        : 'Scan completed. No new unapplied unique companies found in this cycle.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Autonomous apply cycle failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
