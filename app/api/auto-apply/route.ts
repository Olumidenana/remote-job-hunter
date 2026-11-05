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
import { ApplicationRecord, RemoteJob, ApplicationPackage } from '@/types/job';
import { getQuotaStatus, canDispatch } from '@/lib/quota-tracker';
import { CURATED_OUTREACH_TARGETS, generateDiagnosticPitch, OutreachTarget } from '@/lib/outreach-engine';

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
function selectDiverseUniqueCompanies(
  jobs: RemoteJob[],
  limit: number,
  extraHistory?: ApplicationRecord[]
): RemoteJob[] {
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

    // 3. Prevent selecting any company/domain already in historical outbox or client history
    if (isAlreadyApplied(job.id, job.company, job.title, job.instructions?.recipientEmail, job.url, extraHistory)) {
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
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const isTest = req.nextUrl.searchParams.get('test') === 'true' || body?.test === true;
    const testRecipient = req.nextUrl.searchParams.get('recipient') || body?.recipient || DEFAULT_CANDIDATE.email;
    const maxApplications = parseInt(req.nextUrl.searchParams.get('limit') || body?.limit || '20', 10);
    const includeOutreach = req.nextUrl.searchParams.get('outreach') !== 'false' && body?.outreach !== false;
    const maxOutreach = parseInt(req.nextUrl.searchParams.get('outreachLimit') || body?.outreachLimit || '5', 10);

    // Sync client-side persistent history if passed
    const clientHistory: ApplicationRecord[] = Array.isArray(body?.clientHistory) ? body.clientHistory : [];
    const mergedHistory = getApplicationHistory(clientHistory);

    // 1. Fetch latest real-time jobs
    const scan = await fetchRemoteJobs();

    // 2. Filter for safe, unapplied, high-scoring matches
    const eligibleJobs: RemoteJob[] = [];
    const directEmailJobs: RemoteJob[] = [];

    for (const job of scan.matchedJobs) {
      if (job.safety && job.safety.riskLevel === 'SUSPICIOUS_SCAM') {
        continue;
      }

      // Check against duplicate company or domain
      if (isAlreadyApplied(job.id, job.company, job.title, job.instructions?.recipientEmail, job.url, mergedHistory)) {
        continue;
      }

      if (job.matchScore >= 75) {
        eligibleJobs.push(job);
        if (job.instructions?.hasDirectEmail) {
          directEmailJobs.push(job);
        }
      }
    }

    // TEST MODE: Sends 1 preview application to candidate.email
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
        type: 'JOB_APP',
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
        applications: getApplicationHistory(),
        message: `Test application dispatched to ${testRecipient} with ${dispatch.cvAttached} attached! Check your inbox.`,
      });
    }

    // 3. Autonomous Execution: Runner 1 (Inbound Job Applications)
    const quota = getQuotaStatus();
    const dispatchedRecords: ApplicationRecord[] = [];
    const dispatchNotes: string[] = [];

    if (!quota.isHardCapped && quota.remainingJobApps > 0) {
      const safeJobLimit = Math.min(maxApplications, quota.remainingJobApps);
      const pool = directEmailJobs.length > 0 ? directEmailJobs : eligibleJobs;
      const targetsToApply = selectDiverseUniqueCompanies(pool, safeJobLimit, mergedHistory);

      for (const job of targetsToApply) {
        try {
          const pkg = generateApplicationPackage(job);
          const dispatch = await sendApplicationOnBehalf(job, pkg, undefined, 'JOB_APP');

          const record: ApplicationRecord = {
            id: `auto-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'JOB_APP',
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
          dispatchNotes.push(`[JOB APP] ${job.company} (${job.title}) -> ${dispatch.recipient}`);
        } catch (applyErr) {
          console.error(`Failed auto-apply for job ${job.id}:`, applyErr);
        }
      }
    } else {
      dispatchNotes.push(`[JOB APP SHIELD] Daily job quota limit reached (${quota.jobAppCount}/${quota.jobAppBudget}). Job apps paused.`);
    }

    // 4. Autonomous Execution: Runner 2 (Proactive Strategic Diagnostic Outreach)
    const dispatchedOutreaches: ApplicationRecord[] = [];
    if (includeOutreach) {
      const updatedQuota = getQuotaStatus();
      if (!updatedQuota.isHardCapped && updatedQuota.remainingOutreach > 0) {
        const safeOutreachLimit = Math.min(maxOutreach, updatedQuota.remainingOutreach);
        
        // Find un-contacted outreach targets
        const pendingTargets = CURATED_OUTREACH_TARGETS.filter(t => 
          !isAlreadyApplied(t.id, t.company, undefined, t.contactEmail, t.domain, [...mergedHistory, ...dispatchedRecords])
        ).slice(0, safeOutreachLimit);

        for (const target of pendingTargets) {
          try {
            const pitchPkg = generateDiagnosticPitch(target);
            const pseudoJob: RemoteJob = {
              id: target.id,
              title: `Architectural Diagnostic: ${target.urgencyHook}`,
              company: target.company,
              location: 'Global Proactive Outreach',
              isWorldwide: true,
              url: `https://${target.domain}`,
              applyUrl: `mailto:${target.contactEmail}`,
              source: 'Direct',
              tags: [target.sector.toLowerCase(), 'architecture', 'systems'],
              description: target.diagnosedProblem,
              publishedAt: new Date().toISOString(),
              matchScore: 99,
              matchReasons: [target.urgencyHook],
              synergyStack: ['Systems Architecture', 'Latency Reduction'],
            };

            const appPkg: ApplicationPackage = {
              jobId: target.id,
              jobTitle: `Strategic Architecture Diagnostic`,
              company: target.company,
              recipientEmail: target.contactEmail,
              subject: pitchPkg.subject,
              hookPitch: pitchPkg.hookPitch,
              fullCoverLetter: pitchPkg.fullBody,
              mailtoUrl: pitchPkg.mailtoUrl,
              recommendedCVFile: pitchPkg.recommendedCVFile,
              recommendedCVName: pitchPkg.recommendedCVName,
              instructions: {
                recipientEmail: target.contactEmail,
                secretCodeWords: [],
                detectedInstructions: [`Proactive diagnostic outreach for ${target.sector}`],
                requiredAnswers: [],
                recommendedCV: target.recommendedCV,
                recommendedCVFile: pitchPkg.recommendedCVFile,
                hasDirectEmail: true,
                complianceConfidence: 100,
              },
              atsAnalysis: {
                atsScore: 99,
                matchingKeywords: ['architecture', 'systems'],
                missingKeywords: [],
                recommendedHeadline: 'Sovereign Architecture & High-Performance Systems Engineer',
                tailoredSummary: pitchPkg.hookPitch,
              },
              safety: {
                safetyScore: 100,
                riskLevel: 'VERIFIED_SAFE',
                flags: [],
                reasons: ['Direct Verified Organization'],
                isVerifiedCompany: true,
              },
            };

            const dispatchResult = await sendApplicationOnBehalf(pseudoJob, appPkg, undefined, 'OUTREACH');

            const outreachRecord: ApplicationRecord = {
              id: `outreach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: 'OUTREACH',
              sector: target.sector,
              urgencyHook: target.urgencyHook,
              flagshipUsed: target.candidateFlagshipUsed,
              diagnosedProblem: target.diagnosedProblem,
              messageId: dispatchResult.messageId,
              jobId: target.id,
              company: target.company,
              jobTitle: `Diagnostic Pitch: ${target.sector}`,
              recipientEmail: target.contactEmail,
              companyEmailPicked: target.contactEmail,
              actualDeliveredTo: dispatchResult.actualDeliveredTo,
              deliveryMode: dispatchResult.deliveryMode,
              mailtoUrl: pitchPkg.mailtoUrl,
              subject: pitchPkg.subject,
              status: (dispatchResult.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
              sentAt: new Date().toISOString(),
              cvAttached: dispatchResult.cvAttached,
              complianceNotes: [
                `Sector: ${target.sector}`,
                `Flagship: ${target.candidateFlagshipUsed}`,
                `Urgency: ${target.urgencyHook}`,
              ],
            };

            recordApplication(outreachRecord);
            dispatchedOutreaches.push(outreachRecord);
            dispatchNotes.push(`[OUTREACH] ${target.company} (${target.sector}) -> ${dispatchResult.recipient}`);
          } catch (outErr) {
            console.error(`Failed outreach dispatch for target ${target.id}:`, outErr);
          }
        }
      } else {
        dispatchNotes.push(`[OUTREACH SHIELD] Daily outreach quota limit reached. Outreach paused.`);
      }
    }

    const allRecords = getApplicationHistory();

    return NextResponse.json({
      success: true,
      mode: 'DUAL_AUTONOMOUS_CYCLE',
      scannedTotal: scan.totalScanned,
      eligibleMatches: eligibleJobs.length,
      jobAppsDispatched: dispatchedRecords.length,
      outreachesDispatched: dispatchedOutreaches.length,
      totalDispatchedThisSweep: dispatchedRecords.length + dispatchedOutreaches.length,
      dispatchedJobs: dispatchedRecords,
      dispatchedOutreaches,
      applications: allRecords,
      outboxCount: allRecords.length,
      notes: dispatchNotes,
      antiSpamPolicy: 'Strict 1-Email-Per-Employer Rule Enforced (100% Unique Companies & Domains Across All Engines)',
      message: (dispatchedRecords.length + dispatchedOutreaches.length > 0)
        ? `Cycle Complete: Dispatched ${dispatchedRecords.length} unique job applications and ${dispatchedOutreaches.length} proactive diagnostic outreaches across 100% distinct employers.`
        : 'Cycle Complete: All scanned companies have already been contacted. Zero duplicate emails sent.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Autonomous apply cycle failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
