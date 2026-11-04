import { RemoteJob, ApplicationPackage } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';

export function generateApplicationPackage(job: RemoteJob): ApplicationPackage {
  const candidate = DEFAULT_CANDIDATE;
  const isGodsEyeFit = job.tags.some(t => /ai|ml|vision|python|fastapi|backend|data|satellite|stream|redis|timescale|quant|trading|systems|security/i.test(t)) || 
                       /ai|machine learning|python|fastapi|backend|quant|systems|data engineer|architect|trading/i.test(job.title);
  const isFrontendOr3D = job.tags.some(t => /three\.?js|webgl|frontend|ui|animation|canvas/i.test(t)) ||
                         /frontend|three\.?js|3d|ui/i.test(job.title);

  let relevantProject = candidate.keyProjects[0]; // GOD'S EYE as default Tier 1 Flagship
  if (isFrontendOr3D) {
    relevantProject = candidate.keyProjects[3]; // ToonForge
  } else if (!isGodsEyeFit) {
    relevantProject = candidate.keyProjects[2]; // ChopOS
  }

  // 1. High-Impact 3-Sentence Hook Pitch
  const hookPitch = `Hi ${job.company} Team,

I'm Olumide, a Full-Stack Systems Engineer and Sovereign Architecture Quant with a track record of architecting mission-critical platforms under strict physical and latency constraints. Recently, I engineered ${relevantProject.name} (${relevantProject.description}), achieving ${relevantProject.metrics} using ${relevantProject.tech.slice(0, 5).join(', ')}.

Your ${job.title} role immediately caught my attention because it demands the exact engineering discipline—concurrency, streaming data pipelines, and deterministic execution—that I specialize in. You can inspect my live code, GitHub repos, and production deployments here: ${candidate.portfolioUrl} (GitHub: ${candidate.githubUrl}).`;

  // 2. Full Tailored Cover Letter
  const fullCoverLetter = `Dear Hiring Team at ${job.company},

I am writing to express my strong enthusiasm for the ${job.title} position. As a Full-Stack Systems Engineer with an engineering foundation from Obafemi Awolowo University (OAU), my software architecture approach is rooted in physical systems rigor—diagnosing friction points, concurrency bottlenecks, and engineering strict fail-safes.

Over the past year, I have independently architected and shipped multiple production platforms, led by my flagship sovereign architecture:

1. ${candidate.keyProjects[0].name}: Architected an institutional sovereign intelligence platform bridging ESA Copernicus Sentinel-1/2 satellite earth observation via OpenCV (maritime vessel density & Hough Circle oil tank fill measurement), real-time SEC EDGAR token-bucket streams (9.0 req/s), Redis Streams event bus, TimescaleDB, and deterministic Two-Key Synthesis automated trade execution via MetaTrader 5 and FIX Protocol 4.4.
2. ${candidate.keyProjects[2].name}: Developed a high-velocity merchant POS & delivery operating system with automated Paystack multi-split escrow, utilizing strict PostgreSQL row-level locks (SELECT ... FOR UPDATE) to achieve 100% elimination of double-spending.
3. ${candidate.keyProjects[1].name}: Engineered an algorithmic trading platform streaming 73+ concurrent live WebSocket feeds with zero-lookahead event routing and C FFI bindings to MetaTrader, maintaining <100ms execution latency under market volatility.
4. ${candidate.keyProjects[3].name}: Built an in-browser 3D WebGL animation workspace (Three.js) coupled with a 700KB TypeScript multi-track timeline engine and distributed cloud FFMPEG queues, cutting transcoding latency by 45%.

Why I am a strong fit for ${job.company}:
- Alignment with your stack: I work daily with ${job.synergyStack.length > 0 ? job.synergyStack.join(', ') : 'Python, Next.js, TypeScript, PostgreSQL, and Redis'}.
- High shipping velocity: I don't just write code; I take complete ownership from architecture to automated testing, deployment, and sub-second performance.
- Autonomous remote execution: I operate seamlessly across global time zones, communicate proactively, and solve ambiguous problems with mathematical precision.

I am prepared to hit the ground running immediately this week and contribute directly to ${job.company}'s roadmap.

Portfolio & Shipped Work: ${candidate.portfolioUrl}
GitHub: ${candidate.githubUrl}
LinkedIn: ${candidate.linkedinUrl}
Direct: ${candidate.phone} | ${candidate.email}

Thank you for your time and consideration. I look forward to speaking with your team.

Warm regards,
${candidate.name}
${candidate.headline}`;

  // 3. Mailto URL pre-fill
  const mailSubject = encodeURIComponent(`Application: ${job.title} — Olumide Adeyemi-Nana`);
  const mailBody = encodeURIComponent(fullCoverLetter);
  const mailtoUrl = `mailto:careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com?subject=${mailSubject}&body=${mailBody}`;

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    hookPitch,
    fullCoverLetter,
    mailtoUrl,
  };
}
