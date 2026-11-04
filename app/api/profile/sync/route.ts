import { NextRequest, NextResponse } from 'next/server';
import { getDynamicCandidateProfile, fetchLiveGitHubProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get('force') === 'true';
    const [candidate, githubStats] = await Promise.all([
      getDynamicCandidateProfile(force),
      fetchLiveGitHubProfile(),
    ]);

    return NextResponse.json({
      success: true,
      lastSync: new Date().toISOString(),
      publicRepos: githubStats.publicRepos,
      latestPushedRepo: githubStats.latestPushedRepo,
      latestPushedAt: githubStats.latestPushedAt,
      syncedProjectsCount: candidate.keyProjects.length,
      recentProjects: githubStats.recentProjects,
      candidate,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to sync GitHub profile';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
