import { SafetyAnalysis } from '@/types/job';

const SUSPICIOUS_PATTERNS = [
  { pattern: /(?:unpaid|free) (?:trial|test project|internship|task)/i, flag: 'Unpaid test task / Exploitative free labor request', penalty: 40 },
  { pattern: /(?:build|code) (?:our|a full) (?:mvp|app|feature) (?:for|before) (?:the )?interview/i, flag: 'Excessive unpaid take-home task', penalty: 35 },
  { pattern: /(?:telegram|whatsapp) (?:only|contact us on|message me at)/i, flag: 'Telegram/WhatsApp only contact (High risk phishing/scam vector)', penalty: 45 },
  { pattern: /(?:send|deposit) (?:a )?check (?:for|to buy) (?:equipment|home office|laptop)/i, flag: 'Check cashing / fake equipment vendor scam pattern', penalty: 80 },
  { pattern: /(?:pay|wire|send) (?:money|crypto|registration fee|processing fee)/i, flag: 'Upfront payment or crypto transfer requested', penalty: 90 },
  { pattern: /earn \$\d{4,} (?:weekly|daily) (?:with )?no experience/i, flag: 'Unrealistic compensation for zero qualifications', penalty: 50 },
  { pattern: /(?:cryptocurrency|bitcoin|usdt) (?:trader|receiver|transfers) needed/i, flag: 'Money mule / unauthorized crypto transmission risk', penalty: 60 },
  { pattern: /ssn|bank account|passport upfront/i, flag: 'Requests sensitive identity / banking credentials before formal offer', penalty: 70 },
];

const TRUSTED_DOMAINS = [
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'workable.com',
  'bamboohr.com',
  'ycombinator.com',
  'github.com',
  'remoteok.com',
  'arbeitnow.com',
  'jobicy.com',
  'remotive.com',
  'news.ycombinator.com',
];

export function analyzeJobSafety(job: {
  title: string;
  company: string;
  description: string;
  applyUrl: string;
  source: string;
}): SafetyAnalysis {
  const text = `${job.title} ${job.company} ${job.description} ${job.applyUrl}`.toLowerCase();
  const flags: string[] = [];
  const reasons: string[] = [];

  let safetyScore = 95;

  // 1. Check suspicious scam & exploitation patterns
  for (const item of SUSPICIOUS_PATTERNS) {
    if (item.pattern.test(text)) {
      flags.push(item.flag);
      reasons.push(item.flag);
      safetyScore -= item.penalty;
    }
  }

  // 2. Check for trusted platform source / domain
  const isTrustedPlatform = TRUSTED_DOMAINS.some(d => job.applyUrl.toLowerCase().includes(d)) || 
                           job.source === 'HackerNews' || 
                           job.source === 'Arbeitnow' ||
                           job.source === 'Jobicy';

  if (isTrustedPlatform) {
    safetyScore = Math.min(safetyScore + 10, 100);
    reasons.push('Verified through established job aggregator / company ATS portal');
  }

  // 3. Check if company is anonymized
  if (/confidential|private client|anonymous/i.test(job.company)) {
    safetyScore -= 15;
    flags.push('Anonymous employer (company identity withheld)');
  }

  // Ensure score stays in bounds
  safetyScore = Math.max(Math.min(safetyScore, 100), 10);

  let riskLevel: SafetyAnalysis['riskLevel'] = 'VERIFIED_SAFE';
  if (safetyScore < 50) {
    riskLevel = 'SUSPICIOUS_SCAM';
  } else if (safetyScore < 75) {
    riskLevel = 'CAUTION';
  }

  return {
    safetyScore,
    riskLevel,
    flags,
    reasons,
    isVerifiedCompany: safetyScore >= 75,
  };
}
