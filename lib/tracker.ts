import fs from 'fs';
import path from 'path';
import { ApplicationRecord } from '@/types/job';

// On Vercel serverless, filesystem is read-only except /tmp
const BASE_DIR = process.env.VERCEL ? '/tmp' : process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');

// In-memory fallback cache for serverless environments
let memoryOutbox: ApplicationRecord[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // If filesystem is read-only, in-memory array acts as fallback
  }
}

export function getApplicationHistory(): ApplicationRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(OUTBOX_FILE)) {
      const data = fs.readFileSync(OUTBOX_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to memory
  }
  return memoryOutbox;
}

export function recordApplication(record: ApplicationRecord): void {
  try {
    // Update memory cache
    memoryOutbox = [record, ...memoryOutbox.filter(r => r.jobId !== record.jobId)].slice(0, 200);

    ensureDataDir();
    const existing = getApplicationHistory();
    const updated = [record, ...existing.filter(r => r.jobId !== record.jobId)].slice(0, 200);
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // Filesystem error handled, in-memory cache still holds state
  }
}

export function normalizeCompany(name?: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function extractDomain(emailOrUrl?: string): string {
  if (!emailOrUrl) return '';
  const str = emailOrUrl.toLowerCase().trim();
  if (str.includes('@')) {
    const domain = str.split('@')[1];
    if (domain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'resend.dev'].includes(domain)) {
      return domain;
    }
  }
  try {
    const url = str.startsWith('http') ? new URL(str) : new URL(`https://${str}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Strict Anti-Spam & Single-Contact Enforcement:
 * Ensures we NEVER send more than 1 email to the same company,
 * the same corporate domain, or the same recipient email.
 */
export function isAlreadyApplied(
  jobId: string,
  company?: string,
  title?: string,
  recipientEmail?: string,
  jobUrl?: string
): boolean {
  const history = getApplicationHistory();
  const cNorm = normalizeCompany(company);
  const emailNorm = recipientEmail?.toLowerCase().trim();
  const domain = extractDomain(recipientEmail) || extractDomain(jobUrl);

  return history.some((r) => {
    // 1. Direct Job ID Match
    if (r.jobId === jobId) return true;

    // 2. Strict One-Email-Per-Company Rule:
    // If we have already emailed this company for any role, DO NOT email them again!
    if (cNorm && r.company) {
      const pastCompNorm = normalizeCompany(r.company);
      if (cNorm === pastCompNorm) {
        return true;
      }
    }

    // 3. Exact Email Match
    if (emailNorm && r.recipientEmail) {
      if (emailNorm === r.recipientEmail.toLowerCase().trim()) {
        return true;
      }
    }

    // 4. Domain-Level Anti-Spam:
    // If we already sent to @company.com, do not email another recruiter at the same company
    if (domain) {
      const pastDomain = extractDomain(r.recipientEmail) || extractDomain(r.company);
      if (pastDomain && pastDomain === domain) {
        return true;
      }
    }

    return false;
  });
}
