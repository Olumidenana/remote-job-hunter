import { RemoteJob } from '@/types/job';
import { analyzeJobInstructions } from './instruction-reader';
import { analyzeJobSafety } from './scam-shield';
import { detectAndTranslateJob } from './translator';
import { analyzeATSMatch } from './cv-tailor';

export interface SocialSearchVector {
  platform: 'X / Twitter' | 'LinkedIn' | 'Y Combinator' | 'Wellfound' | 'GitHub Discussions';
  title: string;
  query: string;
  searchUrl: string;
  description: string;
}

export function getSocialSearchVectors(): SocialSearchVector[] {
  return [
    {
      platform: 'X / Twitter',
      title: 'Founders Hiring Remote Engineers Right Now',
      query: '"we are hiring" OR "looking for an engineer" ("full stack" OR "python" OR "quant" OR "nextjs") "remote"',
      searchUrl: 'https://x.com/search?q=%22we%20are%20hiring%22%20OR%20%22looking%20for%20an%20engineer%22%20(%22full%20stack%22%20OR%20%22python%22%20OR%20%22quant%22%20OR%20%22nextjs%22)%20%22remote%22&f=live',
      description: 'Real-time live posts by founders, CTOs and tech leads hiring directly via DM or email on X.',
    },
    {
      platform: 'LinkedIn',
      title: 'Worldwide Remote Software Engineering Postings',
      query: 'Full Stack Engineer Remote Worldwide',
      searchUrl: 'https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Systems%20Engineer&f_WT=2&sortBy=DD',
      description: 'Past 24-hour worldwide remote engineering postings on LinkedIn with quick apply.',
    },
    {
      platform: 'Y Combinator',
      title: 'YC Funded Startups Hiring Remote Engineers',
      query: 'Roles: Engineering · Remote: Yes',
      searchUrl: 'https://www.workatastartup.com/jobs?roles=eng&remote=true',
      description: 'Direct access to Y Combinator batch founders actively building high-growth tech teams.',
    },
    {
      platform: 'Wellfound',
      title: 'Seed & Series-A Tech Startups Hiring Globally',
      query: 'Software Engineer Remote Worldwide',
      searchUrl: 'https://wellfound.com/jobs?role=Software%20Engineer&remote=true',
      description: 'Startup ecosystem connecting engineers directly with hiring managers.',
    },
  ];
}

export async function fetchHackerNewsHiringJobs(): Promise<RemoteJob[]> {
  const jobs: RemoteJob[] = [];
  try {
    // 1. Find latest "Ask HN: Who is hiring?" story
    const storyRes = await fetch(
      'https://hn.algolia.com/api/v1/search_by_date?query=%22Ask%20HN:%20Who%20is%20hiring%22&tags=story&hitsPerPage=1',
      { next: { revalidate: 3600 } }
    );
    if (!storyRes.ok) return jobs;
    const storyData = await storyRes.json();
    const storyId = storyData.hits?.[0]?.objectID;
    if (!storyId) return jobs;

    // 2. Fetch comments from this hiring thread
    const commentsRes = await fetch(
      `https://hn.algolia.com/api/v1/search_by_date?tags=comment,story_${storyId}&hitsPerPage=50`,
      { next: { revalidate: 1800 } }
    );
    if (!commentsRes.ok) return jobs;
    const commentsData = await commentsRes.json();
    const comments = commentsData.hits || [];

    for (const c of comments) {
      const rawText = c.comment_text || '';
      // HN comments typically start with "Company | Role | Location | Remote"
      const clean = rawText
        .replace(/<p>/g, '\n\n')
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim();

      const lines = clean.split('\n').filter((l: string) => l.trim().length > 0);
      if (lines.length === 0) continue;

      const firstLine = lines[0];
      const lower = clean.toLowerCase();

      // Must be remote and related to engineering / software
      if (!lower.includes('remote')) continue;
      if (!lower.includes('engineer') && !lower.includes('developer') && !lower.includes('full-stack') && !lower.includes('python')) continue;

      const parts = firstLine.split('|').map((p: string) => p.trim());
      const company = parts[0] || 'Tech Startup (HN)';
      const title = parts[1] || 'Software Engineer';
      const location = parts[2] || 'Remote (Worldwide)';

      const instructions = analyzeJobInstructions({
        title,
        company,
        description: clean,
        applyUrl: `https://news.ycombinator.com/item?id=${c.objectID}`,
        tags: ['HackerNews', 'Remote', 'Engineering'],
      });

      const safety = analyzeJobSafety({
        title,
        company,
        description: clean,
        applyUrl: `https://news.ycombinator.com/item?id=${c.objectID}`,
        source: 'HackerNews',
      });

      const translation = detectAndTranslateJob(title, clean, company);
      const atsAnalysis = analyzeATSMatch({ title, tags: ['Python', 'TypeScript', 'Remote'], description: clean });

      jobs.push({
        id: `hn-${c.objectID}`,
        title,
        company,
        location,
        isWorldwide: true,
        url: `https://news.ycombinator.com/item?id=${c.objectID}`,
        applyUrl: instructions.recipientEmail ? `mailto:${instructions.recipientEmail}` : `https://news.ycombinator.com/item?id=${c.objectID}`,
        source: 'HackerNews',
        tags: ['HackerNews', 'Direct Founder', 'Remote'],
        description: clean.slice(0, 360) + '...',
        publishedAt: c.created_at || new Date().toISOString(),
        matchScore: 88,
        matchReasons: ['Direct founder post from Ask HN: Who is Hiring thread', 'Direct email hiring contact'],
        synergyStack: ['Full-Stack', 'Systems', 'Python', 'TypeScript'],
        urgent: true,
        instructions,
        safety,
        translation,
        atsAnalysis,
      });
    }
  } catch (err) {
    console.error('Failed to fetch Hacker News hiring jobs:', err);
  }
  return jobs;
}
