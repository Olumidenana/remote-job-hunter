import { CandidateProfile } from '@/types/job';

export const DEFAULT_CANDIDATE: CandidateProfile = {
  name: 'Olumide Adeyemi-Nana',
  headline: 'Full-Stack Systems Engineer & FinTech Architect',
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
    'Python',
    'FastAPI',
    'PostgreSQL',
    'WebSockets',
    'Supabase',
    'Redis',
    'Three.js',
    'Docker',
    'Vercel',
    'Tailwind CSS',
    'SQL',
    'C FFI',
  ],
  specialties: [
    'Full-Stack Web Development',
    'High-Concurrency Systems & WebSockets',
    'FinTech & Escrow Split Payments',
    'ACID Row-Level Locking Database Architecture',
    'Browser-Native WebGL 3D & Canvas Pipelines',
    'Cloud Audio/Video Transcoding (FFMPEG)',
    'Algorithmic Trading & Real-Time Event Routing',
  ],
  keyProjects: [
    {
      name: 'ICT Flux',
      description: 'Algorithmic quantitative trading platform routing 73+ concurrent live WebSocket feeds with zero-lookahead event routing and C FFI bindings to MetaTrader.',
      metrics: '<100ms execution latency under severe market volatility, 73+ feeds concurrent streaming',
      tech: ['Python', 'asyncio', 'WebSockets', 'C FFI', 'MetaTrader', 'FastAPI'],
      relevanceTags: ['python', 'backend', 'websocket', 'quant', 'fintech', 'low-latency', 'concurrency', 'streaming', 'crypto', 'trading']
    },
    {
      name: 'ChopOS',
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
}> {
  try {
    const res = await fetch('https://api.github.com/users/Olumidenana/repos?sort=updated&per_page=10', {
      headers: {
        'User-Agent': 'RemoteJobHunter/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        publicRepos: 18,
        recentProjects: ['gods-eye', 'ojaja-cinemas', 'olumide-portfolio', 'chopos', 'ict-flux'],
        lastUpdated: new Date().toISOString(),
      };
    }

    const repos = await res.json();
    return {
      publicRepos: repos.length,
      recentProjects: repos.slice(0, 6).map((r: { name: string }) => r.name),
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to fetch live GitHub stats:', err);
    return {
      publicRepos: 18,
      recentProjects: ['gods-eye', 'ojaja-cinemas', 'olumide-portfolio', 'chopos', 'ict-flux'],
      lastUpdated: new Date().toISOString(),
    };
  }
}
