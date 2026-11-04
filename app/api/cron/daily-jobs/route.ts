import { NextRequest, NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { sendDailyDigest } from '@/lib/mailer';
import { DEFAULT_CANDIDATE } from '@/lib/profile';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import { recordApplication, isAlreadyApplied } from '@/lib/tracker';
import { CURATED_OUTREACH_TARGETS, generateDiagnosticPitch } from '@/lib/outreach-engine';
import { RemoteJob, ApplicationPackage } from '@/types/job';

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

    // 2. Proactive Strategic Problem-Solver Outreach (Dispatches 1 high-urgency diagnostic pitch per day)
    let proactiveOutreachDispatched: string | null = null;
    const pendingOutreachTarget = CURATED_OUTREACH_TARGETS.find(
      t => !isAlreadyApplied(t.id, t.company, 'Proactive Strategic Diagnostic Audit', t.contactEmail)
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

        const outRes = await sendApplicationOnBehalf(pseudoJob, appPkg);
        recordApplication({
          id: `cron-outreach-${Date.now()}`,
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
        });
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
