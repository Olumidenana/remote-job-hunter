import { NextRequest, NextResponse } from 'next/server';
import { RemoteJob } from '@/types/job';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { sendApplicationOnBehalf } from '@/lib/outbound-mailer';
import { recordApplication } from '@/lib/tracker';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { job, overrideRecipient }: { job: RemoteJob; overrideRecipient?: string } = await req.json();

    if (!job || !job.title || !job.company) {
      return NextResponse.json(
        { success: false, error: 'Invalid job data provided' },
        { status: 400 }
      );
    }

    const pkg = generateApplicationPackage(job);
    const dispatchResult = await sendApplicationOnBehalf(job, pkg, overrideRecipient);

    const record = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      jobId: job.id,
      company: job.company,
      jobTitle: job.title,
      recipientEmail: dispatchResult.recipient,
      subject: dispatchResult.subject,
      status: (dispatchResult.mode === 'LIVE_DISPATCH' ? 'SENT' : 'QUEUED') as 'SENT' | 'QUEUED',
      sentAt: new Date().toISOString(),
      cvAttached: dispatchResult.cvAttached,
      complianceNotes: dispatchResult.instructionsApplied,
    };

    recordApplication(record);

    return NextResponse.json({
      success: true,
      dispatch: dispatchResult,
      record,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to dispatch application email';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
