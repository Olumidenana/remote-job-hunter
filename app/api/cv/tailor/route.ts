import { NextRequest, NextResponse } from 'next/server';
import { RemoteJob } from '@/types/job';
import { generateTailoredCvHtml, analyzeATSMatch } from '@/lib/cv-tailor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const job: RemoteJob = await req.json();
    if (!job || !job.title || !job.company) {
      return NextResponse.json({ success: false, error: 'Invalid job data' }, { status: 400 });
    }

    const ats = analyzeATSMatch(job);
    const html = generateTailoredCvHtml(job);

    return NextResponse.json({
      success: true,
      ats,
      html,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to tailor CV';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
