/**
 * VERIFIED BULK DISPATCH — DNS-checked real company targets only
 * 
 * Rules:
 * 1. Every domain is MX-checked before sending — if no MX record, skip & log
 * 2. Never sends to fake/placeholder domains
 * 3. Skips any email already in outbox as LIVE_COMPANY_INBOX
 * 4. BCC candidate on every send
 * 5. 1500ms delay between sends (Gmail rate limit safety)
 */

import dns from 'dns/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Credentials ────────────────────────────────────────────────────────────────
const envLines = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const [k, ...rest] = line.trim().split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
}
const GMAIL_USER = env.GMAIL_USER;
const GMAIL_PASS = env.GMAIL_APP_PASSWORD;
if (!GMAIL_USER || !GMAIL_PASS) { console.error('❌ Missing .env.local credentials'); process.exit(1); }
console.log(`✅ Gmail: ${GMAIL_USER}\n`);

// ── Transporter ────────────────────────────────────────────────────────────────
const transporter = createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ── CV paths ───────────────────────────────────────────────────────────────────
const CV_DE = path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf');
const CV_EN = path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf');
const CV_QT = path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf');

// ── Candidate ─────────────────────────────────────────────────────────────────
const C = {
  name: 'Olumide Adeyemi-Nana',
  email: GMAIL_USER,
  phone: '+234 814 964 0122',
  portfolio: 'https://olumide-portfolio-ten.vercel.app',
  github: 'github.com/Olumidenana',
  linkedin: 'linkedin.com/in/olumideadeyemi-nana',
};

// ── DNS MX verification ────────────────────────────────────────────────────────
async function hasMXRecord(email) {
  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

// ── Cover letter generators ────────────────────────────────────────────────────
function deCoverLetter(company, role) {
  return `Sehr geehrte Damen und Herren,

mit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle als ${role} bei ${company}.

Mein Name ist Olumide Adeyemi-Nana. Ich bin ein erfahrener Full-Stack Systems Architect mit nachweislicher Erfolgsbilanz in der Entwicklung hochleistungsfähiger, verteilter Systeme. Mein Abschluss in Maschinenbau an der Obafemi Awolowo University hat mir eine starke analytische Grundlage gegeben.

Relevante Leistungen:
• ChopOS – 100%ige Eliminierung von Double-Spending durch PostgreSQL Row-Level ACID Locking. Zero Concurrency Failures in Produktion.
• GOD'S EYE – Echtzeit-Marktdaten-Engine mit 73+ parallelen WebSocket-Streams, 16/16 Test-Suiten, Sub-100ms Latenz.
• Resend Mission Control – Live deployed Analytics-Dashboard für E-Mail-Infrastruktur.

Stack: TypeScript, Node.js, React/Next.js, Python, PostgreSQL, Redis, WebSockets, Docker, CI/CD, Cloud-Architekturen.

Ich bin remote-first verfügbar und arbeite aus GMT+1 — vollständig synchron mit deutschen Arbeitszeiten (MEZ).

Im Anhang finden Sie meinen Lebenslauf. Über ein Gespräch würde ich mich sehr freuen.

Mit freundlichen Grüßen,
${C.name}
📧 ${C.email}  📱 ${C.phone}
🌐 ${C.portfolio}
💼 https://${C.linkedin}`;
}

function enCoverLetter(company, role, extra = '') {
  return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position.

My name is Olumide Adeyemi-Nana — a Full-Stack Systems Architect with a track record of building high-performance, production-grade distributed systems.

Key Achievements:
• ChopOS – Engineered a distributed payment system achieving 100% elimination of double-spending via row-level ACID locking. Zero concurrency failures in production.
• GOD'S EYE – Built a real-time market data engine managing 73+ concurrent WebSocket streams, passing 16/16 test suites with sub-100ms execution latency.
• Resend Mission Control – Live-deployed analytics dashboard for transactional email infrastructure.

Stack: TypeScript, Node.js, React/Next.js, Python, PostgreSQL, Redis, WebSockets, REST & GraphQL APIs, Docker, CI/CD, Cloud Architecture.
${extra}
I am a remote-first engineer, fully available for async collaboration. My CV is attached.

Best regards,
${C.name}
📧 ${C.email}  📱 ${C.phone}
🌐 ${C.portfolio}
💼 https://${C.linkedin}`;
}

// ── REAL verified company targets ──────────────────────────────────────────────
// All domains verified to exist. DNS MX check runs again at send time for safety.
const TARGETS = [
  // ── GERMAN MARKET — corrected & expanded ──────────────────────────────────
  { company: 'N26', email: 'careers@n26.com', role: 'Backend Engineer — Banking Infrastructure', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Vexcash', email: 'jobs@vexcash.com', role: 'Software Developer .NET / C#', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'BIT Capital', email: 'career@bitcap.com', role: 'Algorithmic Trading Systems Engineer', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Mambu', email: 'careers@mambu.com', role: 'Software Engineer — Cloud Banking Platform', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'SumUp', email: 'careers@sumup.com', role: 'Backend Engineer — Payments Infrastructure', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Delivery Hero', email: 'recruiting@deliveryhero.com', role: 'Senior Software Engineer — FinTech Payments', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Zalando', email: 'careers@zalando.de', role: 'Backend Software Engineer — Platform', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'HelloFresh', email: 'careers@hellofresh.com', role: 'Software Engineer — Backend Systems', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'AUTO1 Group', email: 'careers@auto1-group.com', role: 'Software Engineer — Distributed Systems', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Moonpay', email: 'careers@moonpay.com', role: 'Backend Engineer — Crypto Payments Infrastructure', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'ComplyAdvantage', email: 'careers@complyadvantage.com', role: 'Software Engineer — AML / Compliance Tech', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Mollie', email: 'jobs@mollie.com', role: 'Backend Engineer — Payments', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Solarisbank', email: 'jobs@solarisbank.com', role: 'Software Engineer — Banking API', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Penta', email: 'jobs@getpenta.com', role: 'Backend Engineer — B2B Banking', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Qonto', email: 'jobs@qonto.com', role: 'Software Engineer — FinTech Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Bitpanda', email: 'careers@bitpanda.com', role: 'Backend Engineer — Crypto Trading Platform', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Nuri', email: 'jobs@nuri.com', role: 'Software Engineer — Crypto Banking', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Wefox', email: 'jobs@wefox.com', role: 'Software Engineer — InsurTech Platform', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Deposit Solutions', email: 'careers@deposit-solutions.com', role: 'Software Engineer — Open Banking', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },
  { company: 'Contabo', email: 'jobs@contabo.com', role: 'Backend Engineer — Cloud Infrastructure', cv: CV_DE, cvName: 'Lebenslauf_DE.pdf', lang: 'de' },

  // ── GLOBAL REMOTE — real companies with verified domains ──────────────────
  { company: 'GitLab', email: 'careers@gitlab.com', role: 'Senior Backend Engineer — Distributed Systems', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Canonical (Ubuntu)', email: 'careers@canonical.com', role: 'Software Engineer — Cloud & Systems', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Automattic (WordPress)', email: 'apply@automattic.com', role: 'Software Engineer — Distributed Systems', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Supabase', email: 'careers@supabase.io', role: 'Backend Engineer — Database Infrastructure', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Vercel', email: 'careers@vercel.com', role: 'Software Engineer — Edge Infrastructure', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Netlify', email: 'careers@netlify.com', role: 'Software Engineer — Edge / CDN Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'PlanetScale', email: 'careers@planetscale.com', role: 'Software Engineer — Distributed Database', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Railway', email: 'careers@railway.app', role: 'Software Engineer — DevOps Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Liveblocks', email: 'careers@liveblocks.io', role: 'Backend Engineer — Real-time Collaboration', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Upstash', email: 'careers@upstash.com', role: 'Software Engineer — Serverless Redis', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Neon (Serverless Postgres)', email: 'careers@neon.tech', role: 'Software Engineer — Serverless Database', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Turso (LibSQL)', email: 'careers@turso.tech', role: 'Software Engineer — Distributed SQLite', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Appwrite', email: 'careers@appwrite.io', role: 'Backend Engineer — Open Source BaaS', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Resend', email: 'careers@resend.com', role: 'Software Engineer — Email Infrastructure', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en', extra: '\nI am the author of Resend Mission Control — a live analytics dashboard built on top of Resend\'s API, demonstrating deep familiarity with your product.\n' },
  { company: 'Loops', email: 'careers@loops.so', role: 'Software Engineer — Email Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'PostHog', email: 'careers@posthog.com', role: 'Software Engineer — Product Analytics', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Highlight.io', email: 'careers@highlight.io', role: 'Software Engineer — Observability Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Trigger.dev', email: 'careers@trigger.dev', role: 'Backend Engineer — Background Jobs Platform', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Inngest', email: 'careers@inngest.com', role: 'Software Engineer — Event-Driven Infrastructure', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },
  { company: 'Dub.co', email: 'careers@dub.co', role: 'Full-Stack Software Engineer', cv: CV_EN, cvName: 'FullStack_CV.pdf', lang: 'en' },

  // ── QUANTITATIVE / TRADING ─────────────────────────────────────────────────
  { company: 'QuantConnect', email: 'careers@quantconnect.com', role: 'Quantitative Software Engineer', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Alpaca', email: 'careers@alpaca.markets', role: 'Software Engineer — Algorithmic Trading API', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en', extra: '\nI have direct experience building FIX protocol gateways and MetaTrader 5 integrations with sub-100ms execution latency.\n' },
  { company: 'Interactive Brokers', email: 'careers@interactivebrokers.com', role: 'Software Engineer — Trading Systems', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Coinbase', email: 'careers@coinbase.com', role: 'Backend Engineer — Exchange Infrastructure', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Kraken', email: 'careers@kraken.com', role: 'Software Engineer — Trading Platform', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Binance', email: 'careers@binance.com', role: 'Backend Engineer — Exchange Systems', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'OKX', email: 'careers@okx.com', role: 'Software Engineer — High-Frequency Trading Systems', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Deribit', email: 'careers@deribit.com', role: 'Software Engineer — Derivatives Exchange', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Bybit', email: 'careers@bybit.com', role: 'Backend Engineer — Trading Engine', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Dydx', email: 'careers@dydx.exchange', role: 'Software Engineer — Decentralised Exchange', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Wintermute Trading', email: 'careers@wintermute.com', role: 'Quantitative Developer — Algorithmic Market Making', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Cumberland DRW', email: 'careers@cumberlandmining.com', role: 'Software Engineer — Crypto Trading Systems', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
  { company: 'Amber Group', email: 'careers@ambergroup.io', role: 'Software Engineer — Quantitative Trading', cv: CV_QT, cvName: 'Quant_CV.pdf', lang: 'en' },
];

// ── Outbox ─────────────────────────────────────────────────────────────────────
const OUTBOX_PATH = path.join(ROOT, 'data/outbox.json');
function loadOutbox() {
  if (!fs.existsSync(OUTBOX_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(OUTBOX_PATH, 'utf8')); } catch { return []; }
}
function saveOutbox(entries) {
  fs.mkdirSync(path.dirname(OUTBOX_PATH), { recursive: true });
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(entries, null, 2));
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  VERIFIED BULK DISPATCH — DNS-checked targets only');
  console.log(`  ${TARGETS.length} real company targets loaded`);
  console.log('════════════════════════════════════════════════════════\n');

  const outbox = loadOutbox();
  const alreadySent = new Set(
    outbox
      .filter(e => e.deliveryMode === 'LIVE_COMPANY_INBOX')
      .map(e => e.recipientEmail.toLowerCase())
  );
  console.log(`📬 Already sent to ${alreadySent.size} addresses (will skip)\n`);

  const newRecords = [];
  let sent = 0, skipped = 0, noMX = 0, failed = 0;

  for (const t of TARGETS) {
    const emailLC = t.email.toLowerCase();

    if (alreadySent.has(emailLC)) {
      console.log(`⏭️  SKIP (already sent): ${t.company}`);
      skipped++;
      continue;
    }

    // DNS MX check BEFORE attempting send
    process.stdout.write(`🔍 DNS check: ${t.email} ... `);
    const valid = await hasMXRecord(t.email);
    if (!valid) {
      console.log(`❌ NO MX — skipping ${t.company} (${t.email})`);
      noMX++;
      continue;
    }
    console.log(`✅ MX OK`);

    // Pick correct CV file
    const cvPath = t.cvName.includes('Lebenslauf') ? CV_DE
                 : t.cvName.includes('Quant') ? CV_QT
                 : CV_EN;

    // Generate cover letter
    const isDE = t.lang === 'de';
    const subject = isDE
      ? `Bewerbung: ${t.role} – ${C.name}`
      : `Application: ${t.role} – ${C.name}`;
    const body = isDE
      ? deCoverLetter(t.company, t.role)
      : enCoverLetter(t.company, t.role, t.extra || '');

    try {
      process.stdout.write(`📤 Sending → ${t.company} <${t.email}> ... `);
      const info = await transporter.sendMail({
        from: `"${C.name}" <${GMAIL_USER}>`,
        to: t.email,
        bcc: GMAIL_USER,
        subject,
        text: body,
        attachments: [{ filename: t.cvName, path: cvPath, contentType: 'application/pdf' }],
      });
      const sentAt = new Date().toISOString();
      console.log(`✅ ${info.messageId}`);

      newRecords.push({
        id: `verified-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        type: 'JOB_APP',
        company: t.company,
        jobTitle: t.role,
        recipientEmail: t.email,
        actualDeliveredTo: t.email,
        deliveryMode: 'LIVE_COMPANY_INBOX',
        subject,
        status: 'SENT',
        sentAt,
        cvAttached: t.cvName,
        messageId: info.messageId,
        language: t.lang,
        mxVerified: true,
        complianceNotes: ['verified-bulk-dispatch.mjs — DNS MX pre-checked — Gmail SMTP port 465'],
      });

      alreadySent.add(emailLC);
      sent++;
      await delay(1500);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  saveOutbox([...outbox, ...newRecords]);

  console.log('\n════════════════════════════════════════════════════════');
  console.log(`  COMPLETE`);
  console.log(`  ✅ Sent:          ${sent}`);
  console.log(`  ⏭️  Already sent:  ${skipped}`);
  console.log(`  ❌ No MX (fake):  ${noMX}`);
  console.log(`  ❌ Send failed:   ${failed}`);
  console.log(`  📬 Total outbox:  ${outbox.length + newRecords.length}`);
  console.log('════════════════════════════════════════════════════════\n');
  console.log('✅ Every email above was DNS-MX verified before sending.');
  console.log('   Check Gmail Sent — BCC copies in your inbox.\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
