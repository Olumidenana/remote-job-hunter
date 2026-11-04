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
  } catch (err) {
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
  } catch (err) {
    // fallback to memory
  }
  return memoryOutbox;
}

export function recordApplication(record: ApplicationRecord): void {
  try {
    // Update memory cache
    memoryOutbox = [record, ...memoryOutbox.filter(r => r.jobId !== record.jobId)].slice(0, 100);

    ensureDataDir();
    const existing = getApplicationHistory();
    const updated = [record, ...existing.filter(r => r.jobId !== record.jobId)].slice(0, 100);
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    // Filesystem error handled, in-memory cache still holds state
  }
}

export function isAlreadyApplied(jobId: string): boolean {
  const history = getApplicationHistory();
  return history.some(r => r.jobId === jobId);
}
