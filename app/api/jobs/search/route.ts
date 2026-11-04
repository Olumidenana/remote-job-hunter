import { NextResponse } from 'next/server';
import { fetchRemoteJobs } from '@/lib/job-engine';
import { fetchLiveGitHubProfile, getDynamicCandidateProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [scanResult, githubStats, dynamicCandidate] = await Promise.all([
      fetchRemoteJobs(),
      fetchLiveGitHubProfile(),
      getDynamicCandidateProfile(),
    ]);

    return NextResponse.json({
      success: true,
      candidate: {
        ...dynamicCandidate,
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
