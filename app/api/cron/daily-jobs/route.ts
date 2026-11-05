import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { sendDailyDigest } from '@/lib/mailer';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import {
  recordApplication,
  isAlreadyApplied,
  normalizeCompany,
  extractDomain,
} from '@/lib/tracker';
import { CURATED_OUTREACH_TARGETS, generateDiagnosticPitch } from '@/lib/outreach-engine';
import { RemoteJob, ApplicationPackage, ApplicationRecord } from '@/types/job';
import { getQuotaStatus } from '@/lib/quota-tracker';

export const dynamic = 'force-dynamic';

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
  try {
    const scanResult = await fetchRemoteJobs();
    const recipient = req.nextUrl.searchParams.get('email') || DEFAULT_CANDIDATE.email;
    const batchLimit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);
    const quota = getQuotaStatus();

    // 1. Run Autonomous Auto-Apply for safe, unapplied direct email jobs found
    const eligibleJobs = scanResult.matchedJobs.filter(
      j => j.instructions?.hasDirectEmail &&
           j.matchScore >= 75 &&
           j.safety?.riskLevel === 'VERIFIED_SAFE' &&
           !isAlreadyApplied(j.id, j.company, j.title, j.instructions?.recipientEmail, j.url)
    );

    const safeBatchLimit = Math.min(batchLimit, quota.remainingJobApps);
    const autoApplyTargets = selectDiverseUniqueCompanies(eligibleJobs, safeBatchLimit);

    const autoDispatched: string[] = [];
    for (const job of autoApplyTargets) {
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

    // 2. Proactive Strategic Problem-Solver Outreach (Dispatches 1-2 high-urgency diagnostic pitches)
    let proactiveOutreachDispatched: string | null = null;
    const pendingOutreachTarget = CURATED_OUTREACH_TARGETS.find(
      t => !isAlreadyApplied(t.id, t.company, undefined, t.contactEmail, t.domain)
    );

    if (pendingOutreachTarget && !quota.isHardCapped && quota.remainingOutreach > 0) {
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

    // 3. Send Daily Digest to Olumide
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
      proactiveOutreach: proactiveOutreachDispatched,
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
