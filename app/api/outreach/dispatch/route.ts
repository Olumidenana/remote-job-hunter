import { NextRequest, NextResponse } from 'next/server';
import { OutreachTarget, generateDiagnosticPitch } from '@/lib/outreach-engine';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import { recordApplication } from '@/lib/tracker';
import { RemoteJob, ApplicationPackage } from '@/types/job';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { target }: { target: OutreachTarget } = await req.json();

    if (!target || !target.company || !target.contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Invalid outreach target data' },
        { status: 400 }
      );
    }

    const pitchPkg = generateDiagnosticPitch(target);

    // Adapt to RemoteJob and ApplicationPackage structure for outbound mailer
    const pseudoJob: RemoteJob = {
      id: target.id,
      title: `Architectural Diagnostic: ${target.urgencyHook}`,
      company: target.company,
      location: 'Global Proactive Outreach',
      isWorldwide: true,
      url: `https://${target.domain}`,
      applyUrl: `mailto:${target.contactEmail}`,
      source: 'Direct',
      tags: [target.sector.toLowerCase(), 'architecture', 'systems', 'consulting'],
      description: target.diagnosedProblem,
      publishedAt: new Date().toISOString(),
      matchScore: 98,
      matchReasons: [target.urgencyHook],
      synergyStack: ['Systems Architecture', 'Latency Reduction', 'Concurrency Locks'],
    };

    const applicationPkg: ApplicationPackage = {
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
        atsScore: 98,
        matchingKeywords: ['systems', 'architecture', 'concurrency', 'performance'],
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

    const dispatchResult = await sendApplicationOnBehalf(pseudoJob, applicationPkg, undefined, 'OUTREACH');

    const record = {
      id: `outreach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      status: (dispatchResult.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED') as 'SENT' | 'QUEUED',
      sentAt: new Date().toISOString(),
      cvAttached: pitchPkg.recommendedCVFile,
      complianceNotes: [
        `Urgency Hook: ${target.urgencyHook}`,
        `Diagnosed: ${target.diagnosedProblem.substring(0, 50)}...`,
        `Flagship Cited: ${target.candidateFlagshipUsed}`,
      ],
    };

    recordApplication(record);

    return NextResponse.json({
      success: true,
      dispatch: dispatchResult,
      record,
      mailtoUrl: pitchPkg.mailtoUrl,
      message: `Strategic Diagnostic Pitch prepared for ${target.company} (${target.contactEmail}) with ${pitchPkg.recommendedCVName} attached!`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to dispatch diagnostic outreach';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
