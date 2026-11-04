import fs from 'fs';
import path from 'path';
import { ApplicationRecord } from '@/types/job';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getApplicationHistory(): ApplicationRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(OUTBOX_FILE)) {
      const data = fs.readFileSync(OUTBOX_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading outbox history:', err);
  }
  return [];
}

export function recordApplication(record: ApplicationRecord): void {
  try {
    ensureDataDir();
    const existing = getApplicationHistory();
    // Prepend new record
    const updated = [record, ...existing.filter(r => r.jobId !== record.jobId)];
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(updated.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error recording application to outbox:', err);
  }
}

export function isAlreadyApplied(jobId: string): boolean {
  const history = getApplicationHistory();
  return history.some(r => r.jobId === jobId);
}
