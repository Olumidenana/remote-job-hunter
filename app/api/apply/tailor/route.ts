import { NextRequest, NextResponse } from 'next/server';
import { generateApplicationPackage } from '@/lib/pitch-generator';
import { RemoteJob } from '@/types/job';

export async function POST(req: NextRequest) {
  try {
    const job: RemoteJob = await req.json();
    if (!job || !job.title || !job.company) {
      return NextResponse.json({ success: false, error: 'Invalid job data' }, { status: 400 });
    }

    const applicationPackage = generateApplicationPackage(job);

    return NextResponse.json({
      success: true,
      package: applicationPackage,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to generate tailored application';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
