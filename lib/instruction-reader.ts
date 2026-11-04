import { InstructionAnalysis, RemoteJob } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';

// Email regex pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Ignored domain emails that are not recruiter emails
const IGNORED_EMAILS = [
  'support@arbeitnow.com',
  'contact@arbeitnow.com',
  'support@jobicy.com',
  'hello@remotive.com',
  'contact@remoteok.com',
  'support@remoteok.io',
  'example@domain.com',
  'test@example.com',
  'privacy@',
  'terms@',
  'press@',
  'media@',
  'w3.org',
];

export function analyzeJobInstructions(job: Pick<RemoteJob, 'title' | 'company' | 'description' | 'applyUrl' | 'tags'>): InstructionAnalysis {
  // Pre-process text to de-obfuscate emails commonly found in HN posts (e.g. "alex [at] startup.io")
  const deobfuscated = job.description
    .replace(/\s*\[at\]\s*|\s*\(at\)\s*|\s+at\s+/gi, '@')
    .replace(/\s*\[dot\]\s*|\s*\(dot\)\s*|\s+dot\s+/gi, '.');

  const text = `${job.title}\n${job.description}\n${deobfuscated}\n${job.applyUrl}`;
  const detectedInstructions: string[] = [];
  const secretCodeWords: string[] = [];
  const requiredAnswers: { question: string; answer: string }[] = [];

  // 1. Extract direct recipient email if present
  let recipientEmail: string | undefined = undefined;
  let isEmailInferred = false;
  let emailSource: InstructionAnalysis['emailSource'] = undefined;

  const matches = text.match(EMAIL_REGEX) || [];
  for (const m of matches) {
    const cleanEmail = m.toLowerCase().trim();
    const isIgnored = IGNORED_EMAILS.some(ign => cleanEmail.includes(ign));
    if (!isIgnored && cleanEmail.includes('.') && !cleanEmail.endsWith('.')) {
      recipientEmail = cleanEmail;
      isEmailInferred = false;
      emailSource = 'EXPLICIT_BODY';
      detectedInstructions.push(`Direct hiring email detected in job listing: ${recipientEmail}`);
      break;
    }
  }

  // If no direct email in text, check if applyUrl is a mailto:
  if (!recipientEmail && job.applyUrl.startsWith('mailto:')) {
    recipientEmail = job.applyUrl.replace('mailto:', '').split('?')[0].trim();
    isEmailInferred = false;
    emailSource = 'MAILTO_LINK';
    detectedInstructions.push(`Direct application mailto link detected: ${recipientEmail}`);
  }

  // If still no direct email, infer the company hiring desk email from company name or ATS slug
  if (!recipientEmail) {
    let companySlug = '';

    // Check if applyUrl has ATS company slug (e.g. jobs.lever.co/supabase or boards.greenhouse.io/monzo)
    const atsMatch = job.applyUrl.match(/(?:lever\.co|greenhouse\.io|ashbyhq\.com|workable\.com)\/([a-zA-Z0-9_\-]+)/i);
    if (atsMatch && atsMatch[1]) {
      companySlug = atsMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    } else if (job.company && !job.company.includes('HN') && !job.company.includes('Unknown')) {
      companySlug = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    if (companySlug && companySlug.length >= 3) {
      recipientEmail = `jobs@${companySlug}.com`;
      isEmailInferred = true;
      emailSource = 'COMPANY_DOMAIN';
      detectedInstructions.push(`Company hiring inbox inferred: ${recipientEmail}`);
    }
  }

  // 2. Detect Subject Line Directives
  let customSubject: string | undefined = undefined;
  const subjectPatterns = [
    /subject(?: line)?[:\s]+["']?([^"'\n\r\.\<\>]{5,60})["']?/i,
    /use (?:the )?subject[:\s]+["']?([^"'\n\r\.\<\>]{5,60})["']?/i,
    /include ["']?([^"'\n\r\.\<\>]{3,30})["']? in (?:the|your) subject/i,
    /email (?:with )?subject[:\s]+["']?([^"'\n\r\.\<\>]{5,60})["']?/i,
  ];

  for (const pat of subjectPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      customSubject = match[1].trim();
      detectedInstructions.push(`Required subject line format: "${customSubject}"`);
      break;
    }
  }

  // 3. Detect Secret Codewords / Anti-Bot Traps
  const codewordPatterns = [
    /(?:include|mention|write|type|put) (?:the )?(?:word|phrase|code)[:\s]+["']?([a-zA-Z0-9_\-\s]{2,20})["']? (?:in|at|to)/i,
    /(?:start|begin) (?:your )?(?:cover letter|email|application) with[:\s]+["']?([a-zA-Z0-9_\-\s]{2,25})["']?/i,
    /(?:tell us|let us know) (?:your )?favorite[:\s]+([a-zA-Z0-9_\-\s]{3,25})/i,
    /so we know you(?: have)? read this(?:[^,\.\n]+)?["']?([a-zA-Z0-9_\-\s]{2,20})["']?/i,
  ];

  for (const pat of codewordPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const code = match[1].trim();
      if (!secretCodeWords.includes(code)) {
        secretCodeWords.push(code);
        detectedInstructions.push(`Anti-bot requirement detected: "${code}"`);
      }
    }
  }

  // 4. Detect Specific Mandatory Questions
  const lowerText = text.toLowerCase();

  // Availability
  if (lowerText.includes('availability') || lowerText.includes('start date') || lowerText.includes('when can you start') || lowerText.includes('notice period')) {
    requiredAnswers.push({
      question: 'Availability & Earliest Start Date',
      answer: 'Immediately available to start this week (0 days notice period).',
    });
    detectedInstructions.push('Explicit question answered: Immediate availability this week');
  }

  // Timezone / Hours
  if (lowerText.includes('timezone') || lowerText.includes('time zone') || lowerText.includes('working hours') || lowerText.includes('overlap')) {
    requiredAnswers.push({
      question: 'Timezone & Working Hours Overlap',
      answer: 'Based in GMT+1 (WAT), fully flexible with US (EST/PST) and European (CET/GMT) working schedules.',
    });
    detectedInstructions.push('Explicit question answered: Timezone & global hours overlap');
  }

  // Salary Expectations
  if (lowerText.includes('salary expectation') || lowerText.includes('desired compensation') || lowerText.includes('rate')) {
    requiredAnswers.push({
      question: 'Salary / Compensation Expectations',
      answer: 'Open to competitive remote compensation aligned with company bands and role scope (typically $70,000–$120,000/yr).',
    });
    detectedInstructions.push('Explicit question answered: Transparent salary expectations');
  }

  // Portfolio / Repos
  if (lowerText.includes('portfolio') || lowerText.includes('github') || lowerText.includes('sample code') || lowerText.includes('live project')) {
    requiredAnswers.push({
      question: 'Portfolio & Production Repositories',
      answer: `Live Portfolio: ${DEFAULT_CANDIDATE.portfolioUrl} | GitHub: ${DEFAULT_CANDIDATE.githubUrl} (Featuring GOD'S EYE, ChopOS, and ICT Flux).`,
    });
    detectedInstructions.push('Included links to live production code and interactive portfolio');
  }

  // 5. Select the Most Relevant CV
  const isQuantOrAI = job.tags.some(t => /quant|trading|python|fastapi|machine learning|ai|satellite|vision|stream|redis/i.test(t)) ||
                      /quant|trading|python|fastapi|ai|data engineer|systems|machine learning/i.test(job.title);

  const recommendedCV: 'FullStack' | 'Quant' = isQuantOrAI ? 'Quant' : 'FullStack';
  const recommendedCVFile = isQuantOrAI
    ? DEFAULT_CANDIDATE.cvFiles.quant.filename
    : DEFAULT_CANDIDATE.cvFiles.fullStack.filename;

  detectedInstructions.push(
    `Selected CV: ${isQuantOrAI ? 'Quant Algorithmic Engineer CV' : 'Full-Stack Systems Architect CV'}`
  );

  let confidence = 75;
  if (recipientEmail) confidence += 15;
  if (customSubject) confidence += 5;
  if (secretCodeWords.length > 0) confidence += 5;

  return {
    recipientEmail,
    isEmailInferred,
    emailSource,
    customSubject,
    secretCodeWords,
    detectedInstructions,
    requiredAnswers,
    recommendedCV,
    recommendedCVFile,
    hasDirectEmail: !!recipientEmail,
    complianceConfidence: Math.min(confidence, 100),
  };
}
