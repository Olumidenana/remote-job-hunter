import { RemoteJob, ScanResult } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  location: string;
  created_at: number;
}

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobGeo?: string;
  pubDate: string;
  annualSalaryMin?: string | number;
  annualSalaryMax?: string | number;
  salaryCurrency?: string;
  jobDescription?: string;
}

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  candidate_required_location?: string;
  tags?: string[];
  salary?: string;
  publication_date: string;
  description?: string;
}

function cleanHtml(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLocationCompatible(loc: string = ''): boolean {
  const l = loc.toLowerCase();
  if (!l || l.includes('worldwide') || l.includes('anywhere') || l.includes('global') || l.includes('remote') || l.includes('africa') || l.includes('emea') || l.includes('all') || l.includes('nigeria') || l.includes('utc') || l.includes('gmt')) {
    return true;
  }
  // If explicitly US-only or restricted to local city without remote
  if (l.includes('usa only') || l.includes('us only') || l.includes('canada only') || l.includes('germany only') || l.includes('uk only')) {
    return false;
  }
  return true;
}

function calculateMatchScore(title: string, tags: string[], description: string): {
  score: number;
  reasons: string[];
  synergy: string[];
} {
  const text = `${title} ${tags.join(' ')} ${description}`.toLowerCase();
  const reasons: string[] = [];
  const synergy: string[] = [];

  let score = 55;

  const stackChecks = [
    { key: 'typescript', name: 'TypeScript', points: 12, reason: 'Strong match for your core language TypeScript' },
    { key: 'next.js', name: 'Next.js', points: 14, reason: 'Direct alignment with your Next.js full-stack production expertise' },
    { key: 'react', name: 'React', points: 10, reason: 'Matches modern React application architecture' },
    { key: 'python', name: 'Python', points: 12, reason: 'Leverages your Python & FastAPI backend engineering experience' },
    { key: 'fastapi', name: 'FastAPI', points: 10, reason: 'Fits your high-performance asynchronous API services' },
    { key: 'postgresql', name: 'PostgreSQL', points: 10, reason: 'Synergy with your ACID row-level locking & database design' },
    { key: 'postgres', name: 'Postgres', points: 8, reason: 'Matches PostgreSQL relational data modeling' },
    { key: 'websocket', name: 'WebSockets', points: 12, reason: 'Exceptional match with your 73+ concurrent WebSocket feed architecture' },
    { key: 'supabase', name: 'Supabase', points: 8, reason: 'Fits your Supabase real-time pub/sub implementation' },
    { key: 'redis', name: 'Redis', points: 7, reason: 'Fits caching & distributed queue design' },
    { key: 'three.js', name: 'Three.js', points: 12, reason: 'Matches your WebGL 3D browser engineering track record' },
    { key: 'full stack', name: 'Full Stack', points: 12, reason: 'Core fit: End-to-end full stack systems delivery' },
    { key: 'full-stack', name: 'Full-Stack', points: 12, reason: 'Matches Full-Stack systems engineer profile' },
    { key: 'backend', name: 'Backend', points: 10, reason: 'Strong backend systems, APIs & concurrency alignment' },
    { key: 'fintech', name: 'FinTech', points: 14, reason: 'Perfect fit: Matches your payment gateway, escrow & algorithmic quant experience' },
    { key: 'trading', name: 'Trading / Quant', points: 12, reason: 'Direct synergy with your algorithmic trading platform architecture' },
    { key: 'real-time', name: 'Real-Time Systems', points: 10, reason: 'High alignment with your sub-second latency engineering' },
    { key: 'docker', name: 'Docker', points: 6, reason: 'Containerization and cloud deployment alignment' },
  ];

  for (const item of stackChecks) {
    if (text.includes(item.key)) {
      score += item.points;
      if (!synergy.includes(item.name)) synergy.push(item.name);
      if (reasons.length < 3 && !reasons.includes(item.reason)) {
        reasons.push(item.reason);
      }
    }
  }

  // Cap score between 68 and 98
  score = Math.min(Math.max(score, 68), 98);

  if (reasons.length === 0) {
    reasons.push('Matches modern software engineering and cloud deployment capabilities');
  }

  return { score, reasons, synergy };
}

export async function fetchRemoteJobs(): Promise<ScanResult> {
  const jobs: RemoteJob[] = [];
  const now = new Date();

  // 1. Fetch from Arbeitnow API
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' },
      next: { revalidate: 1800 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawList: ArbeitnowJob[] = data.data || [];

      for (const item of rawList.slice(0, 80)) {
        if (!item.remote) continue;
        const cleanDesc = cleanHtml(item.description);
        const { score, reasons, synergy } = calculateMatchScore(item.title, item.tags || [], cleanDesc);

        // Only include engineering / developer roles with a solid match
        if (score >= 70 && isLocationCompatible(item.location)) {
          const publishedDate = new Date(item.created_at * 1000);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 48 * 3600 * 1000;

          jobs.push({
            id: `arbeitnow-${item.slug}`,
            title: item.title,
            company: item.company_name,
            location: item.location || 'Remote (Worldwide / EMEA)',
            isWorldwide: isLocationCompatible(item.location),
            url: item.url,
            applyUrl: item.url,
            source: 'Arbeitnow',
            tags: item.tags || ['Remote', 'Developer'],
            description: cleanDesc.slice(0, 320) + '...',
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Arbeitnow:', err);
  }

  // 2. Fetch from Jobicy API
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=40', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' },
      next: { revalidate: 1800 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawList: JobicyJob[] = data.jobs || [];

      for (const item of rawList) {
        const cleanDesc = cleanHtml(item.jobDescription || '');
        const { score, reasons, synergy } = calculateMatchScore(item.jobTitle, [], cleanDesc);

        if (score >= 70 && isLocationCompatible(item.jobGeo)) {
          const publishedDate = new Date(item.pubDate);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 48 * 3600 * 1000;

          let salaryText: string | undefined = undefined;
          if (item.annualSalaryMin && item.annualSalaryMax) {
            salaryText = `${item.salaryCurrency || '$'}${item.annualSalaryMin.toLocaleString()} - ${item.salaryCurrency || '$'}${item.annualSalaryMax.toLocaleString()}/yr`;
          }

          jobs.push({
            id: `jobicy-${item.id}`,
            title: item.jobTitle,
            company: item.companyName,
            companyLogo: item.companyLogo,
            location: item.jobGeo || 'Remote (Worldwide)',
            isWorldwide: isLocationCompatible(item.jobGeo),
            url: item.url,
            applyUrl: item.url,
            source: 'Jobicy',
            tags: ['Remote', 'Engineering'],
            description: cleanDesc.slice(0, 320) + '...',
            salary: salaryText,
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Jobicy:', err);
  }

  // 3. Fetch from Remotive API
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=30', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' },
      next: { revalidate: 1800 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawList: RemotiveJob[] = data.jobs || [];

      for (const item of rawList) {
        const cleanDesc = cleanHtml(item.description || '');
        const { score, reasons, synergy } = calculateMatchScore(item.title, item.tags || [], cleanDesc);

        if (score >= 70 && isLocationCompatible(item.candidate_required_location)) {
          const publishedDate = new Date(item.publication_date);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 72 * 3600 * 1000;

          jobs.push({
            id: `remotive-${item.id}`,
            title: item.title,
            company: item.company_name,
            companyLogo: item.company_logo,
            location: item.candidate_required_location || 'Worldwide Remote',
            isWorldwide: isLocationCompatible(item.candidate_required_location),
            url: item.url,
            applyUrl: item.url,
            source: 'Remotive',
            tags: item.tags || ['Remote', 'Software'],
            description: cleanDesc.slice(0, 320) + '...',
            salary: item.salary || undefined,
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Remotive:', err);
  }

  // Deduplicate by normalized title + company
  const seen = new Set<string>();
  const uniqueJobs = jobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by matchScore descending, then by urgent/recent
  uniqueJobs.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const highMatchCount = uniqueJobs.filter(j => j.matchScore >= 85).length;
  const urgentCount = uniqueJobs.filter(j => j.urgent).length;
  const averageScore = uniqueJobs.length > 0 
    ? Math.round(uniqueJobs.reduce((acc, j) => acc + j.matchScore, 0) / uniqueJobs.length)
    : 0;

  return {
    timestamp: now.toISOString(),
    totalScanned: uniqueJobs.length,
    matchedJobs: uniqueJobs,
    stats: {
      urgentCount,
      highMatchCount,
      averageScore,
    },
  };
}
