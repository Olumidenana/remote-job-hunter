export interface QuotaStatus {
  date: string; // YYYY-MM-DD (UTC)
  totalSent: number;
  dailyLimit: number;
  remainingTotal: number;
  jobAppCount: number;
  jobAppBudget: number;
  remainingJobApps: number;
  outreachCount: number;
  outreachBudget: number;
  remainingOutreach: number;
  digestCount: number;
  isHardCapped: boolean;
  resetsAt: string;
}

// Resend free tier has 100 emails/day.
// We configure 90 as the safe limit to maintain a 10-email safety buffer.
const DEFAULT_DAILY_LIMIT = 90;
const DEFAULT_JOB_APP_BUDGET = 60;
const DEFAULT_OUTREACH_BUDGET = 30;

function getUtcTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getNextUtcMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.toISOString();
}

let memoryState: {
  date: string;
  jobAppCount: number;
  outreachCount: number;
  digestCount: number;
  isHardCapped: boolean;
} = {
  date: getUtcTodayDate(),
  jobAppCount: 0,
  outreachCount: 0,
  digestCount: 0,
  isHardCapped: false,
};

function readPersistedState() {
  const today = getUtcTodayDate();

  if (typeof window === 'undefined') {
    try {
      // Dynamic require to prevent webpack client bundling issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = eval("require('fs')");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = eval("require('path')");
      const quotaFile = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), '.quota_state.json');

      if (fs.existsSync(quotaFile)) {
        const data = JSON.parse(fs.readFileSync(quotaFile, 'utf-8'));
        if (data && data.date === today) {
          memoryState = {
            date: today,
            jobAppCount: data.jobAppCount || 0,
            outreachCount: data.outreachCount || 0,
            digestCount: data.digestCount || 0,
            isHardCapped: !!data.isHardCapped,
          };
          return;
        }
      }
    } catch {
      // Fallback to in-memory
    }
  }

  // If new day or file not found, reset
  if (memoryState.date !== today) {
    memoryState = {
      date: today,
      jobAppCount: 0,
      outreachCount: 0,
      digestCount: 0,
      isHardCapped: false,
    };
    savePersistedState();
  }
}

function savePersistedState() {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = eval("require('fs')");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = eval("require('path')");
      const quotaFile = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), '.quota_state.json');
      fs.writeFileSync(quotaFile, JSON.stringify(memoryState), 'utf-8');
    } catch {
      // Ignore write errors on read-only environments
    }
  }
}

export function getQuotaStatus(): QuotaStatus {
  readPersistedState();
  const dailyLimit = parseInt(process.env.DAILY_EMAIL_QUOTA || `${DEFAULT_DAILY_LIMIT}`, 10);
  const jobAppBudget = parseInt(process.env.DAILY_JOB_APP_BUDGET || `${DEFAULT_JOB_APP_BUDGET}`, 10);
  const outreachBudget = parseInt(process.env.DAILY_OUTREACH_BUDGET || `${DEFAULT_OUTREACH_BUDGET}`, 10);

  const totalSent = memoryState.jobAppCount + memoryState.outreachCount + (memoryState.digestCount || 0);
  const remainingTotal = Math.max(0, dailyLimit - totalSent);
  const remainingJobApps = Math.max(0, jobAppBudget - memoryState.jobAppCount);
  const remainingOutreach = Math.max(0, outreachBudget - memoryState.outreachCount);

  return {
    date: memoryState.date,
    totalSent,
    dailyLimit,
    remainingTotal: memoryState.isHardCapped ? 0 : remainingTotal,
    jobAppCount: memoryState.jobAppCount,
    jobAppBudget,
    remainingJobApps: memoryState.isHardCapped ? 0 : Math.min(remainingJobApps, remainingTotal),
    outreachCount: memoryState.outreachCount,
    outreachBudget,
    remainingOutreach: memoryState.isHardCapped ? 0 : Math.min(remainingOutreach, remainingTotal),
    digestCount: memoryState.digestCount || 0,
    isHardCapped: memoryState.isHardCapped || remainingTotal <= 0,
    resetsAt: getNextUtcMidnight(),
  };
}

export function canDispatch(type: 'JOB_APP' | 'OUTREACH' | 'DIGEST'): {
  allowed: boolean;
  reason?: string;
  remaining: number;
} {
  const status = getQuotaStatus();

  if (status.isHardCapped || status.remainingTotal <= 0) {
    return {
      allowed: false,
      reason: `Resend daily safety quota reached (${status.totalSent}/${status.dailyLimit} emails sent today). Resets at 00:00 UTC.`,
      remaining: 0,
    };
  }

  if (type === 'DIGEST') {
    return {
      allowed: true,
      remaining: status.remainingTotal,
    };
  }

  if (type === 'JOB_APP' && status.remainingJobApps <= 0) {
    return {
      allowed: false,
      reason: `Daily Job Application budget reached (${status.jobAppCount}/${status.jobAppBudget} apps today). Remaining capacity allocated to outreach.`,
      remaining: 0,
    };
  }

  if (type === 'OUTREACH' && status.remainingOutreach <= 0) {
    return {
      allowed: false,
      reason: `Daily Outreach budget reached (${status.outreachCount}/${status.outreachBudget} pitches today). Remaining capacity allocated to job apps.`,
      remaining: 0,
    };
  }

  const remaining = type === 'JOB_APP' ? status.remainingJobApps : status.remainingOutreach;
  return {
    allowed: true,
    remaining,
  };
}

export function recordDispatchSuccess(type: 'JOB_APP' | 'OUTREACH' | 'DIGEST') {
  readPersistedState();
  if (type === 'JOB_APP') {
    memoryState.jobAppCount += 1;
  } else if (type === 'OUTREACH') {
    memoryState.outreachCount += 1;
  } else if (type === 'DIGEST') {
    memoryState.digestCount = (memoryState.digestCount || 0) + 1;
  }
  savePersistedState();
}

export function markResendDailyLimitExceeded() {
  readPersistedState();
  memoryState.isHardCapped = true;
  savePersistedState();
}

/**
 * Pacing helper: enforces a 600ms gap to avoid Resend's 2 req/second burst limit
 */
export async function paceResendDispatch(ms: number = 650): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
