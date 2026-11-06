import { ATSMatchAnalysis, RemoteJob } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';

export function analyzeATSMatch(job: {
  title: string;
  tags: string[];
  description: string;
}): ATSMatchAnalysis {
  const text = `${job.title} ${job.tags.join(' ')} ${job.description}`.toLowerCase();
  const candidate = DEFAULT_CANDIDATE;

  const candidateKeywords = [
    'typescript', 'next.js', 'react', 'python', 'fastapi', 'postgresql', 
    'websockets', 'redis', 'timescaledb', 'opencv', 'three.js', 'docker', 
    'full stack', 'backend', 'api', 'systems', 'fintech', 'sql', 'c',
    'resend', 'email', 'ast', 'whatsapp', 'automotive', 'diagnostics', 'escrow'
  ];

  const commonTechList = [
    'typescript', 'javascript', 'python', 'next.js', 'react', 'node.js', 'fastapi',
    'django', 'flask', 'postgresql', 'postgres', 'redis', 'timescaledb', 'sql',
    'mongodb', 'graphql', 'rest', 'websockets', 'grpc', 'docker', 'kubernetes',
    'aws', 'gcp', 'cloud', 'ci/cd', 'git', 'linux', 'three.js', 'webgl', 'opencv',
    'microservices', 'kafka', 'testing', 'tdd', 'architecture', 'resend', 'email',
    'whatsapp', 'ai', 'llm', 'ast', 'linter', 'escrow', 'paystack'
  ];

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const tech of commonTechList) {
    if (text.includes(tech)) {
      if (candidateKeywords.includes(tech) || candidate.coreStack.some(s => s.toLowerCase().includes(tech))) {
        matchingKeywords.push(tech);
      } else {
        missingKeywords.push(tech);
      }
    }
  }

  // ATS Score calculation based on keyword overlap
  const totalRelevant = matchingKeywords.length + missingKeywords.length;
  let atsScore = 82;
  if (totalRelevant > 0) {
    atsScore = Math.round((matchingKeywords.length / totalRelevant) * 40) + 58;
  }
  atsScore = Math.min(Math.max(atsScore, 75), 99);

  const isPythonFocus = text.includes('python') || text.includes('fastapi') || text.includes('quant');
  const isEmailFocus = text.includes('email') || text.includes('resend') || text.includes('telemetry');
  const isAIFocus = text.includes('ai') || text.includes('whatsapp') || text.includes('nlp');

  let recommendedHeadline = 'Full-Stack Systems Engineer & Next.js/TypeScript Architect';
  if (isPythonFocus) {
    recommendedHeadline = 'High-Performance Python & Distributed Systems Engineer';
  } else if (isEmailFocus) {
    recommendedHeadline = 'Developer Infrastructure & Email Telemetry Architect';
  } else if (isAIFocus) {
    recommendedHeadline = 'Lead AI Systems Architect & Full-Stack Engineer';
  }

  const matchedStr = matchingKeywords.length > 0 ? matchingKeywords.slice(0, 5).join(', ') : 'distributed systems and full-stack architecture';

  const tailoredSummary = `High-Velocity Lead Systems Architect with a Mechanical Engineering foundation from Obafemi Awolowo University (OAU), specializing in ${matchedStr}. Proven track record shipping 20+ production platforms under strict latency, concurrency, and reliability constraints—including GOD'S EYE (satellite earth observation & <100ms MT5 algorithmic execution), Resend Mission Control (real-time inbound MIME streaming & AST email linters), AutoCare AI (multilingual WhatsApp diagnostics), and ChopOS (merchant POS with PostgreSQL row-level locks). Prepared for immediate, high-impact remote contribution.`;

  return {
    atsScore,
    matchingKeywords,
    missingKeywords: missingKeywords.slice(0, 4),
    recommendedHeadline,
    tailoredSummary,
  };
}

export function generateTailoredCvHtml(job: RemoteJob, customCandidate?: typeof DEFAULT_CANDIDATE): string {
  const candidate = customCandidate || DEFAULT_CANDIDATE;
  const ats = analyzeATSMatch(job);

  // Score projects by relevance to job description
  const jobWords = `${job.title} ${job.tags.join(' ')} ${job.description}`.toLowerCase();
  const sortedProjects = [...candidate.keyProjects].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    a.relevanceTags.forEach(t => { if (jobWords.includes(t.toLowerCase())) scoreA += 1; });
    a.tech.forEach(t => { if (jobWords.includes(t.toLowerCase())) scoreA += 2; });
    b.relevanceTags.forEach(t => { if (jobWords.includes(t.toLowerCase())) scoreB += 1; });
    b.tech.forEach(t => { if (jobWords.includes(t.toLowerCase())) scoreB += 2; });
    return scoreB - scoreA;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${candidate.name} — CV Tailored for ${job.company} (${job.title})</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page { size: A4; margin: 10mm 14mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 9.2pt; line-height: 1.42; color: #0f172a; background: #f8fafc; padding: 20px; }
        .cv-card { max-width: 820px; margin: 0 auto; background: #ffffff; padding: 32px 40px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .no-print { max-width: 820px; margin: 0 auto 14px auto; background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .btn-print { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; }
        h1 { font-size: 22pt; font-weight: 800; color: #090d16; }
        .headline { font-size: 10.5pt; font-weight: 700; color: #0284c7; margin-top: 2px; }
        .contacts { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 8pt; color: #475569; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; }
        .contacts a { color: #0284c7; text-decoration: none; }
        .section-title { font-size: 8.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #0f172a; padding-bottom: 2px; margin: 12px 0 6px 0; }
        .job-item { margin-bottom: 9px; }
        .job-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 9pt; }
        ul { padding-left: 16px; margin-top: 2px; }
        li { font-size: 8pt; color: #334155; margin-bottom: 2px; line-height: 1.38; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 7.5pt; }
        @media print {
          .no-print { display: none; }
          body { background: white; padding: 0; }
          .cv-card { border: none; box-shadow: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <div>
          <strong>ATS Match Rating: ${ats.atsScore}%</strong> · Tailored for <strong>${job.company}</strong> (${job.title})
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>

      <div class="cv-card">
        <header>
          <h1>${candidate.name}</h1>
          <div class="headline">${ats.recommendedHeadline}</div>
          <div class="contacts">
            <span>📍 ${candidate.location}</span>
            <span>✉️ <a href="mailto:${candidate.email}">${candidate.email}</a></span>
            <span>📞 <a href="tel:${candidate.phone}">${candidate.phone}</a></span>
            <span>🌐 <a href="${candidate.portfolioUrl}">Portfolio (20+ Systems)</a></span>
            <span>⚡ <a href="${candidate.githubUrl}">GitHub</a></span>
            <span>💼 <a href="${candidate.linkedinUrl}">LinkedIn</a></span>
          </div>
        </header>

        <section>
          <div class="section-title">Professional Summary</div>
          <p style="font-size: 8.5pt; color: #334155; text-align: justify; line-height: 1.4;">${ats.tailoredSummary}</p>
        </section>

        <section>
          <div class="section-title">Core Technical Proficiencies</div>
          <p style="font-size: 8pt; color: #475569; line-height: 1.45;">
            <strong>Languages & Runtimes:</strong> Python 3.12 (asyncio, uv), TypeScript, JavaScript (ESNext), SQL, C (FFI), Bash<br/>
            <strong>Distributed & Cloud:</strong> Next.js 15, FastAPI, Node.js, WebSockets, TimescaleDB, Redis Streams, Docker, Vercel Edge<br/>
            <strong>Developer Infrastructure:</strong> Resend Inbound Webhooks, React Email AST Linters, RFC 5322 MIME Parsers, DNS Reputation Sentry<br/>
            <strong>FinTech & Concurrency:</strong> Paystack Split Subaccounts, Row-Level Locking (SELECT FOR UPDATE), MetaTrader MT5 C Bridges<br/>
            <strong>Computer Vision & AI:</strong> OpenCV (Hough Circle SAR Analysis), WhatsApp Cloud API, Multilingual Decision Trees, Three.js WebGL
          </p>
        </section>

        <section>
          <div class="section-title">Targeted Systems & Production Track Record</div>
          ${sortedProjects.slice(0, 5).map(proj => `
            <div class="job-item">
              <div class="job-header">
                <span>${proj.name}</span>
                <span class="badge">${proj.tech.slice(0, 3).join(', ')}</span>
              </div>
              <p style="font-size: 8pt; color: #475569; margin: 1px 0;">${proj.description}</p>
              <ul>
                <li><strong>Core Metrics:</strong> ${proj.metrics}</li>
                <li><strong>Architecture & Stack:</strong> ${proj.tech.join(' · ')}</li>
              </ul>
            </div>
          `).join('')}
        </section>

        <section>
          <div class="section-title">Education & Mechanical Rigor</div>
          <div class="job-header">
            <span>Bachelor of Science (B.Sc.) in Mechanical Engineering</span>
            <span style="font-weight: 500; font-size: 8pt; color: #64748b;">Obafemi Awolowo University (OAU)</span>
          </div>
          <p style="font-size: 8pt; color: #64748b; margin-top: 2px;">
            Applies physical machine analysis—stress limits, equilibrium states, fluid flow, and feedback loops—directly to modern distributed software engineering.
          </p>
        </section>
      </div>
    </body>
    </html>
  `;
}
