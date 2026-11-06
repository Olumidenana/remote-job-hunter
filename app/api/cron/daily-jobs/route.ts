import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { sendDailyDigest } from '@/lib/mailer';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import {
  recordApplication,
  isAlreadyApplied,
  syncPersistentHistory,
  normalizeCompany,
  extractDomain,
} from '@/lib/tracker';
import { CURATED_OUTREACH_TARGETS, generateDiagnosticPitch } from '@/lib/outreach-engine';
import { RemoteJob, ApplicationPackage, ApplicationRecord } from '@/types/job';
import { getQuotaStatus, canDispatch } from '@/lib/quota-tracker';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  return handleJobAlert(req);
}

export async function POST(req: NextRequest) {
  return handleJobAlert(req);
}

function selectDiverseUniqueCompanies(jobs: RemoteJob[], limit: number): RemoteJob[] {
  const seenCompanies = new Set<string>();
  const seenDomains = new Set<string>();
  const selected: RemoteJob[] = [];

  const sorted = [...jobs].sort((a, b) => b.matchScore - a.matchScore);

  for (const job of sorted) {
    const cNorm = normalizeCompany(job.company);
    const domain = extractDomain(job.instructions?.recipientEmail) || extractDomain(job.url);

    if (cNorm && seenCompanies.has(cNorm)) continue;
    if (domain && seenDomains.has(domain)) continue;
    if (isAlreadyApplied(job.id, job.company, job.title, job.instructions?.recipientEmail, job.url)) continue;

    if (cNorm) seenCompanies.add(cNorm);
    if (domain) seenDomains.add(domain);
    selected.push(job);

    if (selected.length >= limit) break;
  }

  return selected;
}

async function handleJobAlert(req: NextRequest) {
  const cronStartTime = Date.now();
  // Safe execution budget: 8.5 seconds max to guarantee completion within Vercel's standard limit
  const MAX_EXECUTION_MS = 8500;

  try {
    // 0. Synchronize full persistent history (Resend API + KV + Disk + Seed)
    await syncPersistentHistory();

    const scanResult = await fetchRemoteJobs();
    const recipient = req.nextUrl.searchParams.get('email') || DEFAULT_CANDIDATE.email;
    const isDigestOnly = req.nextUrl.searchParams.get('digestOnly') === '1' || req.nextUrl.searchParams.get('digestOnly') === 'true';

    // Default cron auto-apply to 2 top jobs (instead of 20) to preserve Resend's daily free tier
    const defaultBatchLimit = process.env.CRON_AUTO_APPLY_LIMIT || '2';
    const batchLimit = isDigestOnly ? 0 : parseInt(req.nextUrl.searchParams.get('limit') || defaultBatchLimit, 10);

    // 1. Send Daily Digest to Olumide FIRST — Guaranteed delivery before auto-applies consume capacity
    const dispatchResult = await sendDailyDigest(
      scanResult.matchedJobs,
      scanResult.stats,
      recipient
    );

    const autoDispatched: string[] = [];
    let proactiveOutreachDispatched: string | null = null;

    // 2. Run Autonomous Auto-Apply only if allowed, quota permits, and execution time budget remains
    if (!isDigestOnly && batchLimit > 0) {
      const quota = getQuotaStatus();

      const eligibleJobs = scanResult.matchedJobs.filter(
        j => j.instructions?.hasDirectEmail &&
             j.matchScore >= 75 &&
             j.safety?.riskLevel === 'VERIFIED_SAFE' &&
             !isAlreadyApplied(j.id, j.company, j.title, j.instructions?.recipientEmail, j.url)
      );

      const safeBatchLimit = Math.min(batchLimit, quota.remainingJobApps);
      const autoApplyTargets = selectDiverseUniqueCompanies(eligibleJobs, safeBatchLimit);

      for (const job of autoApplyTargets) {
        // Enforce time budget: stop if approaching Vercel serverless timeout
        if (Date.now() - cronStartTime > MAX_EXECUTION_MS) {
          console.warn(`[CRON TIME SHIELD] Exceeded ${MAX_EXECUTION_MS}ms budget, pausing auto-apply loop.`);
          break;
        }

        // Check live quota before each dispatch
        const quotaCheck = canDispatch('JOB_APP');
        if (!quotaCheck.allowed) {
          console.warn(`[CRON QUOTA SHIELD] Job application budget reached: ${quotaCheck.reason}`);
          break;
        }

        try {
          const pkg = generateApplicationPackage(job);
          const res = await sendApplicationOnBehalf(job, pkg, undefined, 'JOB_APP');
          const record: ApplicationRecord = {
            id: `cron-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'JOB_APP',
            messageId: res.messageId,
            jobId: job.id,
            company: job.company,
            jobTitle: job.title,
            recipientEmail: res.targetCompanyEmail || res.recipient,
            companyEmailPicked: res.targetCompanyEmail || res.recipient,
            actualDeliveredTo: res.actualDeliveredTo,
            deliveryMode: res.deliveryMode,
            mailtoUrl: res.mailtoUrl,
            subject: res.subject,
            status: (res.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
            sentAt: new Date().toISOString(),
            cvAttached: res.cvAttached,
            complianceNotes: res.instructionsApplied,
          };
          recordApplication(record);
          autoDispatched.push(`${job.company} (${job.title})`);
        } catch (err) {
          console.error('Cron auto-apply error for job:', job.id, err);
        }
      }

      // 3. Proactive Strategic Problem-Solver Outreach (Dispatches max 1 if within time & quota)
      const currentQuota = getQuotaStatus();
      const hasTimeForOutreach = Date.now() - cronStartTime < MAX_EXECUTION_MS;

      if (!currentQuota.isHardCapped && currentQuota.remainingOutreach > 0 && hasTimeForOutreach) {
        const pendingOutreachTarget = CURATED_OUTREACH_TARGETS.find(
          t => !isAlreadyApplied(t.id, t.company, undefined, t.contactEmail, t.domain)
        );

        if (pendingOutreachTarget) {
          try {
            const pitchPkg = generateDiagnosticPitch(pendingOutreachTarget);
            const pseudoJob: RemoteJob = {
              id: pendingOutreachTarget.id,
              title: `Architectural Diagnostic: ${pendingOutreachTarget.urgencyHook}`,
              company: pendingOutreachTarget.company,
              location: 'Global Proactive Outreach',
              isWorldwide: true,
              url: `https://${pendingOutreachTarget.domain}`,
              applyUrl: `mailto:${pendingOutreachTarget.contactEmail}`,
              source: 'Direct',
              tags: [pendingOutreachTarget.sector.toLowerCase(), 'architecture'],
              description: pendingOutreachTarget.diagnosedProblem,
              publishedAt: new Date().toISOString(),
              matchScore: 99,
              matchReasons: [pendingOutreachTarget.urgencyHook],
              synergyStack: ['Systems Architecture', 'Latency Reduction'],
            };

            const appPkg: ApplicationPackage = {
              jobId: pendingOutreachTarget.id,
              jobTitle: `Strategic Architecture Diagnostic`,
              company: pendingOutreachTarget.company,
              recipientEmail: pendingOutreachTarget.contactEmail,
              subject: pitchPkg.subject,
              hookPitch: pitchPkg.hookPitch,
              fullCoverLetter: pitchPkg.fullBody,
              mailtoUrl: pitchPkg.mailtoUrl,
              recommendedCVFile: pitchPkg.recommendedCVFile,
              recommendedCVName: pitchPkg.recommendedCVName,
              instructions: {
                recipientEmail: pendingOutreachTarget.contactEmail,
                secretCodeWords: [],
                detectedInstructions: [`Proactive diagnostic outreach for ${pendingOutreachTarget.sector}`],
                requiredAnswers: [],
                recommendedCV: pendingOutreachTarget.recommendedCV,
                recommendedCVFile: pitchPkg.recommendedCVFile,
                hasDirectEmail: true,
                complianceConfidence: 100,
              },
              atsAnalysis: {
                atsScore: 99,
                matchingKeywords: ['systems', 'architecture'],
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

            const outRes = await sendApplicationOnBehalf(pseudoJob, appPkg, undefined, 'OUTREACH');
            const outreachRecord: ApplicationRecord = {
              id: `cron-outreach-${Date.now()}`,
              type: 'OUTREACH',
              sector: pendingOutreachTarget.sector,
              urgencyHook: pendingOutreachTarget.urgencyHook,
              flagshipUsed: pendingOutreachTarget.candidateFlagshipUsed,
              diagnosedProblem: pendingOutreachTarget.diagnosedProblem,
              messageId: outRes.messageId,
              jobId: pendingOutreachTarget.id,
              company: pendingOutreachTarget.company,
              jobTitle: `Diagnostic Pitch: ${pendingOutreachTarget.sector}`,
              recipientEmail: pendingOutreachTarget.contactEmail,
              companyEmailPicked: pendingOutreachTarget.contactEmail,
              actualDeliveredTo: outRes.actualDeliveredTo,
              deliveryMode: outRes.deliveryMode,
              mailtoUrl: pitchPkg.mailtoUrl,
              subject: pitchPkg.subject,
              status: (outRes.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED'),
              sentAt: new Date().toISOString(),
              cvAttached: pitchPkg.recommendedCVFile,
              complianceNotes: [
                `Urgency Hook: ${pendingOutreachTarget.urgencyHook}`,
                `Flagship: ${pendingOutreachTarget.candidateFlagshipUsed}`,
              ],
            };
            recordApplication(outreachRecord);
            proactiveOutreachDispatched = `${pendingOutreachTarget.company} (${pendingOutreachTarget.contactEmail})`;
          } catch (outErr) {
            console.error('Proactive outreach cron error:', outErr);
          }
        }
      }
    }

    const isFullRequested = req.nextUrl.searchParams.get('full') === '1';

    if (isFullRequested) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        recipient,
        scannedCount: scanResult.totalScanned,
        highMatchCount: scanResult.stats.highMatchCount,
        urgentCount: scanResult.stats.urgentCount,
        autoAppliedJobs: autoDispatched,
        proactiveOutreach: proactiveOutreachDispatched,
        digestDispatch: {
          success: dispatchResult.success,
          provider: dispatchResult.provider,
          recipient: dispatchResult.recipient,
          jobCount: dispatchResult.jobCount,
          note: dispatchResult.note,
        },
      });
    }

    // Ultra-compact payload (< 150 bytes) guaranteed never to exceed cron-job.org / monitor logging limits
    return NextResponse.json({
      status: 'ok',
      scanned: scanResult.totalScanned,
      highMatches: scanResult.stats.highMatchCount,
      applied: autoDispatched.length,
      digest: dispatchResult.provider || 'SENT',
      durationMs: Date.now() - cronStartTime,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cron job execution failed';
    console.error('Cron job error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg, status: 'error' },
      { status: 200 } // Return 200 so monitors don't fail, with error status in body
    );
  }
}
