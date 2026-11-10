/**
 * SHARED OUTBOX UTILITIES
 * Used by ALL dispatch scripts to guarantee no duplicate sends
 * — deduplicates by BOTH email address AND normalized company name
 */

import dns from 'dns/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const OUTBOX_PATH = path.join(ROOT, 'data/outbox.json');

/** Normalize company name for dedup comparison.
 *  "BIT Capital GmbH" == "BIT Capital" == "bitcap" etc.
 */
export function normalizeCompany(name = '') {
  return name.toLowerCase()
    .replace(/\b(gmbh|ag|se|inc|ltd|llc|plc|corp|group|trading|platforms?|desks?|firms?|technologies|tech|solutions|services|systems)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/** Load outbox JSON safely */
export function loadOutbox() {
  if (!fs.existsSync(OUTBOX_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(OUTBOX_PATH, 'utf8')); } catch { return []; }
}

/** Save outbox JSON */
export function saveOutbox(entries) {
  fs.mkdirSync(path.dirname(OUTBOX_PATH), { recursive: true });
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

/**
 * Build TWO guard sets from the outbox:
 *  - alreadySentEmails: Set of lowercase email addresses already sent to
 *  - alreadySentCompanies: Set of normalized company names already sent to
 * A target is SKIPPED if EITHER its email OR its company name is already present.
 */
export function buildGuardSets(outbox) {
  const alreadySentEmails = new Set();
  const alreadySentCompanies = new Set();

  for (const e of outbox) {
    if (e.deliveryMode === 'LIVE_COMPANY_INBOX') {
      alreadySentEmails.add(e.recipientEmail.toLowerCase());
      alreadySentCompanies.add(normalizeCompany(e.company));
    }
  }

  return { alreadySentEmails, alreadySentCompanies };
}

/**
 * Returns true if this target has ALREADY been contacted
 * (checks both email AND company name)
 */
export function alreadyContacted(target, alreadySentEmails, alreadySentCompanies) {
  if (alreadySentEmails.has(target.email.toLowerCase())) return true;
  if (alreadySentCompanies.has(normalizeCompany(target.company))) return true;
  return false;
}

/** DNS MX check — returns true if domain has a real mail server */
export async function hasMXRecord(email) {
  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
