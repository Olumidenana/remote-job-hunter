/**
 * BULK DISPATCH: German Market + Re-dispatch Sandbox Entries
 * Sends LIVE Gmail applications to German companies and re-dispatches 3 sandbox entries.
 * Uses Gmail SMTP port 465 / SSL — the only config that works with App Passwords.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';
import {
  ROOT, loadOutbox, saveOutbox, buildGuardSets, alreadyContacted, normalizeCompany, hasMXRecord, delay
} from './outbox-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually (ESM doesn't support dotenv require) ──────────────
const envPath = path.join(ROOT, '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const [k, ...rest] = line.trim().split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
}

const GMAIL_USER = env.GMAIL_USER;
const GMAIL_PASS = env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD missing from .env.local');
  process.exit(1);
}

console.log(`\n✅ Credentials loaded: ${GMAIL_USER}`);

// ── Nodemailer transporter (port 465 / SSL — the ONLY working config) ─────────
const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ── CV paths ──────────────────────────────────────────────────────────────────
const CV_DIR = path.join(ROOT, 'public', 'cv');
const CV_DE  = path.join(CV_DIR, 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf');
const CV_EN  = path.join(CV_DIR, 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf');
const CV_QT  = path.join(CV_DIR, 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf');

// ── Outbox path ───────────────────────────────────────────────────────────────
const OUTBOX_PATH = path.join(ROOT, 'data', 'outbox.json');

// ── Candidate constants ───────────────────────────────────────────────────────
const CANDIDATE = 'Olumide Adeyemi-Nana';
const PORTFOLIO = 'https://olumide-portfolio-ten.vercel.app';
const GITHUB    = 'github.com/Olumidenana';
const LINKEDIN  = 'linkedin.com/in/olumideadeyemi-nana';
const PHONE     = '+234 814 964 0122';

// ── German cover letter generator ─────────────────────────────────────────────
function germanCoverLetter(company, role) {
  return `Sehr geehrte Damen und Herren,

mit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle als ${role} bei ${company}.

Mein Name ist Olumide Adeyemi-Nana. Ich bin ein erfahrener Full-Stack Systems Architect mit nachweislicher Erfolgsbilanz in der Entwicklung hochleistungsfähiger, verteilter Systeme. Mein Abschluss in Maschinenbau an der Obafemi Awolowo University hat mir eine starke analytische Grundlage gegeben, die ich auf komplexe Software-Architekturfragen anwende.

**Relevante Leistungen:**

- **ChopOS** – Entwicklung eines verteilten Zahlungssystems mit 100%iger Eliminierung von Doppelausgaben durch Row-Level ACID Locking. Zero Concurrency Failures in Produktion.
- **GOD'S EYE** – Echtzeit-Marktdaten-Engine mit 73+ parallelen WebSocket-Streams, 16/16 Test-Suiten bestanden, Sub-100ms Ausführungslatenz.
- **Resend Mission Control** – Live deployed Analytics-Dashboard für Transaktions-E-Mail-Infrastruktur.

Mein technisches Profil umfasst: TypeScript/Node.js, React/Next.js, Python, PostgreSQL, Redis, WebSockets, REST & GraphQL APIs, Docker, CI/CD Pipelines sowie Cloud-Architekturen.

Ich bin remote-first verfügbar und bringe Erfahrung in agilen, internationalen Teams mit. Als nigerianischer Staatsangehöriger mit stabiler Infrastruktur und GMT+1-Zeitzone bin ich optimal auf den deutschen Markt ausgerichtet.

Meinen Lebenslauf füge ich dieser Bewerbung bei. Über die Möglichkeit eines Gesprächs würde ich mich sehr freuen.

Mit freundlichen Grüßen,
${CANDIDATE}
📧 ${GMAIL_USER}
📱 ${PHONE}
🌐 Portfolio: ${PORTFOLIO}
💼 LinkedIn: https://${LINKEDIN}
🐙 GitHub: https://${GITHUB}`;
}

// ── English cover letter generator ────────────────────────────────────────────
function englishCoverLetter(company, role, extraContext = '') {
  return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position at ${company}.

My name is Olumide Adeyemi-Nana — a Full-Stack Systems Architect and distributed systems engineer with a track record of building high-performance, production-grade systems under real-world constraints.

**Key Achievements:**

- **ChopOS** – Engineered a distributed payment processing system achieving 100% elimination of double-spending via row-level ACID locking. Zero concurrency failures in production.
- **GOD'S EYE** – Built a real-time market data engine managing 73+ concurrent WebSocket streams, passing 16/16 test suites with sub-100ms execution latency.
- **Resend Mission Control** – Live-deployed analytics dashboard for transactional email infrastructure, demonstrating end-to-end full-stack ownership.

**Technical Stack**: TypeScript, Node.js, React/Next.js, Python, PostgreSQL, Redis, WebSockets, REST & GraphQL APIs, Docker, CI/CD, Cloud Architecture.
${extraContext}
I am a remote-first engineer, fully available for async collaboration across time zones. I bring structured thinking, production discipline, and architectural depth to every system I build.

My CV is attached. I would welcome the opportunity to discuss how my background aligns with your team's goals.

Best regards,
${CANDIDATE}
📧 ${GMAIL_USER}
📱 ${PHONE}
🌐 Portfolio: ${PORTFOLIO}
💼 LinkedIn: https://${LINKEDIN}
🐙 GitHub: https://${GITHUB}`;
}

// ── German company targets ─────────────────────────────────────────────────────
const GERMAN_TARGETS = [
  {
    company: 'Scalable Capital',
    email: 'careers@scalable.capital',
    role: 'Backend / Systems Engineer',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'München / Remote',
  },
  {
    company: 'Trade Republic',
    email: 'jobs@traderepublic.com',
    role: 'Software Engineer — Infrastructure & Backend',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'Berlin',
  },
  {
    company: 'Raisin',
    email: 'careers@raisin.com',
    role: 'Full-Stack Engineer — FinTech Platform',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'Berlin / Remote',
  },
  {
    company: 'Personio',
    email: 'engineering@personio.com',
    role: 'Software Engineer — Distributed Systems',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'München / Remote',
  },
  {
    company: 'BIT Capital GmbH',
    email: 'careers@bit-capital.com',
    role: 'Algorithmic Trading Systems Engineer',
    language: 'de',
    cv: CV_QT,
    cvName: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    location: 'Berlin',
  },
  {
    company: 'Celonis',
    email: 'careers@celonis.com',
    role: 'Backend Engineer — Process Mining Platform',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'München',
  },
  {
    company: 'Solaris SE',
    email: 'engineering@solarisgroup.com',
    role: 'Software Engineer — Banking Infrastructure',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'Berlin',
  },
  {
    company: 'Taxfix',
    email: 'tech@taxfix.de',
    role: 'Full-Stack Engineer — Tax Platform',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'Berlin / Remote',
  },
  {
    company: 'XALT Business Consulting',
    email: 'careers@xalt.de',
    role: 'Cloud Architect / Solutions Architect',
    language: 'de',
    cv: CV_DE,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    location: 'München',
  },
];

// ── Sandbox re-dispatch targets ────────────────────────────────────────────────
const REDISPATCH_TARGETS = [
  {
    id: 'seed-1',
    company: 'Vexcash AG',
    email: 'jobs@vexcashag.com',
    role: 'Software Developer .NET / C#',
    language: 'en',
    cv: CV_EN,
    cvName: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    extra: '\nI am particularly drawn to Vexcash\'s focus on accessible digital lending in the German market, and I am confident my distributed systems expertise can support your platform\'s growth.\n',
  },
  {
    id: 'seed-2',
    company: 'FinTech & Escrow Platforms',
    email: 'engineering@fintech-settlements.com',
    role: 'Systems Architect — Payment Concurrency & ACID Locking',
    language: 'en',
    cv: CV_EN,
    cvName: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    extra: '\nMy ChopOS implementation directly solves the payment reconciliation race conditions that plague escrow and settlement systems — I would welcome a conversation about applying this architecture to your platform.\n',
  },
  {
    id: 'seed-3',
    company: 'Algorithmic Trading & Prop Desks',
    email: 'recruiting@quant-propdesks.com',
    role: 'Quantitative / Algorithmic Trading Systems Engineer',
    language: 'en',
    cv: CV_QT,
    cvName: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    extra: '\nMy GOD\'S EYE system — managing 73+ concurrent WebSocket streams with sub-100ms latency — directly targets the order routing latency bleed that costs alpha during volatility windows.\n',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadOutbox() {
  if (!fs.existsSync(OUTBOX_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(OUTBOX_PATH, 'utf8')); }
  catch { return []; }
}

function saveOutbox(entries) {
  fs.mkdirSync(path.dirname(OUTBOX_PATH), { recursive: true });
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

// ── Main dispatch ─────────────────────────────────────────────────────────────
async function main() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  JOB HUNTER — BULK DISPATCH ENGINE');
  console.log('  German Market + Sandbox Re-dispatch');
  console.log('════════════════════════════════════════════════════════\n');

  const outbox = loadOutbox();
  const alreadySentTo = new Set(
    outbox
      .filter(e => e.deliveryMode === 'LIVE_COMPANY_INBOX')
      .map(e => e.recipientEmail.toLowerCase())
  );

  const results = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // ── 1. German targets ──────────────────────────────────────────────────────
  console.log(`\n🇩🇪  GERMAN MARKET — ${GERMAN_TARGETS.length} targets\n`);

  for (const target of GERMAN_TARGETS) {
    const emailLC = target.email.toLowerCase();
    if (alreadySentTo.has(emailLC)) {
      console.log(`⏭️  SKIP (already sent): ${target.company} <${target.email}>`);
      skipped++;
      continue;
    }

    const isDE = target.language === 'de';
    const subject = isDE
      ? `Bewerbung: ${target.role} – ${CANDIDATE}`
      : `Application: ${target.role} – ${CANDIDATE}`;
    const body = isDE
      ? germanCoverLetter(target.company, target.role)
      : englishCoverLetter(target.company, target.role);

    const mailOptions = {
      from: `"${CANDIDATE}" <${GMAIL_USER}>`,
      to: target.email,
      bcc: GMAIL_USER,
      subject,
      text: body,
      attachments: [
        {
          filename: target.cvName,
          path: target.cv,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      console.log(`📤 Sending → ${target.company} <${target.email}> ...`);
      const info = await transporter.sendMail(mailOptions);
      const sentAt = new Date().toISOString();
      console.log(`   ✅ SENT  |  MessageID: ${info.messageId}`);
      console.log(`   📎 CV: ${target.cvName}`);
      console.log(`   🕐 ${sentAt}\n`);

      results.push({
        id: `dispatch-de-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        type: 'JOB_APP',
        jobId: `german-${target.company.toLowerCase().replace(/\s+/g,'-')}`,
        company: target.company,
        jobTitle: target.role,
        recipientEmail: target.email,
        companyEmailPicked: target.email,
        actualDeliveredTo: target.email,
        deliveryMode: 'LIVE_COMPANY_INBOX',
        subject,
        status: 'SENT',
        sentAt,
        cvAttached: target.cvName,
        messageId: info.messageId,
        language: target.language,
        market: 'GERMAN_DACH',
        complianceNotes: ['Bulk German market dispatch — Gmail direct SMTP port 465'],
      });

      alreadySentTo.add(emailLC);
      sent++;
      await delay(1500);
    } catch (err) {
      console.error(`   ❌ FAILED: ${target.company}: ${err.message}\n`);
      failed++;
    }
  }

  // ── 2. Sandbox re-dispatches ───────────────────────────────────────────────
  console.log(`\n🔁  SANDBOX RE-DISPATCH — ${REDISPATCH_TARGETS.length} entries\n`);

  for (const target of REDISPATCH_TARGETS) {
    const emailLC = target.email.toLowerCase();
    if (alreadySentTo.has(emailLC)) {
      console.log(`⏭️  SKIP (already live-sent): ${target.company} <${target.email}>`);
      skipped++;
      continue;
    }

    const subject = `Application: ${target.role} – ${CANDIDATE}`;
    const body = englishCoverLetter(target.company, target.role, target.extra);

    const mailOptions = {
      from: `"${CANDIDATE}" <${GMAIL_USER}>`,
      to: target.email,
      bcc: GMAIL_USER,
      subject,
      text: body,
      attachments: [
        {
          filename: target.cvName,
          path: target.cv,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      console.log(`📤 Re-dispatching → ${target.company} <${target.email}> ...`);
      const info = await transporter.sendMail(mailOptions);
      const sentAt = new Date().toISOString();
      console.log(`   ✅ SENT  |  MessageID: ${info.messageId}`);
      console.log(`   📎 CV: ${target.cvName}`);
      console.log(`   🕐 ${sentAt}\n`);

      // Update the matching outbox entry to LIVE_COMPANY_INBOX
      const existing = outbox.find(e => e.id === target.id);
      if (existing) {
        existing.deliveryMode = 'LIVE_COMPANY_INBOX';
        existing.actualDeliveredTo = target.email;
        existing.messageId = info.messageId;
        existing.redispatchedAt = sentAt;
        existing.status = 'SENT';
        existing.complianceNotes = [
          ...(existing.complianceNotes || []),
          `Re-dispatched LIVE via Gmail SMTP ${sentAt}`,
        ];
      }

      results.push({
        id: `redispatch-${target.id}-${Date.now()}`,
        type: 'JOB_APP',
        jobId: `redispatch-${target.id}`,
        company: target.company,
        jobTitle: target.role,
        recipientEmail: target.email,
        companyEmailPicked: target.email,
        actualDeliveredTo: target.email,
        deliveryMode: 'LIVE_COMPANY_INBOX',
        subject,
        status: 'SENT',
        sentAt,
        cvAttached: target.cvName,
        messageId: info.messageId,
        market: 'GLOBAL',
        complianceNotes: ['Re-dispatched from SANDBOX_FORWARD_READY → LIVE_COMPANY_INBOX via Gmail SMTP'],
      });

      alreadySentTo.add(emailLC);
      sent++;
      await delay(1500);
    } catch (err) {
      console.error(`   ❌ FAILED: ${target.company}: ${err.message}\n`);
      failed++;
    }
  }

  // ── 3. Persist outbox ──────────────────────────────────────────────────────
  const updatedOutbox = [...outbox, ...results];
  saveOutbox(updatedOutbox);
  console.log(`\n💾 outbox.json updated → ${updatedOutbox.length} total entries`);

  // ── 4. Summary ─────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log(`  DISPATCH COMPLETE`);
  console.log(`  ✅ Sent:    ${sent}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log('════════════════════════════════════════════════════════');

  if (results.length > 0) {
    console.log('\n📋 PROOF OF DISPATCH:\n');
    for (const r of results) {
      console.log(`  • ${r.company}`);
      console.log(`    To:        ${r.recipientEmail}`);
      console.log(`    Subject:   ${r.subject}`);
      console.log(`    CV:        ${r.cvAttached}`);
      console.log(`    MessageID: ${r.messageId}`);
      console.log(`    SentAt:    ${r.sentAt}`);
      console.log('');
    }
  }

  console.log('✅ Check your Gmail Sent folder — each company should appear there.');
  console.log('   BCC copies sent to olumideadeyeminana@gmail.com as confirmation.\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
