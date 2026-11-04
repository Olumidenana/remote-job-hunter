import { RemoteJob, ScanResult } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';
import { analyzeJobInstructions } from './instruction-reader';
import { analyzeJobSafety } from './scam-shield';
import { detectAndTranslateJob } from './translator';
import { analyzeATSMatch } from './cv-tailor';
import { fetchHackerNewsHiringJobs } from './social-feed-engine';

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
    { key: 'gods eye', name: "GOD'S EYE", points: 20, reason: "Direct synergy with GOD'S EYE sovereign intelligence & satellite CV architecture" },
    { key: 'satellite', name: 'Earth Observation / SAR', points: 18, reason: "Matches your ESA Copernicus Sentinel SAR & optical imagery pipeline" },
    { key: 'computer vision', name: 'Computer Vision', points: 15, reason: 'Aligns with your OpenCV morphological filtering & vessel detection systems' },
    { key: 'opencv', name: 'OpenCV', points: 15, reason: 'Direct match for your OpenCV satellite feature extraction algorithms' },
    { key: 'typescript', name: 'TypeScript', points: 12, reason: 'Strong match for your core language TypeScript' },
    { key: 'next.js', name: 'Next.js', points: 14, reason: 'Direct alignment with your Next.js full-stack production expertise' },
    { key: 'react', name: 'React', points: 10, reason: 'Matches modern React application architecture' },
    { key: 'python', name: 'Python', points: 14, reason: 'Leverages your Python (3.12) & FastAPI backend engineering experience' },
    { key: 'fastapi', name: 'FastAPI', points: 12, reason: 'Fits your high-performance asynchronous API services' },
    { key: 'postgresql', name: 'PostgreSQL', points: 10, reason: 'Synergy with your ACID row-level locking & database design' },
    { key: 'timescaledb', name: 'TimescaleDB', points: 14, reason: 'Matches your TimescaleDB time-series streaming database setup' },
    { key: 'redis', name: 'Redis Streams', points: 10, reason: 'Synergy with your Redis Streams decoupled event consumer groups' },
    { key: 'websocket', name: 'WebSockets', points: 12, reason: 'Exceptional match with your 73+ concurrent WebSocket feed architecture' },
    { key: 'supabase', name: 'Supabase', points: 8, reason: 'Fits your Supabase real-time pub/sub implementation' },
    { key: 'three.js', name: 'Three.js', points: 12, reason: 'Matches your WebGL 3D browser engineering track record' },
    { key: 'full stack', name: 'Full Stack', points: 12, reason: 'Core fit: End-to-end full stack systems delivery' },
    { key: 'full-stack', name: 'Full-Stack', points: 12, reason: 'Matches Full-Stack systems engineer profile' },
    { key: 'backend', name: 'Backend', points: 10, reason: 'Strong backend systems, APIs & concurrency alignment' },
    { key: 'fintech', name: 'FinTech', points: 14, reason: 'Perfect fit: Matches your payment gateway, escrow & algorithmic quant experience' },
    { key: 'trading', name: 'Trading / Quant', points: 14, reason: 'Direct synergy with your algorithmic trading platform & MT5/FIX gateways' },
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

  score = Math.min(Math.max(score, 68), 98);

  if (reasons.length === 0) {
    reasons.push('Matches modern software engineering and cloud deployment capabilities');
  }

  return { score, reasons, synergy };
}

export async function fetchRemoteJobs(): Promise<ScanResult> {
  const jobs: RemoteJob[] = [];
  const now = new Date();
  let suspiciousCount = 0;

  // 1. Fetch from Hacker News "Who is Hiring?" real-time founder thread
  try {
    const hnHiringJobs = await fetchHackerNewsHiringJobs();
    for (const h of hnHiringJobs) {
      jobs.push(h);
    }
  } catch (err) {
    console.error('Error in HN hiring fetch:', err);
  }

  // 2. Fetch from Arbeitnow API
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

        if (score >= 68 && isLocationCompatible(item.location)) {
          const publishedDate = new Date(item.created_at * 1000);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 48 * 3600 * 1000;

          const safety = analyzeJobSafety({
            title: item.title,
            company: item.company_name,
            description: cleanDesc,
            applyUrl: item.url,
            source: 'Arbeitnow',
          });

          if (safety.riskLevel === 'SUSPICIOUS_SCAM') {
            suspiciousCount++;
            continue; // Filter out suspicious scam jobs!
          }

          const instructions = analyzeJobInstructions({
            title: item.title,
            company: item.company_name,
            description: cleanDesc,
            applyUrl: item.url,
            tags: item.tags || [],
          });

          const translation = detectAndTranslateJob(item.title, cleanDesc, item.company_name);
          const atsAnalysis = analyzeATSMatch({ title: item.title, tags: item.tags || [], description: cleanDesc });

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
            description: cleanDesc.slice(0, 360) + '...',
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
            instructions,
            safety,
            translation,
            atsAnalysis,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Arbeitnow:', err);
  }

  // 3. Fetch from Jobicy API
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

        if (score >= 68 && isLocationCompatible(item.jobGeo)) {
          const publishedDate = new Date(item.pubDate);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 48 * 3600 * 1000;

          const safety = analyzeJobSafety({
            title: item.jobTitle,
            company: item.companyName,
            description: cleanDesc,
            applyUrl: item.url,
            source: 'Jobicy',
          });

          if (safety.riskLevel === 'SUSPICIOUS_SCAM') {
            suspiciousCount++;
            continue;
          }

          let salaryText: string | undefined = undefined;
          if (item.annualSalaryMin && item.annualSalaryMax) {
            salaryText = `${item.salaryCurrency || '$'}${item.annualSalaryMin.toLocaleString()} - ${item.salaryCurrency || '$'}${item.annualSalaryMax.toLocaleString()}/yr`;
          }

          const instructions = analyzeJobInstructions({
            title: item.jobTitle,
            company: item.companyName,
            description: cleanDesc,
            applyUrl: item.url,
            tags: ['Remote', 'Engineering'],
          });

          const translation = detectAndTranslateJob(item.jobTitle, cleanDesc, item.companyName);
          const atsAnalysis = analyzeATSMatch({ title: item.jobTitle, tags: ['Remote', 'Engineering'], description: cleanDesc });

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
            description: cleanDesc.slice(0, 360) + '...',
            salary: salaryText,
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
            instructions,
            safety,
            translation,
            atsAnalysis,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Jobicy:', err);
  }

  // 4. Fetch from Remotive API
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

        if (score >= 68 && isLocationCompatible(item.candidate_required_location)) {
          const publishedDate = new Date(item.publication_date);
          const isUrgent = (now.getTime() - publishedDate.getTime()) < 72 * 3600 * 1000;

          const safety = analyzeJobSafety({
            title: item.title,
            company: item.company_name,
            description: cleanDesc,
            applyUrl: item.url,
            source: 'Remotive',
          });

          if (safety.riskLevel === 'SUSPICIOUS_SCAM') {
            suspiciousCount++;
            continue;
          }

          const instructions = analyzeJobInstructions({
            title: item.title,
            company: item.company_name,
            description: cleanDesc,
            applyUrl: item.url,
            tags: item.tags || ['Remote', 'Software'],
          });

          const translation = detectAndTranslateJob(item.title, cleanDesc, item.company_name);
          const atsAnalysis = analyzeATSMatch({ title: item.title, tags: item.tags || ['Remote', 'Software'], description: cleanDesc });

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
            description: cleanDesc.slice(0, 360) + '...',
            salary: item.salary || undefined,
            publishedAt: publishedDate.toISOString(),
            matchScore: score,
            matchReasons: reasons,
            synergyStack: synergy,
            urgent: isUrgent,
            instructions,
            safety,
            translation,
            atsAnalysis,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Remotive:', err);
  }

  // Deduplicate
  const seen = new Set<string>();
  const uniqueJobs = jobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  uniqueJobs.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const highMatchCount = uniqueJobs.filter(j => j.matchScore >= 85).length;
  const urgentCount = uniqueJobs.filter(j => j.urgent).length;
  const directEmailCount = uniqueJobs.filter(j => j.instructions?.hasDirectEmail).length;
  const safeCount = uniqueJobs.filter(j => j.safety?.riskLevel === 'VERIFIED_SAFE').length;
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
      directEmailCount,
      safeCount,
      suspiciousFilteredCount: suspiciousCount,
    },
  };
}
