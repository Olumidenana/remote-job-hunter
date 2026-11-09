import { CandidateProfile } from '@/types/job';

export const DEFAULT_CANDIDATE: CandidateProfile = {
  name: 'Olumide Adeyemi-Nana',
  headline: 'Lead Systems Architect & Sovereign FinTech Engineer',
  email: 'olumideadeyeminana@gmail.com',
  phone: '+234 814 964 0122',
  location: 'Lagos / Osun, Nigeria (Open to Worldwide / Global Remote)',
  portfolioUrl: 'https://olumidenana.github.io/olumide-portfolio/',
  githubUrl: 'https://github.com/Olumidenana',
  linkedinUrl: 'https://www.linkedin.com/in/olumideadeyemi-nana',
  coreStack: [
    'Python 3.12 (asyncio, uv)',
    'TypeScript',
    'Next.js 15',
    'React 19',
    'FastAPI',
    'Node.js',
    'PostgreSQL (Row-Level Locks)',
    'TimescaleDB',
    'Redis Streams',
    'WebSockets',
    'Resend Inbound API',
    'React Email AST Linters',
    'WhatsApp Cloud API',
    'OpenCV Computer Vision',
    'Three.js WebGL',
    'Docker',
    'Vercel Edge',
    'C FFI',
    'MetaTrader 5',
    'FIX Protocol 4.4',
  ],
  specialties: [
    "GOD'S EYE Sovereign Intelligence & Satellite Earth Observation (SAR)",
    'Resend Mission Control & Autonomous Developer Telemetry Suite',
    'Multilingual WhatsApp Automotive AI Diagnostics (AutoCare AI)',
    'Full-Stack Systems Architecture (Next.js 15 & FastAPI)',
    'Algorithmic Trade Execution & FIX Protocol / MetaTrader Gateways',
    'High-Concurrency Streams (Redis Streams & 73+ Concurrent WebSockets)',
    'Computer Vision (OpenCV Maritime Density & Hough Oil Tank Fill %)',
    'FinTech & Escrow Split Payments (Paystack Multi-Split)',
    'ACID Row-Level Locking Database Engineering (SELECT ... FOR UPDATE)',
    'Browser-Native WebGL 3D & Cloud FFMPEG Transcoding',
  ],
  cvFiles: {
    fullStack: {
      name: 'Full-Stack Systems Architect CV (PDF)',
      filename: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
      url: '/cv/Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    },
    quant: {
      name: 'Quant Algorithmic Engineer CV (PDF)',
      filename: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
      url: '/cv/Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    },
    german: {
      name: 'German Systems Architect Lebenslauf (PDF)',
      filename: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
      url: '/cv/Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    },
  },
  keyProjects: [
    {
      name: "GOD'S EYE · Sovereign Intelligence & Market Execution Platform (Tier 1 Flagship)",
      description: "Institutional-grade sovereign market intelligence platform bridging physical satellite earth observation (ESA Copernicus Sentinel-1 SAR & Sentinel-2 optical imagery via OpenCV), real-time SEC EDGAR token-bucket streams, Redis Streams event bus, TimescaleDB, and deterministic Two-Key Synthesis algorithmic trade execution via MetaTrader 5 and FIX Protocol 4.4.",
      metrics: "16/16 test suites passing (100%), token-bucket 9.0 req/s rate-limiting, Bayesian Noisy-OR resonance corroboration, Hough Circle oil tank fill measurement, <100ms algorithmic execution",
      tech: ['Python 3.12', 'FastAPI', 'Next.js 14', 'TimescaleDB', 'Redis Streams', 'OpenCV', 'ESA Copernicus API', 'SEC EDGAR', 'FIX 4.4', 'MetaTrader 5', 'Docker'],
      relevanceTags: ['ai', 'machine-learning', 'computer-vision', 'satellite', 'python', 'fastapi', 'nextjs', 'fullstack', 'timescaledb', 'postgresql', 'redis', 'quant', 'fintech', 'low-latency', 'streaming', 'data-engineering', 'systems', 'trading']
    },
    {
      name: 'Resend Mission Control & Developer Ecosystem Suite',
      description: 'Autonomous developer telemetry dashboard and ecosystem companion engine for Resend. Real-time Inbound email parsing, deliverability reputation sentry, React Email cross-client AST linter, and RFC 5322 AI agent thread preservation.',
      metrics: 'Sub-second multipart MIME stream parsing, AST linter detecting Outlook VML & Gmail quirks, automated SPF/DKIM/DMARC/MX DNS diagnostics',
      tech: ['Next.js', 'TypeScript', 'React Email AST', 'Resend Inbound Webhooks', 'RFC 5322 Engine', 'Vercel Edge'],
      relevanceTags: ['resend', 'email', 'developer-tools', 'typescript', 'nextjs', 'telemetry', 'ast', 'linter', 'dns', 'infrastructure', 'fullstack', 'api']
    },
    {
      name: 'AutoCare AI · WhatsApp Master Automotive Co-Pilot',
      description: 'White-label, multilingual automotive diagnostic and customer retention platform for Nigerian car dealerships (AutoContentment) and vehicle owners. Operates via WhatsApp with zero hardware installation. Speaks English, Nigerian Pidgin, Yoruba, and Igbo.',
      metrics: 'Differential diagnostic decision trees ("Dr. House of Cars" approach), automated mapping of local slang to OBD-II DTC codes, instant spare parts dispatch',
      tech: ['Python 3.12', 'FastAPI', 'WhatsApp Cloud API', 'uv', 'Decision Trees', 'Vercel Serverless'],
      relevanceTags: ['ai', 'whatsapp', 'automotive', 'diagnostics', 'python', 'fastapi', 'multilingual', 'natural-language', 'logistics', 'mobile', 'api']
    },
    {
      name: 'Remote Job Hunter & Scam Shield',
      description: 'Autonomous remote engineering career engine and outbound apply dispatcher indexing Olumide Adeyemi-Nana\'s production track record, scanning 330+ remote feeds with scam shield heuristics and Resend Cloud API batch dispatch.',
      metrics: '330+ global feeds indexed, 100% scam interception, dynamic vector CV tailoring, 30,000 emails/month scale capacity',
      tech: ['Next.js 15', 'TypeScript', 'React 19', 'Resend API', 'Tailwind CSS', 'Vercel'],
      relevanceTags: ['fullstack', 'nextjs', 'typescript', 'resend', 'email', 'automation', 'ai', 'scraping', 'ats', 'saas']
    },
    {
      name: 'ChopOS · Merchant Operating System & Escrow Engine',
      description: 'Hyperlocal merchant delivery & POS operating system with automated Paystack split-payment escrow, strict PostgreSQL row-level locks, and sub-3s Kitchen Display System over WebSockets.',
      metrics: '100% elimination of double-spending via row-level locks (SELECT ... FOR UPDATE), sub-3s order sync latency',
      tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Paystack API', 'WebSockets', 'Node.js', 'Tailwind CSS'],
      relevanceTags: ['fullstack', 'nextjs', 'react', 'typescript', 'postgresql', 'ecommerce', 'fintech', 'payments', 'database', 'realtime', 'escrow']
    },
    {
      name: 'ICT Flux · High-Frequency Quant Trading Engine',
      description: 'Algorithmic quantitative trading platform routing 73+ concurrent live WebSocket feeds with zero-lookahead event routing and C FFI bindings to MetaTrader terminals.',
      metrics: '<100ms execution latency under severe market volatility, 73+ feeds concurrent streaming, dynamic SMC matrices',
      tech: ['Python', 'asyncio', 'WebSockets', 'C FFI', 'MetaTrader', 'FastAPI', 'PLpgSQL'],
      relevanceTags: ['python', 'backend', 'websocket', 'quant', 'fintech', 'low-latency', 'concurrency', 'streaming', 'crypto', 'trading']
    },
    {
      name: 'Ojaja Luxury Cinemas · Royal Booking Engine',
      description: 'Luxury cinema booking and seat selection platform for Ojaja Cinemas at African Village Resort and nationwide Nigerian landmarks, with real-time seat lock state, Dolby Atmos video previews, Paystack checkout, and QR turnstiles.',
      metrics: 'Real-time concurrency seat reservation, Paystack multi-channel checkout, turnstile QR boarding pass generation',
      tech: ['JavaScript', 'Tailwind CSS', 'Paystack API', 'QR Engine', 'Vercel'],
      relevanceTags: ['entertainment', 'cinema', 'booking', 'paystack', 'fintech', 'frontend', 'realtime', 'pos']
    },
    {
      name: 'Academic Paraphraser Engine & Editorial AI Engine',
      description: 'High-throughput async NLP rewriting microservice with AST citation vaults preserving Harvard/APA references with zero hallucination, paired with a real-time news CMS with live streaming ticker and dynamic layout generator.',
      metrics: 'Zero-hallucination citation guarantee, sentence burstiness scoring to strip AI cadences, zero-latency ticker updates',
      tech: ['Python 3.12', 'FastAPI', 'AST Tokenizer', 'Node.js', 'Express', 'Vercel Edge'],
      relevanceTags: ['ai', 'nlp', 'fastapi', 'python', 'citation', 'editorial', 'cms', 'paraphrasing', 'tokenizer']
    },
    {
      name: 'ToonForge & Video Assembler SaaS (AuraCut)',
      description: 'In-browser 3D WebGL animation suite using Three.js and Claude/Gemini AI APIs, plus multi-track timeline video transcoder engine with distributed cloud GCS queues and -14 LUFS audio normalization.',
      metrics: '45% reduction in cloud transcoding times, 700KB TypeScript multi-track timeline engine',
      tech: ['TypeScript', 'Three.js', 'WebGL', 'FFMPEG', 'Cloud Queues', 'Google Cloud Storage', 'AI APIs'],
      relevanceTags: ['frontend', 'react', 'threejs', 'webgl', 'typescript', 'media', 'video', 'cloud', 'ai', 'saas']
    },
    {
      name: 'Motion OAU & Enterprise ERPs',
      description: 'Geospatial campus transit tracking network with Leaflet GPS, Supabase real-time pub/sub, and Haversine batching algorithms, plus EduCore OS school ERP for The Olive Branches Schools.',
      metrics: 'Real-time shuttle batching and active route sync for university corridors, automated tuition invoicing',
      tech: ['Supabase', 'Leaflet', 'TypeScript', 'Real-Time Pub/Sub', 'Geospatial', 'Node.js'],
      relevanceTags: ['geospatial', 'supabase', 'realtime', 'fullstack', 'typescript', 'api', 'erp', 'education']
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
  const headers: Record<string, string> = {
    'User-Agent': 'RemoteJobHunter-Autonomous-Agent/2.0',
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch('https://api.github.com/users/Olumidenana/repos?sort=pushed&per_page=30', {
      headers,
      next: { revalidate: 120 }, // 2 minutes dynamic cache
    });

    if (res.ok) {
      const repos = await res.json();
      if (Array.isArray(repos) && repos.length > 0) {
        return {
          publicRepos: repos.length,
          recentProjects: repos.slice(0, 10).map((r: { name: string }) => r.name),
          lastUpdated: new Date().toISOString(),
          latestPushedRepo: repos[0]?.name,
          latestPushedAt: repos[0]?.pushed_at,
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch live GitHub stats:', err);
  }

  return {
    publicRepos: 25,
    recentProjects: [
      'resend-mission-control',
      'autocare-ai',
      'remote-job-hunter',
      'gods-eye-flux',
      'ojaja-cinemas',
      'academic-paraphraser-engine',
      'olumide-portfolio',
    ],
    lastUpdated: new Date().toISOString(),
    latestPushedRepo: 'resend-mission-control',
    latestPushedAt: new Date().toISOString(),
  };
}

let cachedDynamicProfile: CandidateProfile | null = null;
let lastSyncTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes live cache

export async function getDynamicCandidateProfile(forceRefresh = false): Promise<CandidateProfile> {
  const now = Date.now();
  if (!forceRefresh && cachedDynamicProfile && now - lastSyncTime < CACHE_TTL_MS) {
    return cachedDynamicProfile;
  }

  const headers: Record<string, string> = {
    'User-Agent': 'RemoteJobHunter-Autonomous-Agent/2.0',
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch('https://api.github.com/users/Olumidenana/repos?sort=pushed&per_page=35', {
      headers,
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const repos = await res.json();
      if (Array.isArray(repos)) {
        const enrichedProjects = [...DEFAULT_CANDIDATE.keyProjects];
        const existingIdentifiers = new Set(
          enrichedProjects.flatMap(p => [
            p.name.toLowerCase(),
            ...p.relevanceTags.map(t => t.toLowerCase())
          ])
        );

        for (const repo of repos) {
          const repoName = repo.name;
          const repoLower = repoName.toLowerCase();
          
          // Check if this repository is already known
          const isKnown = Array.from(existingIdentifiers).some(id => 
            id.includes(repoLower) || repoLower.includes(id) || (repoLower.includes('gods-eye') && id.includes("god's eye"))
          );

          if (!isKnown) {
            const formattedName = repoName
              .split(/[-_]/)
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            const langTech = repo.language ? [repo.language] : ['TypeScript'];
            if (repo.language === 'TypeScript' || repo.language === 'JavaScript') {
              langTech.push('Next.js', 'React', 'Tailwind CSS');
            } else if (repo.language === 'Python') {
              langTech.push('FastAPI', 'AsyncIO');
            }

            enrichedProjects.push({
              name: `${formattedName} · Live System`,
              description: repo.description || `Production full-stack / systems repository open-sourced by Olumide Adeyemi-Nana on GitHub (${repo.html_url}).`,
              metrics: `Auto-synced repository from GitHub. Recent push: ${new Date(repo.pushed_at).toLocaleDateString()}`,
              tech: langTech,
              relevanceTags: [
                (repo.language || 'typescript').toLowerCase(),
                ...repoName.toLowerCase().split(/[-_]/),
                'fullstack',
                'systems',
                'automation'
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
    console.error('Error auto-syncing GitHub projects in Remote Job Hunter:', err);
  }

  return DEFAULT_CANDIDATE;
}
