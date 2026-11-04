import { NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { fetchLiveGitHubProfile, DEFAULT_CANDIDATE } from '@/lib/profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [scanResult, githubStats] = await Promise.all([
      fetchRemoteJobs(),
      fetchLiveGitHubProfile(),
    ]);

    return NextResponse.json({
      success: true,
      candidate: {
        ...DEFAULT_CANDIDATE,
        githubStats,
      },
      ...scanResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to scan remote jobs';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
