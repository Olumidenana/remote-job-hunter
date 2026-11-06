import { RemoteJob, ApplicationPackage } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';
import { analyzeJobInstructions } from './instruction-reader';

interface ProjectMatch {
  name: string;
  description: string;
  metrics: string;
  tech: string[];
  score: number;
}

/**
 * Determines the most credible and authentic candidate headline based on the job's domain
 */
function resolveRolePersona(job: RemoteJob): {
  personaTitle: string;
  coreDiscipline: string;
  fitHook: string;
} {
  const text = `${job.title} ${job.tags.join(' ')} ${job.synergyStack.join(' ')} ${job.description}`.toLowerCase();

  if (text.includes('quant') || text.includes('trading') || text.includes('hft') || text.includes('arbitrage') || text.includes('financial engineer')) {
    return {
      personaTitle: 'Quantitative Systems & Low-Latency Engineer',
      coreDiscipline: 'deterministic market event routing, streaming WebSocket concurrency, and sub-100ms execution',
      fitHook: 'low-latency event processing, zero-lookahead order execution, and deterministic memory safety',
    };
  }

  if (text.includes('frontend') || text.includes('ui') || text.includes('react') || text.includes('web engineer')) {
    return {
      personaTitle: 'Senior Full-Stack & Frontend Systems Engineer',
      coreDiscipline: 'high-performance web architecture, type-safe Next.js platforms, and sub-second UI responsiveness',
      fitHook: 'fluid state architecture, modern React 19/Next.js idioms, and clean product execution',
    };
  }

  if (text.includes('fintech') || text.includes('payment') || text.includes('escrow') || text.includes('billing') || text.includes('ledger') || text.includes('banking')) {
    return {
      personaTitle: 'FinTech Systems & Escrow Infrastructure Engineer',
      coreDiscipline: 'ACID transactional integrity, PostgreSQL row-level locking, and high-velocity payment reconciliation',
      fitHook: 'zero-balance discrepancy architectures, row-level concurrency locks, and resilient payment gateway integrations',
    };
  }

  if (text.includes('ai') || text.includes('machine learning') || text.includes('ml') || text.includes('vision') || text.includes('nlp') || text.includes('llm') || text.includes('python')) {
    return {
      personaTitle: 'AI Systems & Applied Machine Learning Engineer',
      coreDiscipline: 'real-time asynchronous Python pipelines, computer vision analysis, and domain-specific AI copilots',
      fitHook: 'production-tested AI workflows, low-latency async services, and clean telemetry instrumentation',
    };
  }

  if (text.includes('devops') || text.includes('infrastructure') || text.includes('cloud') || text.includes('sre') || text.includes('distributed')) {
    return {
      personaTitle: 'Distributed Systems & Cloud Infrastructure Architect',
      coreDiscipline: 'high-throughput event streaming, containerized orchestration, and sub-second fail-safe operations',
      fitHook: 'fault-tolerant microservices, event-driven pipelines, and observable production reliability',
    };
  }

  // General Software / Full-Stack default
  return {
    personaTitle: 'Full-Stack Systems Engineer & Software Architect',
    coreDiscipline: 'end-to-end platform architecture, type-safe distributed APIs, and resilient data backends',
    fitHook: 'rapid shipping velocity, clean architectural patterns, and autonomous end-to-end execution',
  };
}

/**
 * Intelligently scores and ranks all candidate projects to pick the top 2-3 most relevant systems
 */
function selectTopMatchedProjects(job: RemoteJob, candidate: typeof DEFAULT_CANDIDATE): ProjectMatch[] {
  const jobContext = `${job.title} ${job.tags.join(' ')} ${job.synergyStack.join(' ')} ${job.description}`.toLowerCase();

  const scored: ProjectMatch[] = candidate.keyProjects.map(proj => {
    let score = 0;

    // Check tech overlap (heavily weighted: +3 each)
    for (const tech of proj.tech) {
      const tNorm = tech.toLowerCase();
      if (jobContext.includes(tNorm)) {
        score += 3;
      }
    }

    // Check relevance tags (+2 each)
    for (const tag of proj.relevanceTags) {
      const tagNorm = tag.toLowerCase();
      if (jobContext.includes(tagNorm)) {
        score += 2;
      }
    }

    // Contextual boost if title contains matching domain
    if (jobContext.includes('resend') || jobContext.includes('email') || jobContext.includes('telemetry') || jobContext.includes('developer tool')) {
      if (proj.name.includes('Resend Mission Control')) score += 8;
    }
    if (jobContext.includes('payment') || jobContext.includes('pos') || jobContext.includes('escrow') || jobContext.includes('commerce') || jobContext.includes('postgres')) {
      if (proj.name.includes('ChopOS')) score += 8;
    }
    if (jobContext.includes('car') || jobContext.includes('auto') || jobContext.includes('whatsapp') || jobContext.includes('chat') || jobContext.includes('bot')) {
      if (proj.name.includes('AutoCare AI')) score += 8;
    }
    if (jobContext.includes('trading') || jobContext.includes('quant') || jobContext.includes('finance') || jobContext.includes('market') || jobContext.includes('crypto')) {
      if (proj.name.includes('ICT Flux') || proj.name.includes("GOD'S EYE")) score += 8;
    }
    if (jobContext.includes('booking') || jobContext.includes('appointment') || jobContext.includes('calendar') || jobContext.includes('schedule')) {
      if (proj.name.includes('Biz Booking') || proj.name.includes('Beauty Salon')) score += 8;
    }
    if (jobContext.includes('video') || jobContext.includes('3d') || jobContext.includes('media') || jobContext.includes('three.js') || jobContext.includes('ffmpeg')) {
      if (proj.name.includes('Video Assembler')) score += 8;
    }
    if (jobContext.includes('satellite') || jobContext.includes('geospatial') || jobContext.includes('opencv') || jobContext.includes('vision') || jobContext.includes('timescale')) {
      if (proj.name.includes("GOD'S EYE")) score += 8;
    }
    if (jobContext.includes('content') || jobContext.includes('editor') || jobContext.includes('nlp') || jobContext.includes('text') || jobContext.includes('writing')) {
      if (proj.name.includes('Editorial AI') || proj.name.includes('Academic Paraphraser')) score += 8;
    }

    return {
      name: proj.name,
      description: proj.description,
      metrics: proj.metrics,
      tech: proj.tech,
      score,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 2 distinct projects (minimum fallback to top projects)
  return scored.slice(0, 2);
}

export function generateApplicationPackage(
  job: RemoteJob,
  customCandidate?: typeof DEFAULT_CANDIDATE
): ApplicationPackage {
  const candidate = customCandidate || DEFAULT_CANDIDATE;
  const instructions = job.instructions || analyzeJobInstructions(job);

  // 1. Resolve role persona and intelligently match top 2 relevant systems
  const persona = resolveRolePersona(job);
  const matchedProjects = selectTopMatchedProjects(job, candidate);
  const primaryProject = matchedProjects[0];
  const secondaryProject = matchedProjects[1];

  // 2. Custom subject line formatting
  let subject = `Application: ${job.title} — ${candidate.name}`;
  if (instructions.customSubject) {
    subject = instructions.customSubject
      .replace(/\[name\]/gi, candidate.name)
      .replace(/\[your name\]/gi, candidate.name)
      .replace(/\[role\]/gi, job.title)
      .replace(/\[position\]/gi, job.title);
  }

  // 3. High-Impact, Role-Tailored Hook Pitch (3-4 sentences, authentic, non-generic)
  const codewordNote = instructions.secretCodeWords.length > 0 
    ? `[Required Reference: ${instructions.secretCodeWords.join(', ')}]\n\n` 
    : '';

  const hookPitch = `${codewordNote}Hi ${job.company} Team,

I'm Olumide, a ${persona.personaTitle} with a track record of architecting and shipping production platforms under strict real-world constraints. Most recently, I engineered ${primaryProject.name} (${primaryProject.description}), achieving ${primaryProject.metrics} using ${primaryProject.tech.slice(0, 5).join(', ')}.

Your ${job.title} opening stands out because it directly requires the engineering rigor—${persona.fitHook}—that I specialize in. You can inspect my live production systems and code here: ${candidate.portfolioUrl} (GitHub: ${candidate.githubUrl}). Attached is my tailored ${instructions.recommendedCV === 'Quant' ? candidate.cvFiles.quant.name : candidate.cvFiles.fullStack.name}.`;

  // 4. Specific Requirement Answers if detected in listing
  let explicitAnswersSection = '';
  if (instructions.requiredAnswers.length > 0) {
    explicitAnswersSection = `\nAnswers to Your Specific Requirements & Questions:\n` +
      instructions.requiredAnswers.map(a => `• ${a.question}: ${a.answer}`).join('\n') +
      '\n';
  }

  const cvName = instructions.recommendedCV === 'Quant' ? candidate.cvFiles.quant.name : candidate.cvFiles.fullStack.name;
  const cvFile = instructions.recommendedCVFile;
  const appDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://olumidenana.github.io/olumide-portfolio';

  // 5. Highly Tailored Cover Letter Featuring the 2 Exact Best Matched Production Systems
  const techStackList = job.synergyStack.length > 0
    ? job.synergyStack.join(', ')
    : primaryProject.tech.slice(0, 4).join(', ');

  const fullCoverLetter = `${codewordNote}Dear Hiring Team at ${job.company},

I am writing to express my strong enthusiasm for the ${job.title} position. As a ${persona.personaTitle} with an engineering foundation from Obafemi Awolowo University (OAU), my software architecture approach focuses on diagnosing system friction points, concurrency bottlenecks, and engineering strict fail-safes.
${explicitAnswersSection}
Rather than talking in theoretical concepts, I take pride in shipping verified, battle-tested software. Over the past year, I have independently architected and shipped 20+ production systems. Two projects that demonstrate immediate technical synergy with ${job.company}'s roadmap are:

1. ${primaryProject.name}
• Focus & Architecture: ${primaryProject.description}
• Production Impact & Metrics: ${primaryProject.metrics}
• Technologies: ${primaryProject.tech.join(', ')}

2. ${secondaryProject ? secondaryProject.name : 'ChopOS Merchant Operating System'}
• Focus & Architecture: ${secondaryProject ? secondaryProject.description : 'High-concurrency merchant operating system with automated Paystack multi-split escrow routing.'}
• Production Impact & Metrics: ${secondaryProject ? secondaryProject.metrics : '100% elimination of double-spending via row-level locks (SELECT ... FOR UPDATE).'}
• Technologies: ${secondaryProject ? secondaryProject.tech.join(', ') : 'Next.js, TypeScript, PostgreSQL, WebSockets'}

Why I am an immediate, high-leverage fit for ${job.company}:
• Direct Stack Alignment: I work daily with ${techStackList}, writing clean, maintainable, and type-safe code.
• Proven Engineering Velocity: I take complete ownership from architecture to automated unit testing, deployment, and sub-second performance tuning.
• Autonomous Remote Execution: I operate comfortably across global time zones, communicate with concise clarity, and execute autonomously without requiring constant hand-holding.

Attached to this email is my updated ${cvName} (${cvFile}). You can also inspect it online directly at:
${appDomain}/cv/${cvFile}

You can explore my full production portfolio with live interactive demos at ${candidate.portfolioUrl} and review my open-source codebases at ${candidate.githubUrl}.

I am available to start immediately and look forward to discussing how my experience can contribute directly to ${job.company}'s engineering objectives.

Warm regards,
${candidate.name}
${candidate.headline}
Email: ${candidate.email} | Phone: ${candidate.phone}
Portfolio: ${candidate.portfolioUrl}
GitHub: ${candidate.githubUrl}
LinkedIn: ${candidate.linkedinUrl}`;

  // Recipient email
  const recipient = instructions.recipientEmail || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  // Pre-filled mailto URL
  const mailSubject = encodeURIComponent(subject);
  const mailBody = encodeURIComponent(fullCoverLetter);
  const mailtoUrl = `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    recipientEmail: recipient,
    subject,
    hookPitch,
    fullCoverLetter,
    mailtoUrl,
    recommendedCVFile: cvFile,
    recommendedCVName: cvName,
    instructions,
  };
}
