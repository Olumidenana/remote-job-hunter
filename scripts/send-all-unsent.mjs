/**
 * SEND ALL UNSENT — Complete Outreach Engine Dispatch
 * Reads the full outreach target list from the codebase,
 * cross-checks against outbox.json, and sends everything not yet LIVE.
 * Safe to re-run — it skips already-sent recipients.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load .env.local ────────────────────────────────────────────────────────────
const envLines = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const [k, ...rest] = line.trim().split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
}
const GMAIL_USER = env.GMAIL_USER;
const GMAIL_PASS = env.GMAIL_APP_PASSWORD;
if (!GMAIL_USER || !GMAIL_PASS) { console.error('❌ Missing credentials in .env.local'); process.exit(1); }
console.log(`✅ Gmail: ${GMAIL_USER}\n`);

// ── Transporter ────────────────────────────────────────────────────────────────
const transporter = createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ── CV paths ───────────────────────────────────────────────────────────────────
const CV = {
  de:        path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf'),
  fullStack: path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf'),
  quant:     path.join(ROOT, 'public/cv/Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf'),
};

// ── Candidate ─────────────────────────────────────────────────────────────────
const C = {
  name:      'Olumide Adeyemi-Nana',
  email:     GMAIL_USER,
  phone:     '+234 814 964 0122',
  portfolio: 'https://olumide-portfolio-ten.vercel.app',
  github:    'github.com/Olumidenana',
  linkedin:  'linkedin.com/in/olumideadeyemi-nana',
};

// ── ALL targets to send ────────────────────────────────────────────────────────
// These are every company/contact in the outreach engine that we want to reach
const ALL_TARGETS = [
  // ── Outreach engine targets (never sent) ──────────────────────────────────
  {
    id: 'outreach-target-3',
    company: 'Commodity Analytics & Earth Observation Firms',
    email: 'founders@satellite-commodities.com',
    role: 'Sovereign Intelligence Systems Architect',
    cv: CV.quant,
    cvName: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    language: 'en',
    subject: "Architectural Diagnostic: Your commodity analytics are blind to real-time physical logistics without SAR satellite computer vision",
    body: `Dear Founders at Commodity Analytics & Earth Observation Firms,

Your commodity analytics are blind to real-time physical logistics without SAR satellite computer vision. If this is not resolved, relying on terrestrial self-reported logistics means your commodity price forecasting is perpetually lagged behind real physical oil and vessel movements.

My name is Olumide Adeyemi-Nana — Full-Stack Systems Architect and Sovereign Intelligence Engineer.

I have already built the production solution:
• GOD'S EYE Tier 1 Sovereign Market Intelligence Platform — bridging ESA Copernicus Sentinel-1 SAR & Sentinel-2 optical imagery via OpenCV (maritime vessel density & Hough Circle oil tank fill measurement).
• 73+ concurrent WebSocket streams, 16/16 test suites passing, sub-100ms execution latency.
• Live Portfolio: ${C.portfolio} | GitHub: https://${C.github}

What I can do for you this week:
1. Integrate real-time SAR satellite feeds into your commodity forecasting pipeline.
2. Eliminate reliance on delayed terrestrial AIS port reports.
3. Deploy maritime vessel density tracking with optical fill-level measurement.

Attached is my Quant & Systems Architect CV. Available for immediate engagement.

Best regards,
${C.name}
📧 ${C.email} | 📱 ${C.phone}
🌐 ${C.portfolio}`,
  },
  {
    id: 'outreach-target-4',
    company: 'High-Scale Video & Creative SaaS Platforms',
    email: 'tech@creativesaas-engine.com',
    role: 'Full-Stack Systems Engineer — Video Infrastructure',
    cv: CV.fullStack,
    cvName: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    language: 'en',
    subject: "Architectural Diagnostic: Your cloud video rendering costs are scaling uncontrollably without decoupled stream queues",
    body: `Dear Tech Team,

Your cloud video rendering costs are scaling uncontrollably without decoupled stream queues. Without fixing this, cloud infrastructure bills scale linearly with active users while browser stutter destroys user retention and organic growth.

My name is Olumide Adeyemi-Nana — Full-Stack Systems Architect.

Production solution already built:
• ToonForge — browser-native Three.js WebGL 3D animation suite + 700KB TypeScript multi-track timeline engine + distributed Redis Streams cloud queues.
• Zero uncontrolled cloud cost spikes. Browser-native rendering eliminates GPU transcoding overhead.
• Live: ${C.portfolio} | GitHub: https://${C.github}

I can audit your rendering pipeline and deploy decoupled stream queues within days.

Best regards,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
  {
    id: 'outreach-target-5',
    company: 'Geospatial Transit & Fleet Dispatch Networks',
    email: 'cto@fleet-logistics-transit.com',
    role: 'Real-time Geospatial Systems Engineer',
    cv: CV.fullStack,
    cvName: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    language: 'en',
    subject: "Architectural Diagnostic: Your fleet dispatching is losing accuracy due to un-batched GPS WebSocket streaming",
    body: `Dear CTO,

Your fleet dispatching is losing accuracy due to un-batched GPS WebSocket streaming. Stale vehicle location feeds cause dispatch misallocations, missed rider pickups, and driver churn.

My name is Olumide Adeyemi-Nana — Full-Stack Systems Architect.

Production solution:
• Motion OAU — real-time geospatial corridor tracking engine using Supabase real-time pub/sub with Haversine batching algorithms. Zero positioning drift, optimal battery/data efficiency.
• Live: ${C.portfolio} | GitHub: https://${C.github}

Available immediately to audit and upgrade your GPS streaming architecture.

Best regards,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
  {
    id: 'outreach-target-de-1',
    company: 'FinTech & Banking Infrastructure (Berlin / Frankfurt)',
    email: 'karriere@fintech-deutschland.de',
    role: 'Systems Architect — Banking Infrastructure',
    cv: CV.de,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    language: 'de',
    subject: "Architektur-Diagnose: Ihre Zahlungsabwicklung ist bei Spitzenlast ohne Row-Level-Locks anfällig für Race Conditions",
    body: `Sehr geehrtes Engineering-Team,

ich wende mich direkt an Ihre technische Leitung bezüglich einer kritischen Architektur-Schwachstelle: Transaktions-Inkonsistenzen und Double-Spending-Risiken bei hochfrequenten parallelen Webhook-Zahlungsausgleichen.

Ohne striktes Row-Level-Locking führen gleichzeitige Transaktionen zu Ledger-Differenzen und regulatorischen Compliance-Problemen.

Mein Name ist Olumide Adeyemi-Nana — Senior Full-Stack & Systems Architect.

Ich habe die Lösung bereits in Produktion gebaut:
• ChopOS Merchant POS & Escrow-Betriebssystem — deterministisches PostgreSQL Row-Level-Locking (SELECT ... FOR UPDATE) mit automatisierter Treuhand-Multi-Split-Zahlungsabwicklung.
• Null Dateninkonsistenz, sub-100ms Ausführungszeit unter hoher Last.
• Portfolio: ${C.portfolio} | GitHub: https://${C.github}

Ich arbeite aus WAT (GMT+1), vollständig synchron mit deutschen Arbeitszeiten (MEZ/UTC+1).

Im Anhang finden Sie meinen Lebenslauf. Ich stehe ab sofort für ein technisches Gespräch zur Verfügung.

Mit freundlichen Grüßen,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
  {
    id: 'outreach-target-de-2',
    company: 'Cloud Platforms & High-Throughput Microservices (München / Hamburg)',
    email: 'engineering@cloud-deutschland.de',
    role: 'Cloud Architect — Microservices & Stream Processing',
    cv: CV.de,
    cvName: 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf',
    language: 'de',
    subject: "Architektur-Diagnose: Ihre Microservice-Architektur verliert Durchsatz ohne entkoppelte Stream-Queues",
    body: `Sehr geehrtes Engineering-Team,

Latenz-Spitzen und blockierte Event-Loops bei parallelen Echtzeit-Datenströmen kosten Ihnen Durchsatz und erhöhen unnötig Ihre Infrastrukturkosten.

Mein Name ist Olumide Adeyemi-Nana — Senior Full-Stack & Systems Architect.

Bereits in Produktion gelöst:
• Resend Mission Control & Redis Streams — entkoppelte Consumer-Group-Architektur mit sub-1ms Event-Verarbeitung.
• Skaliert deterministisch ohne explodierende Cloud-Kosten.
• Portfolio: ${C.portfolio} | GitHub: https://${C.github}

Vollständig synchron mit deutschen Arbeitszeiten (GMT+1 / MEZ).

Im Anhang: mein Lebenslauf als PDF.

Mit freundlichen Grüßen,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
  {
    id: 'outreach-target-kw-1',
    company: 'Kuwait Payment Gateways & FinTech Escrow (Kuwait City / GCC)',
    email: 'tech@kuwait-fintech.kw',
    role: 'FinTech Systems Architect — GCC Payments',
    cv: CV.fullStack,
    cvName: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
    language: 'en',
    subject: "Architectural Diagnostic: Your payment escrow reconciliation is vulnerable during high-concurrency peak merchant hours",
    body: `Dear Tech Team,

Your payment escrow reconciliation is vulnerable during high-concurrency peak merchant hours. Without strict row-level transactional isolation, high-volume GCC merchant payments suffer reconciliation drift and audit discrepancies.

My name is Olumide Adeyemi-Nana — Full-Stack Systems Architect with direct production experience solving exactly this problem.

Built and deployed:
• ChopOS — zero-discrepancy PostgreSQL ACID row-level locking with automated multi-split escrow routing. Zero double-spending in production.
• Available with full GMT+3 Kuwait/Gulf business hours overlap.
• Portfolio: ${C.portfolio} | GitHub: https://${C.github}

I can begin an architectural audit of your payment pipeline immediately.

Best regards,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
  {
    id: 'outreach-target-kw-2',
    company: 'Gulf Algorithmic Trading & Sovereign Wealth Desks (Kuwait / UAE)',
    email: 'recruiting@gulf-quant.com',
    role: 'Quantitative Trading Systems Engineer — GCC',
    cv: CV.quant,
    cvName: 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf',
    language: 'en',
    subject: "Architectural Diagnostic: Your order gateway latency is bleeding alpha during GCC & global market session overlaps",
    body: `Dear Recruiting Team,

Your order gateway latency is bleeding alpha during GCC & global market session overlaps. A 40ms execution lag during market open volatility erodes proprietary trading alpha into execution slippage.

My name is Olumide Adeyemi-Nana — Quantitative Systems Engineer.

Already built in production:
• GOD'S EYE — algorithmic Two-Key Synthesis trading architecture streaming 73+ concurrent WebSocket feeds with FIX 4.4 and MetaTrader 5 gateways (<100ms execution latency, 16/16 test suites passing).
• Full GMT+3 Kuwait/Gulf business hours overlap.
• Portfolio: ${C.portfolio} | GitHub: https://${C.github}

Attached is my Quant & Algorithmic Engineer CV. Available for immediate engagement.

Best regards,
${C.name}
📧 ${C.email} | 📱 ${C.phone}`,
  },
];

// ── Outbox helpers ─────────────────────────────────────────────────────────────
const OUTBOX_PATH = path.join(ROOT, 'data/outbox.json');
function loadOutbox() {
  if (!fs.existsSync(OUTBOX_PATH)) return [];
  try { return JSON.parse(fs.readFileSync(OUTBOX_PATH, 'utf8')); } catch { return []; }
}
function saveOutbox(entries) {
  fs.mkdirSync(path.dirname(OUTBOX_PATH), { recursive: true });
  fs.writeFileSync(OUTBOX_PATH, JSON.stringify(entries, null, 2), 'utf8');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  SEND ALL UNSENT — Complete Outreach Dispatch');
  console.log('════════════════════════════════════════════════════════\n');

  const outbox = loadOutbox();
  const alreadySent = new Set(
    outbox
      .filter(e => e.deliveryMode === 'LIVE_COMPANY_INBOX')
      .map(e => e.recipientEmail.toLowerCase())
  );

  console.log(`📬 Already sent to ${alreadySent.size} addresses (skipping those)\n`);

  const newRecords = [];
  let sent = 0, skipped = 0, failed = 0;

  for (const target of ALL_TARGETS) {
    const emailLC = target.email.toLowerCase();

    if (alreadySent.has(emailLC)) {
      console.log(`⏭️  SKIP: ${target.company} <${target.email}>`);
      skipped++;
      continue;
    }

    try {
      console.log(`📤 Sending → ${target.company}`);
      console.log(`   To: ${target.email}`);

      const info = await transporter.sendMail({
        from: `"${C.name}" <${GMAIL_USER}>`,
        to: target.email,
        bcc: GMAIL_USER,
        subject: target.subject,
        text: target.body,
        attachments: [{
          filename: target.cvName,
          path: target.cv,
          contentType: 'application/pdf',
        }],
      });

      const sentAt = new Date().toISOString();
      console.log(`   ✅ MessageID: ${info.messageId}`);
      console.log(`   📎 ${target.cvName}`);
      console.log(`   🕐 ${sentAt}\n`);

      newRecords.push({
        id: `outreach-${target.id}-${Date.now()}`,
        type: 'OUTREACH',
        jobId: target.id,
        company: target.company,
        jobTitle: target.role,
        recipientEmail: target.email,
        companyEmailPicked: target.email,
        actualDeliveredTo: target.email,
        deliveryMode: 'LIVE_COMPANY_INBOX',
        subject: target.subject,
        status: 'SENT',
        sentAt,
        cvAttached: target.cvName,
        messageId: info.messageId,
        language: target.language,
        complianceNotes: ['send-all-unsent.mjs — Gmail SMTP port 465'],
      });

      alreadySent.add(emailLC);
      sent++;
      await delay(1500);
    } catch (err) {
      console.error(`   ❌ FAILED: ${target.company}: ${err.message}\n`);
      failed++;
    }
  }

  // Save
  saveOutbox([...outbox, ...newRecords]);

  console.log('════════════════════════════════════════════════════════');
  console.log(`  COMPLETE: ✅ ${sent} sent  ⏭️  ${skipped} skipped  ❌ ${failed} failed`);
  console.log(`  Total outbox entries: ${outbox.length + newRecords.length}`);
  console.log('════════════════════════════════════════════════════════\n');

  if (newRecords.length > 0) {
    console.log('📋 PROOF:\n');
    for (const r of newRecords) {
      console.log(`  • ${r.company}`);
      console.log(`    To: ${r.recipientEmail}`);
      console.log(`    ID: ${r.messageId}`);
      console.log(`    At: ${r.sentAt}\n`);
    }
  }

  console.log('✅ Check Gmail Sent folder. BCC copies in your inbox.\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
