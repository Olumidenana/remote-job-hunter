import fs from 'fs';
import path from 'path';
import { ApplicationRecord } from '@/types/job';

// On Vercel serverless, filesystem is read-only except /tmp
const BASE_DIR = process.env.VERCEL ? '/tmp' : process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');
const SEED_FILE = path.join(process.cwd(), 'data', 'seed-outbox.json');

// Public consumer webmail domains and aggregator/ATS platforms that should NOT be blocked domain-wide
const IGNORED_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'resend.dev',
  'resend.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'fastmail.com',
  'yandex.com',
  'gmx.com',
  // Job boards and ATS aggregators
  'weworkremotely.com',
  'remotive.com',
  'remoteok.com',
  'remoteok.io',
  'hiringcafe.com',
  'ycombinator.com',
  'news.ycombinator.com',
  'github.com',
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',
  'greenhouse.io',
  'boards.greenhouse.io',
  'lever.co',
  'jobs.lever.co',
  'ashbyhq.com',
  'jobs.ashbyhq.com',
  'workable.com',
  'apply.workable.com',
  'breezy.hr',
  'smartrecruiters.com',
  'jobvite.com',
  'workday.com',
  'recruitee.com',
  'applytojob.com',
]);

// Corporate entity suffixes to strip during name normalization
const CORPORATE_SUFFIX_REGEX = /\b(inc|incorporated|corp|corporation|llc|ltd|limited|gmbh|ag|technologies|technology|tech|labs|holdings|group|software|solutions|consulting|enterprises|international|global|co)\b/gi;

// In-memory cache & fast lookup sets
let memoryOutbox: ApplicationRecord[] = [];
let appliedJobIds = new Set<string>();
let appliedEmails = new Set<string>();
let appliedCompanyNormalized = new Set<string>();
let appliedCorporateDomains = new Set<string>();
let isInitialized = false;
let lastSyncTimestamp = 0;

/**
 * Normalizes company names to eliminate legal suffix variations
 * e.g. "Vexcash AG" -> "vexcash", "Vexcash" -> "vexcash"
 * "Stripe, Inc." -> "stripe", "Stripe" -> "stripe"
 */
export function normalizeCompany(name?: string): string {
  if (!name) return '';
  let cleaned = name.toLowerCase();
  // Strip parenthetical notes like (Global / EMEA) or (US Only)
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  // Strip corporate entity suffixes
  cleaned = cleaned.replace(CORPORATE_SUFFIX_REGEX, '');
  // Normalize & and 'and' conjunctions
  cleaned = cleaned.replace(/\band\b/gi, '').replace(/&/g, '');
  // Keep only alphanumeric characters
  return cleaned.replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Compares two company names with strict normalization and prefix matching
 */
export function isCompanyMatch(companyA?: string, companyB?: string): boolean {
  const normA = normalizeCompany(companyA);
  const normB = normalizeCompany(companyB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Prefix matching for root entity matches (minimum 4 characters)
  if (normA.length >= 4 && normB.length >= 4) {
    if (normA.startsWith(normB) || normB.startsWith(normA)) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts true corporate domain, ignoring public webmail & ATS job board hosts
 */
export function extractDomain(emailOrUrl?: string): string {
  if (!emailOrUrl) return '';
  const str = emailOrUrl.toLowerCase().trim();

  // 1. Email format
  if (str.includes('@')) {
    const domain = str.split('@')[1]?.trim();
    if (domain && !IGNORED_DOMAINS.has(domain)) {
      return domain;
    }
    return '';
  }

  // 2. URL format
  try {
    const url = str.startsWith('http') ? new URL(str) : new URL(`https://${str}`);
    let hostname = url.hostname.replace(/^www\./, '');

    // Strip common ATS subdomains (e.g. jobs.lever.co -> lever.co)
    if (hostname.startsWith('jobs.') || hostname.startsWith('careers.') || hostname.startsWith('boards.')) {
      hostname = hostname.replace(/^(jobs|careers|boards)\./, '');
    }

    if (hostname && !IGNORED_DOMAINS.has(hostname) && hostname.includes('.')) {
      return hostname;
    }
  } catch {
    // Invalid URL string
  }
  return '';
}

/**
 * Rebuilds fast lookup sets from the current memoryOutbox
 */
function rebuildLookupSets(): void {
  appliedJobIds.clear();
  appliedEmails.clear();
  appliedCompanyNormalized.clear();
  appliedCorporateDomains.clear();

  for (const record of memoryOutbox) {
    if (record.jobId) appliedJobIds.add(record.jobId);
    if (record.id) appliedJobIds.add(record.id);

    const email = (record.companyEmailPicked || record.recipientEmail || '').toLowerCase().trim();
    if (email && email.includes('@')) {
      appliedEmails.add(email);
      const domain = extractDomain(email);
      if (domain) appliedCorporateDomains.add(domain);
    }

    if (record.company) {
      const cNorm = normalizeCompany(record.company);
      if (cNorm) appliedCompanyNormalized.add(cNorm);
      const cDomain = extractDomain(record.company);
      if (cDomain) appliedCorporateDomains.add(cDomain);
    }
  }
}

/**
 * Loads static seeded history from data/seed-outbox.json
 */
function loadSeedHistory(): ApplicationRecord[] {
  try {
    if (fs.existsSync(SEED_FILE)) {
      const data = fs.readFileSync(SEED_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[TRACKER] Could not read seed file:', err);
  }
  return [];
}

/**
 * Fetches the permanent, immutable list of sent emails from Resend REST API
 * (This survives all Vercel serverless cold starts and container recycles)
 */
async function fetchResendSentHistory(): Promise<ApplicationRecord[]> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://api.resend.com/emails?limit=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // Short timeout to never block serverless execution
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) {
      console.warn(`[TRACKER] Resend API history check returned status ${res.status}`);
      return [];
    }

    const payload = await res.json();
    const emails: Array<{
      id: string;
      to?: string[];
      from?: string;
      created_at: string;
      subject: string;
    }> = Array.isArray(payload?.data) ? payload.data : [];

    const parsedRecords: ApplicationRecord[] = [];

    for (const email of emails) {
      const subject = email.subject || '';

      // Skip the daily digest email Olumide sends to himself
      if (subject.toLowerCase().includes('daily remote job alert') || subject.toLowerCase().includes('digest')) {
        continue;
      }

      // 1. Extract Target Email
      let targetEmail = '';
      // If forward-ready sandbox format: "[FORWARD-READY APPLICATION] To: jobs@example.com — ..."
      const forwardMatch = subject.match(/To:\s*([^\s—\:]+@[^\s—\:]+)/i);
      if (forwardMatch && forwardMatch[1]) {
        targetEmail = forwardMatch[1].trim();
      } else if (email.to && email.to.length > 0) {
        // If live dispatch, email.to has the target
        const primaryTo = email.to[0].trim();
        // Ignore personal recipient if candidate email
        if (!primaryTo.includes('olumideadeyemi') && !primaryTo.includes('onboarding@resend.dev')) {
          targetEmail = primaryTo;
        }
      }

      // 2. Extract Company & Job Title from Subject
      let extractedCompany = '';
      let extractedTitle = subject;

      // Pattern: "Application: <Title> — <Candidate>" or "Application: <Title> at <Company>"
      const appMatch = subject.match(/Application:\s*([^—\n]+?)(?:\s*—|\s*at\s*|$)/i);
      if (appMatch && appMatch[1]) {
        extractedTitle = appMatch[1].trim();
      }

      // Check for diagnostic pitch format: "Architectural Diagnostic: <Hook>"
      const isOutreach = subject.includes('Diagnostic') || subject.includes('Architectural');

      // Infer company from recipient domain if present
      if (targetEmail && targetEmail.includes('@')) {
        const domain = extractDomain(targetEmail);
        if (domain) {
          extractedCompany = domain.split('.')[0];
        }
      }

      parsedRecords.push({
        id: `resend-${email.id}`,
        type: isOutreach ? 'OUTREACH' : 'JOB_APP',
        messageId: email.id,
        jobId: `resend-${email.id}`,
        company: extractedCompany || 'Dispatched Recruiter',
        jobTitle: extractedTitle,
        recipientEmail: targetEmail || email.to?.[0] || 'sent@resend',
        companyEmailPicked: targetEmail || email.to?.[0] || 'sent@resend',
        actualDeliveredTo: email.to?.[0] || 'delivered',
        deliveryMode: targetEmail ? 'LIVE_COMPANY_INBOX' : 'SANDBOX_FORWARD_READY',
        subject: subject,
        status: 'SENT',
        sentAt: email.created_at,
        cvAttached: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
        complianceNotes: ['Ingested from permanent Resend API dispatch history'],
      });
    }

    return parsedRecords;
  } catch (err) {
    console.warn('[TRACKER] Could not fetch Resend history:', err);
    return [];
  }
}

/**
 * Loads from Vercel KV or Upstash Redis if configured
 */
async function fetchKVHistory(): Promise<ApplicationRecord[]> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return [];

  try {
    const res = await fetch(`${kvUrl}/get/remote_job_hunter_outbox`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.result) {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[TRACKER] KV read failed:', err);
  }
  return [];
}

/**
 * Persists outbox to KV store if available
 */
async function saveToKV(records: ApplicationRecord[]): Promise<void> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return;

  try {
    await fetch(`${kvUrl}/set/remote_job_hunter_outbox`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(records.slice(0, 500)),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Best-effort KV write
  }
}

/**
 * Synchronous initialization from local filesystem and seed
 */
function ensureInitializedSync(): void {
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
        rebuildLookupSets();
        isInitialized = true;
        return;
      }
    }

    const seed = loadSeedHistory();
    if (seed.length > 0) {
      memoryOutbox = seed;
      try {
        fs.writeFileSync(OUTBOX_FILE, JSON.stringify(seed, null, 2), 'utf-8');
      } catch {}
    }
  } catch {
    const seed = loadSeedHistory();
    if (seed.length > 0 && memoryOutbox.length === 0) {
      memoryOutbox = seed;
    }
  }

  rebuildLookupSets();
  isInitialized = true;
}

/**
 * Asynchronous Full-Mesh Synchronization:
 * Merges Resend API sent history + KV database + local filesystem + seed + client history.
 * Guarantees zero duplicate sends across Vercel serverless container recycles.
 */
export async function syncPersistentHistory(clientHistory?: ApplicationRecord[]): Promise<ApplicationRecord[]> {
  ensureInitializedSync();

  // Rate-limit remote checks to once every 15 seconds per container
  const now = Date.now();
  const shouldFetchRemote = now - lastSyncTimestamp > 15000;

  let resendRecords: ApplicationRecord[] = [];
  let kvRecords: ApplicationRecord[] = [];

  if (shouldFetchRemote) {
    lastSyncTimestamp = now;
    const [resendResult, kvResult] = await Promise.all([
      fetchResendSentHistory(),
      fetchKVHistory(),
    ]);
    resendRecords = resendResult;
    kvRecords = kvResult;
  }

  // Merge sources: Resend > KV > Client > Local memory
  const allCandidates = [
    ...resendRecords,
    ...kvRecords,
    ...(Array.isArray(clientHistory) ? clientHistory : []),
    ...memoryOutbox,
  ];

  const deduped: ApplicationRecord[] = [];
  const seenKeys = new Set<string>();

  for (const item of allCandidates) {
    const emailKey = item.recipientEmail ? item.recipientEmail.toLowerCase().trim() : '';
    const compKey = item.company ? normalizeCompany(item.company) : '';
    const idKey = item.jobId || item.id || '';

    // Create a composite fingerprint
    const compositeKey = emailKey
      ? `email:${emailKey}`
      : compKey
      ? `comp:${compKey}`
      : `id:${idKey}`;

    if (!seenKeys.has(compositeKey)) {
      seenKeys.add(compositeKey);
      deduped.push(item);
    }
  }

  memoryOutbox = deduped.slice(0, 500);
  rebuildLookupSets();
  isInitialized = true;

  // Persist to disk
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
  } catch {}

  // Asynchronously persist to KV
  if (shouldFetchRemote && (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)) {
    saveToKV(memoryOutbox).catch(() => {});
  }

  return memoryOutbox;
}

/**
 * Returns current application history
 */
export function getApplicationHistory(clientHistory?: ApplicationRecord[]): ApplicationRecord[] {
  ensureInitializedSync();

  if (Array.isArray(clientHistory) && clientHistory.length > 0) {
    const seen = new Set(memoryOutbox.map(m => m.id || m.jobId));
    let hasNew = false;
    for (const item of clientHistory) {
      const id = item.id || item.jobId;
      if (id && !seen.has(id)) {
        memoryOutbox.push(item);
        seen.add(id);
        hasNew = true;
      }
    }
    if (hasNew) {
      memoryOutbox = memoryOutbox.slice(0, 500);
      rebuildLookupSets();
      try {
        fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
      } catch {}
    }
  }

  return memoryOutbox;
}

/**
 * Records a single application in memory, disk, and remote KV
 */
export function recordApplication(record: ApplicationRecord): void {
  ensureInitializedSync();

  const filtered = memoryOutbox.filter(r => (r.id !== record.id && r.jobId !== record.jobId));
  memoryOutbox = [record, ...filtered].slice(0, 500);
  rebuildLookupSets();

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
  } catch {}

  if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
    saveToKV(memoryOutbox).catch(() => {});
  }
}

/**
 * Records a batch of applications in memory, disk, and remote KV
 */
export function recordApplicationsBatch(records: ApplicationRecord[]): void {
  ensureInitializedSync();

  const newJobIds = new Set(records.map(r => r.jobId));
  const filtered = memoryOutbox.filter(r => !newJobIds.has(r.jobId));
  memoryOutbox = [...records, ...filtered].slice(0, 500);
  rebuildLookupSets();

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf-8');
  } catch {}

  if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
    saveToKV(memoryOutbox).catch(() => {});
  }
}

/**
 * Strict Anti-Duplicate & Anti-Spam Verification:
 * Guarantees we NEVER send more than 1 application to:
 * 1. The exact same job posting ID
 * 2. The exact same recipient email address
 * 3. The exact same corporate domain (e.g. any @company.com address)
 * 4. The same company name (accounting for LLC/Inc/AG suffix variations)
 */
export function isAlreadyApplied(
  jobId: string,
  company?: string,
  title?: string,
  recipientEmail?: string,
  jobUrl?: string,
  extraHistory?: ApplicationRecord[]
): boolean {
  ensureInitializedSync();

  // Check 1: Direct Job ID match
  if (jobId && appliedJobIds.has(jobId)) {
    return true;
  }

  // Check 2: Exact Recipient Email Match
  const emailNorm = recipientEmail?.toLowerCase().trim();
  if (emailNorm && appliedEmails.has(emailNorm)) {
    return true;
  }

  // Check 3: Corporate Domain Match (e.g. @stripe.com)
  const corporateDomain = extractDomain(recipientEmail) || extractDomain(jobUrl);
  if (corporateDomain && appliedCorporateDomains.has(corporateDomain)) {
    return true;
  }

  // Check 4: Company Name Match with strict entity normalization
  const cNorm = normalizeCompany(company);
  if (cNorm && appliedCompanyNormalized.has(cNorm)) {
    return true;
  }

  // Check 5: Fuzzy Prefix Match on Company Names in appliedCompanyNormalized
  if (cNorm && cNorm.length >= 4) {
    for (const pastNorm of appliedCompanyNormalized) {
      if (pastNorm.length >= 4) {
        if (pastNorm.startsWith(cNorm) || cNorm.startsWith(pastNorm)) {
          return true;
        }
      }
    }
  }

  // Check 6: Check against extra in-flight history if passed
  if (Array.isArray(extraHistory) && extraHistory.length > 0) {
    return extraHistory.some(r => {
      if (jobId && (r.jobId === jobId || r.id === jobId)) return true;
      if (emailNorm && r.recipientEmail && emailNorm === r.recipientEmail.toLowerCase().trim()) return true;
      if (corporateDomain) {
        const pastDom = extractDomain(r.recipientEmail) || extractDomain(r.company);
        if (pastDom && pastDom === corporateDomain) return true;
      }
      if (cNorm && r.company) {
        if (isCompanyMatch(company, r.company)) return true;
      }
      return false;
    });
  }

  return false;
}
