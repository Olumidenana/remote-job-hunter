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
    'full stack', 'backend', 'api', 'systems', 'fintech', 'sql', 'c'
  ];

  const commonTechList = [
    'typescript', 'javascript', 'python', 'next.js', 'react', 'node.js', 'fastapi',
    'django', 'flask', 'postgresql', 'postgres', 'redis', 'timescaledb', 'sql',
    'mongodb', 'graphql', 'rest', 'websockets', 'grpc', 'docker', 'kubernetes',
    'aws', 'gcp', 'cloud', 'ci/cd', 'git', 'linux', 'three.js', 'webgl', 'opencv',
    'microservices', 'kafka', 'testing', 'tdd', 'architecture'
  ];

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const tech of commonTechList) {
    if (text.includes(tech)) {
      if (candidateKeywords.includes(tech) || candidate.coreStack.some(s => s.toLowerCase() === tech)) {
        matchingKeywords.push(tech);
      } else {
        missingKeywords.push(tech);
      }
    }
  }

  // ATS Score calculation based on keyword overlap
  const totalRelevant = matchingKeywords.length + missingKeywords.length;
  let atsScore = 80;
  if (totalRelevant > 0) {
    atsScore = Math.round((matchingKeywords.length / totalRelevant) * 40) + 55;
  }
  atsScore = Math.min(Math.max(atsScore, 72), 98);

  const isPythonFocus = text.includes('python') || text.includes('fastapi') || text.includes('quant');
  const recommendedHeadline = isPythonFocus
    ? 'High-Performance Python & Distributed Systems Engineer'
    : 'Full-Stack Systems Engineer & Next.js/TypeScript Architect';

  const tailoredSummary = `High-Velocity Full-Stack Systems Engineer and Mechanical Engineering graduate from Obafemi Awolowo University (OAU), specializing in ${matchingKeywords.slice(0, 4).join(', ')}. Proven track record shipping production systems under strict latency and concurrency limits, including GOD'S EYE (satellite earth observation & MT5 automated trade routing), ChopOS (merchant POS with PostgreSQL row-level locks), and ICT Flux (73+ live WebSocket feeds). Fully prepared for immediate remote contribution.`;

  return {
    atsScore,
    matchingKeywords,
    missingKeywords: missingKeywords.slice(0, 4),
    recommendedHeadline,
    tailoredSummary,
  };
}

export function generateTailoredCvHtml(job: RemoteJob): string {
  const candidate = DEFAULT_CANDIDATE;
  const ats = analyzeATSMatch(job);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${candidate.name} — CV Tailored for ${job.company} (${job.title})</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page { size: A4; margin: 12mm 14mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 9.5pt; line-height: 1.45; color: #0f172a; background: #f8fafc; padding: 24px; }
        .cv-card { max-width: 820px; margin: 0 auto; background: #ffffff; padding: 36px 44px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .no-print { max-width: 820px; margin: 0 auto 16px auto; background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .btn-print { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; }
        h1 { font-size: 22pt; font-weight: 800; color: #090d16; }
        .headline { font-size: 11pt; font-weight: 700; color: #0284c7; margin-top: 2px; }
        .contacts { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 8.5pt; color: #475569; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; }
        .contacts a { color: #0284c7; text-decoration: none; }
        .section-title { font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin: 14px 0 8px 0; }
        .job-item { margin-bottom: 10px; }
        .job-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 9.5pt; }
        ul { padding-left: 18px; margin-top: 3px; }
        li { font-size: 8.5pt; color: #334155; margin-bottom: 2px; }
        .badge { background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 3px; font-family: monospace; font-size: 8pt; }
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
            <span>📞 ${candidate.phone}</span>
            <span>🌐 <a href="${candidate.portfolioUrl}">Live Portfolio</a></span>
            <span>⚡ <a href="${candidate.githubUrl}">GitHub: @Olumidenana</a></span>
          </div>
        </header>

        <section>
          <div class="section-title">Targeted Professional Summary</div>
          <p style="font-size: 9pt; color: #334155; text-align: justify; line-height: 1.45;">
            ${ats.tailoredSummary}
          </p>
        </section>

        <section>
          <div class="section-title">Core Technical Proficiencies</div>
          <p style="font-size: 8.5pt; color: #334155; line-height: 1.6;">
            <strong>Target Stack:</strong> ${ats.matchingKeywords.map(k => `<span class="badge">${k}</span>`).join(' ')}<br />
            <strong>Languages & Runtimes:</strong> TypeScript, Python 3.12, JavaScript (ESNext), SQL, C (FFI), HTML5/CSS3<br />
            <strong>Architectures & Frameworks:</strong> Next.js, React, FastAPI, Node.js, TimescaleDB, PostgreSQL, Redis Streams, WebSockets<br />
            <strong>Systems & Cloud:</strong> Docker, Git/GitHub Actions, Vercel, Supabase, FIX Protocol 4.4, OpenCV, Three.js
          </p>
        </section>

        <section>
          <div class="section-title">Production Systems & Track Record</div>
          ${candidate.keyProjects.map(p => `
            <div class="job-item">
              <div class="job-header">
                <span>${p.name}</span>
                <span style="font-size: 8pt; color: #64748b; font-family: monospace;">2025–2026</span>
              </div>
              <div style="font-size: 8pt; color: #0284c7; margin-bottom: 2px;">${p.tech.join(' · ')}</div>
              <ul>
                <li>${p.description}</li>
                <li><strong>Verified Benchmark / Metric:</strong> ${p.metrics}.</li>
              </ul>
            </div>
          `).join('')}
        </section>

        <section>
          <div class="section-title">Education & Physical Systems Foundation</div>
          <div class="job-header">
            <span>B.Sc. Mechanical Engineering · Obafemi Awolowo University (OAU)</span>
            <span style="font-size: 8pt; color: #64748b;">Ile-Ife, Nigeria</span>
          </div>
          <p style="font-size: 8.5pt; color: #475569; margin-top: 2px;">
            Rigorous training in dynamic equilibrium, friction reduction, heat transfer, numerical methods, and feedback loops—applied directly to distributed systems fault-tolerance and low-latency pipelines.
          </p>
        </section>
      </div>
    </body>
    </html>
  `;
}
