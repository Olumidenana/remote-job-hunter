import fs from 'fs';
import path from 'path';
import { ApplicationRecord } from '@/types/job';

// On Vercel serverless, filesystem is read-only except /tmp
const BASE_DIR = process.env.VERCEL ? '/tmp' : process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');
const SEED_FILE = path.join(process.cwd(), 'data', 'seed-outbox.json');

// In-memory fallback cache for serverless environments
let memoryOutbox: ApplicationRecord[] = [];
let isInitialized = false;

function loadSeedHistory(): ApplicationRecord[] {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const data = fs.readFileSync(SEED_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore if seed file doesn't exist
  }
  return [];
}

function ensureInitialized() {
  if (isInitialized && memoryOutbox.length > 0) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(OUTBOX_FILE)) {
      const data = fs.readFileSync(OUTBOX_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryOutbox = parsed;
        isInitialized = true;
        return;
      }
    }

    // Initialize from static seed if outbox file is empty
    const seed = loadSeedHistory();
    if (seed.length > 0) {
      memoryOutbox = seed;
      fs.writeFileSync(OUTBOX_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    }
  } catch {
    const seed = loadSeedHistory();
    if (seed.length > 0 && memoryOutbox.length === 0) {
      memoryOutbox = seed;
    }
  }
  isInitialized = true;
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

export function getApplicationHistory(clientHistory?: ApplicationRecord[]): ApplicationRecord[] {
  ensureInitialized();

  let merged = [...memoryOutbox];

  if (Array.isArray(clientHistory) && clientHistory.length > 0) {
    const seenIds = new Set(merged.map(m => m.id || m.jobId));
    for (const item of clientHistory) {
      const id = item.id || item.jobId;
      if (id && !seenIds.has(id)) {
        merged.push(item);
        seenIds.add(id);
      }
    }
    // Update memory cache with client sync
    memoryOutbox = merged.slice(0, 300);
    try {
      fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
    } catch {
      // Safe fallback
    }
  }

  return memoryOutbox;
}

export function recordApplication(record: ApplicationRecord): void {
  ensureInitialized();
  try {
    // Check if duplicate
    const filtered = memoryOutbox.filter(r => (r.id !== record.id && r.jobId !== record.jobId));
    memoryOutbox = [record, ...filtered].slice(0, 300);

    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
  } catch {
    // State remains in memory
  }
}

export function recordApplicationsBatch(records: ApplicationRecord[]): void {
  ensureInitialized();
  try {
    const newJobIds = new Set(records.map(r => r.jobId));
    const filtered = memoryOutbox.filter(r => !newJobIds.has(r.jobId));
    memoryOutbox = [...records, ...filtered].slice(0, 300);

    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
  } catch {
    // State remains in memory
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
  jobUrl?: string,
  extraHistory?: ApplicationRecord[]
): boolean {
  const history = extraHistory && extraHistory.length > 0
    ? [...getApplicationHistory(), ...extraHistory]
    : getApplicationHistory();

  const cNorm = normalizeCompany(company);
  const emailNorm = recipientEmail?.toLowerCase().trim();
  const domain = extractDomain(recipientEmail) || extractDomain(jobUrl);

  return history.some((r) => {
    // 1. Direct Job ID Match
    if (r.jobId === jobId || r.id === jobId) return true;

    // 2. Strict One-Email-Per-Company Rule:
    // If we have already emailed this company for any role or outreach, DO NOT email them again!
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
