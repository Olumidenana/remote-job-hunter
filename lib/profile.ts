import { CandidateProfile } from '@/types/job';

export const DEFAULT_CANDIDATE: CandidateProfile = {
  name: 'Olumide Adeyemi-Nana',
  headline: 'Full-Stack Systems Engineer & Sovereign Architecture Quant',
  email: 'olumideadeyeminana@gmail.com',
  phone: '+234 814 964 0122',
  location: 'Lagos / Osun, Nigeria (Open to Worldwide / Global Remote)',
  portfolioUrl: 'https://olumidenana.github.io/olumide-portfolio/',
  githubUrl: 'https://github.com/Olumidenana',
  linkedinUrl: 'https://www.linkedin.com/in/olumideadeyemi-nana',
  coreStack: [
    'TypeScript',
    'Next.js',
    'React',
    'Node.js',
    'Python (3.12)',
    'FastAPI',
    'PostgreSQL / TimescaleDB',
    'Redis Streams',
    'WebSockets',
    'OpenCV',
    'Three.js',
    'Supabase',
    'Docker',
    'Vercel',
    'Tailwind CSS',
    'FIX Protocol 4.4',
    'C FFI',
  ],
  specialties: [
    "GOD'S EYE Sovereign Intelligence & Satellite Earth Observation",
    'Full-Stack Systems Architecture (Next.js & FastAPI)',
    'Algorithmic Execution & FIX Protocol / MetaTrader Gateways',
    'High-Concurrency Streams (Redis Streams & 73+ Concurrent WebSockets)',
    'Computer Vision (OpenCV Maritime Density & Hough Oil Tank Fill %)',
    'FinTech & Escrow Split Payments (Paystack Multi-Split)',
    'ACID Row-Level Locking Database Engineering',
    'Browser-Native WebGL 3D & Cloud FFMPEG Transcoding',
  ],
  cvFiles: {
    fullStack: {
      name: 'Full-Stack Systems Architect CV',
      filename: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
      url: '/cv/Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    },
    quant: {
      name: 'Quant Algorithmic Engineer CV',
      filename: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
      url: '/cv/Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    },
  },
  keyProjects: [
    {
      name: "GOD'S EYE · Sovereign Intelligence & Automated Execution Platform (Tier 1 Flagship)",
      description: "Institutional-grade sovereign market intelligence platform bridging physical satellite earth observation (ESA Copernicus Sentinel-1 SAR & Sentinel-2 optical imagery via OpenCV), real-time SEC EDGAR token-bucket streams, Redis Streams event bus, TimescaleDB, and deterministic Two-Key Synthesis algorithmic trade execution via MetaTrader 5 and FIX Protocol 4.4.",
      metrics: "16/16 test suites passing (100%), token-bucket 9.0 req/s rate-limiting, Bayesian Noisy-OR resonance corroboration, Hough Circle oil tank fill measurement, <100ms algorithmic execution",
      tech: ['Python 3.12', 'FastAPI', 'Next.js 14', 'TimescaleDB', 'Redis Streams', 'OpenCV', 'ESA Copernicus API', 'SEC EDGAR', 'FIX 4.4', 'MetaTrader 5', 'Docker'],
      relevanceTags: ['ai', 'machine-learning', 'computer-vision', 'satellite', 'python', 'fastapi', 'nextjs', 'fullstack', 'timescaledb', 'postgresql', 'redis', 'quant', 'fintech', 'low-latency', 'streaming', 'data-engineering', 'systems', 'trading']
    },
    {
      name: 'ICT Flux · High-Frequency Quant Trading Engine',
      description: 'Algorithmic quantitative trading platform routing 73+ concurrent live WebSocket feeds with zero-lookahead event routing and C FFI bindings to MetaTrader terminals.',
      metrics: '<100ms execution latency under severe market volatility, 73+ feeds concurrent streaming',
      tech: ['Python', 'asyncio', 'WebSockets', 'C FFI', 'MetaTrader', 'FastAPI'],
      relevanceTags: ['python', 'backend', 'websocket', 'quant', 'fintech', 'low-latency', 'concurrency', 'streaming', 'crypto', 'trading']
    },
    {
      name: 'ChopOS · Merchant Operating System & Escrow Engine',
      description: 'Hyperlocal merchant delivery & POS operating system with automated Paystack split-payment escrow, strict PostgreSQL row-level locks, and sub-3s Kitchen Display System over WebSockets.',
      metrics: '100% elimination of double-spending via row-level locks, sub-3s order sync latency',
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Paystack API', 'WebSockets', 'Node.js', 'Tailwind CSS'],
      relevanceTags: ['fullstack', 'nextjs', 'react', 'typescript', 'postgresql', 'ecommerce', 'fintech', 'payments', 'database', 'realtime']
    },
    {
      name: 'ToonForge & Video Assembler SaaS',
      description: 'In-browser 3D WebGL animation suite using Three.js and Claude/Gemini AI APIs, plus multi-track timeline video transcoder engine with distributed cloud GCS queues.',
      metrics: '45% reduction in cloud transcoding times, 700KB TypeScript multi-track timeline engine',
      tech: ['TypeScript', 'Three.js', 'WebGL', 'FFMPEG', 'Cloud Queues', 'Google Cloud Storage', 'AI APIs'],
      relevanceTags: ['frontend', 'react', 'threejs', 'webgl', 'typescript', 'media', 'video', 'cloud', 'ai', 'saas']
    },
    {
      name: 'Motion OAU',
      description: 'Geospatial campus transit tracking network with Leaflet GPS, Supabase real-time pub/sub, and Haversine batching algorithms.',
      metrics: 'Real-time shuttle batching and active route sync for university corridors',
      tech: ['Supabase', 'Leaflet', 'TypeScript', 'Real-Time Pub/Sub', 'Geospatial'],
      relevanceTags: ['geospatial', 'supabase', 'realtime', 'fullstack', 'typescript', 'api']
    }
  ]
};

export async function fetchLiveGitHubProfile(): Promise<{
  publicRepos: number;
  recentProjects: string[];
  lastUpdated: string;
  latestPushedRepo?: string;
  latestPushedAt?: string;
}> {
  try {
    const res = await fetch('https://api.github.com/users/Olumidenana/repos?sort=pushed&per_page=15', {
      headers: {
        'User-Agent': 'RemoteJobHunter-Autonomous-Agent/2.0',
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!res.ok) {
      return {
        publicRepos: 18,
        recentProjects: ['remote-job-hunter', 'gods-eye-flux', 'gods-eye-trader', 'olumide-portfolio', 'ojaja-cinemas', 'academic-paraphraser-engine'],
        lastUpdated: new Date().toISOString(),
        latestPushedRepo: 'remote-job-hunter',
        latestPushedAt: new Date().toISOString(),
      };
    }

    const repos = await res.json();
    if (Array.isArray(repos) && repos.length > 0) {
      return {
        publicRepos: repos.length,
        recentProjects: repos.slice(0, 8).map((r: { name: string }) => r.name),
        lastUpdated: new Date().toISOString(),
        latestPushedRepo: repos[0]?.name,
        latestPushedAt: repos[0]?.pushed_at,
      };
    }
  } catch (err) {
    console.error('Failed to fetch live GitHub stats:', err);
  }

  return {
    publicRepos: 18,
    recentProjects: ['remote-job-hunter', 'gods-eye-flux', 'gods-eye-trader', 'olumide-portfolio', 'ojaja-cinemas', 'academic-paraphraser-engine'],
    lastUpdated: new Date().toISOString(),
    latestPushedRepo: 'remote-job-hunter',
    latestPushedAt: new Date().toISOString(),
  };
}

let cachedDynamicProfile: CandidateProfile | null = null;
let lastSyncTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getDynamicCandidateProfile(forceRefresh = false): Promise<CandidateProfile> {
  const now = Date.now();
  if (!forceRefresh && cachedDynamicProfile && now - lastSyncTime < CACHE_TTL_MS) {
    return cachedDynamicProfile;
  }

  try {
    const res = await fetch('https://api.github.com/users/Olumidenana/repos?sort=pushed&per_page=20', {
      headers: {
        'User-Agent': 'RemoteJobHunter-Autonomous-Agent/2.0',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      const repos = await res.json();
      if (Array.isArray(repos)) {
        const enrichedProjects = [...DEFAULT_CANDIDATE.keyProjects];
        const existingNames = new Set(enrichedProjects.map(p => p.name.toLowerCase()));

        for (const repo of repos) {
          const repoName = repo.name;
          const repoLower = repoName.toLowerCase();
          
          // Check if already represented in flagship list
          const alreadyRepresented = Array.from(existingNames).some(n => 
            n.includes(repoLower) || repoLower.includes('gods-eye') && n.includes("god's eye")
          );

          if (!alreadyRepresented && repo.language) {
            const formattedName = repoName
              .split(/[-_]/)
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            const langTech = [repo.language];
            if (repo.language === 'TypeScript' || repo.language === 'JavaScript') {
              langTech.push('Next.js', 'React', 'Tailwind CSS');
            } else if (repo.language === 'Python') {
              langTech.push('FastAPI', 'AsyncIO');
            }

            enrichedProjects.push({
              name: `${formattedName} · Shipped Project`,
              description: repo.description || `Production full-stack / systems repository open-sourced by Olumide Adeyemi-Nana on GitHub (${repo.html_url}).`,
              metrics: `Live GitHub repo with ${repo.stargazers_count ?? 0} stars, recent push: ${new Date(repo.pushed_at).toLocaleDateString()}`,
              tech: langTech,
              relevanceTags: [
                repo.language.toLowerCase(),
                ...repoName.toLowerCase().split(/[-_]/),
                'fullstack',
                'systems'
              ],
            });
          }
        }

        const candidate: CandidateProfile = {
          ...DEFAULT_CANDIDATE,
          keyProjects: enrichedProjects,
        };

        cachedDynamicProfile = candidate;
        lastSyncTime = now;
        return candidate;
      }
    }
  } catch (err) {
    console.error('Error auto-syncing GitHub projects:', err);
  }

  return DEFAULT_CANDIDATE;
}
