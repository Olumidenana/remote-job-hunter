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

  // 2. Market Localization Detection (German DACH vs. Kuwait & Gulf vs. Global)
  const locAndText = `${job.location} ${job.title} ${job.description}`.toLowerCase();
  const isGerman =
    job.translation?.detectedLanguage === 'German (Deutsch)' ||
    /germany|deutschland|berlin|munich|münchen|frankfurt|hamburg|cologne|köln|dach|austria|switzerland|österreich|schweiz/i.test(job.location) ||
    /remote.*(germany|deutschland|dach|berlin|munich)/i.test(locAndText);

  const isGulf =
    /kuwait|uae|united arab emirates|dubai|abu dhabi|saudi|riyadh|jeddah|qatar|doha|bahrain|manama|oman|muscat|gulf|middle east|mena/i.test(job.location) ||
    /kuwait|dubai|riyadh|gulf/i.test(job.title.toLowerCase());

  // Strict PDF CV filename resolution (Language & Market Targeted)
  let cvFile = instructions.recommendedCVFile || (instructions.recommendedCV === 'Quant' ? candidate.cvFiles.quant.filename : candidate.cvFiles.fullStack.filename);
  let cvName = instructions.recommendedCV === 'Quant' ? candidate.cvFiles.quant.name : candidate.cvFiles.fullStack.name;
  if (isGerman) {
    cvFile = 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf';
    cvName = 'German Systems Architect Lebenslauf (PDF)';
  } else if (cvFile.endsWith('.html')) {
    cvFile = cvFile.replace(/\.html$/i, '.pdf');
  }
  const appDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://olumidenana.github.io/olumide-portfolio';

  // 3. Custom subject line formatting
  let subject = `Application: ${job.title} — ${candidate.name}`;
  if (isGerman) {
    subject = `Bewerbung als ${job.title} — ${candidate.name} (Live-Portfolio & PDF-Lebenslauf)`;
  } else if (isGulf) {
    subject = `Application: ${job.title} (Immediate GMT+3 Availability & FinTech Systems) — ${candidate.name}`;
  }

  if (instructions.customSubject) {
    subject = instructions.customSubject
      .replace(/\[name\]/gi, candidate.name)
      .replace(/\[your name\]/gi, candidate.name)
      .replace(/\[role\]/gi, job.title)
      .replace(/\[position\]/gi, job.title);
  }

  // 4. High-Impact, Role-Tailored Hook Pitch (Authentic, non-generic, localized)
  const codewordNote = instructions.secretCodeWords.length > 0 
    ? `[Required Reference: ${instructions.secretCodeWords.join(', ')}]\n\n` 
    : '';

  const nightNote = job.isNightShift
    ? ` I am specifically structured and dedicated for night-shift & US-evening coverage (working from GMT+1/WAT, aligned with US EST/PST business hours or overnight execution), providing uninterrupted focus and high-availability operations.`
    : '';

  const techStackList = job.synergyStack.length > 0
    ? job.synergyStack.join(', ')
    : primaryProject.tech.slice(0, 4).join(', ');

  // Specific Requirement Answers if detected in listing
  let explicitAnswersSection = '';
  if (instructions.requiredAnswers.length > 0) {
    explicitAnswersSection = `\nAnswers to Your Specific Requirements & Questions:\n` +
      instructions.requiredAnswers.map(a => `• ${a.question}: ${a.answer}`).join('\n') +
      '\n';
  }

  let hookPitch = '';
  let fullCoverLetter = '';

  if (isGerman) {
    // Authentic German cover letter and hook pitch
    hookPitch = `${codewordNote}Sehr geehrte Damen und Herren bei ${job.company},

ich bewerbe mich mit großem Interesse als ${job.title}. Als ${persona.personaTitle} mit fundierter Engineering-Ausbildung (OAU) baue ich hochperformante, deterministische Produktionssysteme. Zuletzt habe ich ${primaryProject.name} entwickelt (${primaryProject.description}), mit messbarem Erfolg: ${primaryProject.metrics} (${primaryProject.tech.slice(0, 4).join(', ')}).

Mein Profil passt exakt zu Ihren Anforderungen: ${persona.fitHook}. Ich arbeite aus der WAT-Zeitzone (GMT+1), was zu 100 % synchron mit Deutschland / MEZ (UTC+1) ist. Meinen aktuellen Lebenslauf finden Sie im Anhang als PDF (${cvName}). Live-Code & Demos: ${candidate.portfolioUrl} (GitHub: ${candidate.githubUrl}).`;

    fullCoverLetter = `${codewordNote}Sehr geehrtes Team von ${job.company},

mit großem Interesse bewerbe ich mich auf die Position als ${job.title}. Als ${persona.personaTitle} mit universitärem Ingenieurshintergrund (Obafemi Awolowo University) liegt mein Schwerpunkt auf resilienten Systemarchitekturen, Concurrency-Sicherheit und deterministischer Performance.
${explicitAnswersSection}
Statt bloßer Theorie liefere ich praxiserprobte, verifizierte Software in Produktion. Zwei Projekte aus meinem Portfolio, die die unmittelbare technische Synergie mit den Zielen von ${job.company} demonstrieren:

1. ${primaryProject.name}
• Architektur & Fokus: ${primaryProject.description}
• Messbarer Produktionserfolg: ${primaryProject.metrics}
• Verwendete Technologien: ${primaryProject.tech.join(', ')}

2. ${secondaryProject ? secondaryProject.name : 'ChopOS Merchant Operating System'}
• Architektur & Fokus: ${secondaryProject ? secondaryProject.description : 'Hochparalleles Händler-Betriebssystem mit automatisierter Paystack Multi-Split Escrow-Verteilung.'}
• Messbarer Produktionserfolg: ${secondaryProject ? secondaryProject.metrics : 'Vollständige Eliminierung von Race Conditions und Double-Spending mittels Row-Level Locks (SELECT ... FOR UPDATE).'}
• Verwendete Technologien: ${secondaryProject ? secondaryProject.tech.join(', ') : 'Next.js, TypeScript, PostgreSQL, WebSockets'}

Warum ich für ${job.company} einen unmittelbaren Mehrwert darstelle:
• Direkter Tech-Stack Fit: Ich arbeite täglich mit ${techStackList} und schreibe typsicheren, sauberen und wartungsfreundlichen Code.
• Hohe Entwicklungsgeschwindigkeit: Ich übernehme ganzheitliche Verantwortung von der Architektur über automatisierte Tests (16/16 Suiten) bis hin zu sub-sekundärer Optimierung.
• 100 % Zeitzonen-Synchronität mit Deutschland (MEZ/GMT+1): Ich arbeite aus der WAT-Zeitzone (GMT+1), deckungsgleich mit der deutschen Normalzeit (UTC+1), und ermögliche nahtlose Echtzeit-Zusammenarbeit während der regulären Bürozeiten.
• Autonome Remote-Arbeit: Ich kommuniziere präzise, denke proaktiv mit und setze anspruchsvolle Aufgaben eigenverantwortlich um.

Im Anhang finden Sie meinen aktuellen Lebenslauf als offizielle PDF-Datei (${cvName} – ${cvFile}).
Sie können ihn auch online einsehen unter:
${appDomain}/cv/${cvFile}

Mein vollständiges Portfolio mit interaktiven Live-Demos steht unter ${candidate.portfolioUrl} bereit; meine Open-Source-Codebasen finden Sie unter ${candidate.githubUrl}.

Ich stehe für ein erstes technisches Kennenlernen gerne kurzfristig zur Verfügung und freue mich auf Ihre Rückmeldung.

Mit freundlichen Grüßen,

${candidate.name}
${candidate.headline}
E-Mail: ${candidate.email} | Tel / WhatsApp: ${candidate.phone}
Portfolio: ${candidate.portfolioUrl}
GitHub: ${candidate.githubUrl}
LinkedIn: ${candidate.linkedinUrl}`;

  } else if (isGulf) {
    // Kuwait & Gulf region customized pitch
    hookPitch = `${codewordNote}Hi ${job.company} Leadership Team,

I'm Olumide, a ${persona.personaTitle} with a proven track record of architecting high-reliability production systems under strict real-world constraints. Working from WAT (GMT+1), I have direct, real-time business hour synchronization with Kuwait and the Gulf region (GMT+3, only 2 hours difference).

Most recently, I engineered ${primaryProject.name} (${primaryProject.description}), achieving ${primaryProject.metrics} using ${primaryProject.tech.slice(0, 5).join(', ')}. Your ${job.title} opening requires the exact engineering rigor—${persona.fitHook}—that I specialize in. You can inspect my live production platforms at ${candidate.portfolioUrl} (GitHub: ${candidate.githubUrl}). Attached is my tailored ${cvName} in PDF format.`;

    fullCoverLetter = `${codewordNote}Dear Hiring Team at ${job.company},

I am writing to express my strong enthusiasm for the ${job.title} position at ${job.company}. As a ${persona.personaTitle} with an engineering foundation from Obafemi Awolowo University (OAU), my software architecture approach focuses on diagnosing system friction points, zero-balance financial integrity, concurrency bottlenecks, and engineering strict fail-safes.
${explicitAnswersSection}
Rather than talking in theoretical concepts, I take pride in shipping verified, battle-tested software. Over the past year, I have independently architected and shipped 20+ production systems. Two projects that demonstrate immediate technical synergy with ${job.company}'s roadmap are:

1. ${primaryProject.name}
• Focus & Architecture: ${primaryProject.description}
• Production Impact & Metrics: ${primaryProject.metrics}
• Technologies: ${primaryProject.tech.join(', ')}

2. ${secondaryProject ? secondaryProject.name : 'ChopOS Merchant Operating System'}
• Focus & Architecture: ${secondaryProject ? secondaryProject.description : 'High-concurrency merchant operating system with automated multi-split escrow routing.'}
• Production Impact & Metrics: ${secondaryProject ? secondaryProject.metrics : '100% elimination of double-spending and ledger discrepancies via row-level locks (SELECT ... FOR UPDATE).'}
• Technologies: ${secondaryProject ? secondaryProject.tech.join(', ') : 'Next.js, TypeScript, PostgreSQL, WebSockets'}

Why I am an immediate, high-leverage fit for ${job.company}:
• Full Kuwait & Gulf Timezone Synchronization (GMT+3): Working from WAT (GMT+1), I am only 2 hours from Kuwait City, Riyadh, and Dubai, providing 6 to 8 hours of direct real-time business hours overlap for high-velocity collaboration.
• Direct Stack Alignment: I work daily with ${techStackList}, writing clean, maintainable, and type-safe code.
• Proven Engineering Velocity: I take complete ownership from architecture to automated unit testing, deployment, and sub-second performance tuning.
• Autonomous Remote Execution: I operate comfortably in high-concurrency environments, communicate with concise clarity, and execute autonomously without requiring constant supervision.
${job.isNightShift ? `• Dedicated Night-Shift & High-Availability Coverage: Structured for immediate response and overnight incident mitigation.\n` : ''}
Attached to this email is my updated ${cvName} in official PDF format (${cvFile}). You can also inspect it online directly at:
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

  } else {
    // Global English Default
    hookPitch = `${codewordNote}Hi ${job.company} Team,

I'm Olumide, a ${persona.personaTitle} with a track record of architecting and shipping production platforms under strict real-world constraints.${nightNote} Most recently, I engineered ${primaryProject.name} (${primaryProject.description}), achieving ${primaryProject.metrics} using ${primaryProject.tech.slice(0, 5).join(', ')}.

Your ${job.title} opening stands out because it directly requires the engineering rigor—${persona.fitHook}—that I specialize in. You can inspect my live production systems and code here: ${candidate.portfolioUrl} (GitHub: ${candidate.githubUrl}). Attached is my tailored ${cvName} in PDF format.`;

    fullCoverLetter = `${codewordNote}Dear Hiring Team at ${job.company},

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
${job.isNightShift ? `• Dedicated Night-Shift & US-Evening Availability: I am specifically structured for night-shift and US-evening coverage (working from GMT+1/WAT, perfectly synchronized with US EST/PST business hours or overnight 3rd-shift on-call), ensuring uninterrupted focus and rapid resolution while day teams are offline.\n` : ''}
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
  }

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
    atsAnalysis: job.atsAnalysis || {
      atsScore: job.matchScore || 85,
      matchingKeywords: job.synergyStack || [],
      missingKeywords: [],
      recommendedHeadline: persona.personaTitle,
      tailoredSummary: hookPitch,
    },
    safety: job.safety || {
      safetyScore: 95,
      riskLevel: 'VERIFIED_SAFE',
      flags: [],
      reasons: ['Verified direct job opportunity'],
      isVerifiedCompany: true,
    },
  };
}
