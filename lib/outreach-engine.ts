import { DEFAULT_CANDIDATE } from './profile';

export type OutreachSector = 
  | 'FINTECH_PAYMENTS'
  | 'QUANT_TRADING'
  | 'SATELLITE_INTELLIGENCE'
  | 'HIGH_CONCURRENCY_SAAS'
  | 'GEOSPATIAL_LOGISTICS'
  | 'GERMAN_FINTECH'
  | 'GERMAN_CLOUD_SAAS'
  | 'KUWAIT_GULF_FINTECH'
  | 'GULF_QUANT_PROP';

export interface OutreachTarget {
  id: string;
  company: string;
  domain: string;
  contactEmail: string;
  sector: OutreachSector;
  diagnosedProblem: string;
  consequenceOfDelay: string;
  solvedBySystem: string;
  candidateFlagshipUsed: string;
  urgencyHook: string;
  recommendedCV: 'FullStack' | 'Quant';
  language?: 'de' | 'en' | 'ar';
  region?: 'GERMANY' | 'KUWAIT_GULF' | 'GLOBAL' | 'US_AMERICAS';
}

export interface DiagnosticPitchPackage {
  target: OutreachTarget;
  subject: string;
  hookPitch: string;
  fullBody: string;
  mailtoUrl: string;
  recommendedCVFile: string;
  recommendedCVName: string;
}

export const CURATED_OUTREACH_TARGETS: OutreachTarget[] = [
  {
    id: 'outreach-target-1',
    company: 'FinTech & Escrow Platforms (Global / EMEA)',
    domain: 'fintech-settlements.com',
    contactEmail: 'engineering@fintech-settlements.com',
    sector: 'FINTECH_PAYMENTS',
    diagnosedProblem: 'Double-spending vulnerability and ledger divergence during high-velocity simultaneous webhook settlements.',
    consequenceOfDelay: 'If you rely on optimistic locking or un-sequenced database commits during peak volume spikes, you will face silent balance discrepancies, escrow disputes, and regulatory compliance audit failures.',
    solvedBySystem: 'ChopOS strict PostgreSQL row-level locks (SELECT ... FOR UPDATE) coupled with automated Paystack multi-split escrow routing.',
    candidateFlagshipUsed: 'ChopOS Merchant POS & Escrow Operating System',
    urgencyHook: 'Your payment reconciliation is vulnerable to concurrency race conditions without row-level ACID locking.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-2',
    company: 'Algorithmic Trading & Prop Desks',
    domain: 'quant-propdesks.com',
    contactEmail: 'recruiting@quant-propdesks.com',
    sector: 'QUANT_TRADING',
    diagnosedProblem: 'Execution latency bleed and tick drops when streaming multiple exchange WebSocket feeds during macroeconomic volatility.',
    consequenceOfDelay: 'A 50ms latency drift during high-impact news events (CPI, NFP) turns profitable alpha into negative execution slippage and liquidation cascades.',
    solvedBySystem: 'ICT Flux high-frequency routing streaming 73+ concurrent live WebSocket feeds with zero-lookahead event sequencing and C FFI bindings to MetaTrader 5.',
    candidateFlagshipUsed: 'ICT Flux Quant Trading Engine & FIX Protocol Gateways',
    urgencyHook: 'Your order routing latency is bleeding alpha during market volatility.',
    recommendedCV: 'Quant',
  },
  {
    id: 'outreach-target-3',
    company: 'Commodity Analytics & Earth Observation Firms',
    domain: 'satellite-commodities.com',
    contactEmail: 'founders@satellite-commodities.com',
    sector: 'SATELLITE_INTELLIGENCE',
    diagnosedProblem: 'Reliance on 24-hour delayed terrestrial port reports while maritime AIS spoofing creates supply chain blind spots.',
    consequenceOfDelay: 'Relying on terrestrial self-reported logistics means your commodity price forecasting is perpetually lagged behind real physical oil and vessel movements.',
    solvedBySystem: "GOD'S EYE institutional sovereign intelligence platform bridging ESA Copernicus Sentinel-1 SAR & Sentinel-2 optical imagery via OpenCV (maritime vessel density & Hough Circle oil tank fill measurement).",
    candidateFlagshipUsed: "GOD'S EYE Tier 1 Sovereign Market Intelligence Platform",
    urgencyHook: 'Your commodity analytics are blind to real-time physical logistics without SAR satellite computer vision.',
    recommendedCV: 'Quant',
  },
  {
    id: 'outreach-target-4',
    company: 'High-Scale Video & Creative SaaS Platforms',
    domain: 'creativesaas-engine.com',
    contactEmail: 'tech@creativesaas-engine.com',
    sector: 'HIGH_CONCURRENCY_SAAS',
    diagnosedProblem: 'Runaway cloud GPU transcoding bills and browser thread blocking during multi-track timeline rendering.',
    consequenceOfDelay: 'Cloud infrastructure bills scale linearly with active users while browser stutter destroys user retention and organic growth.',
    solvedBySystem: 'ToonForge browser-native Three.js WebGL 3D animation suite paired with a 700KB TypeScript multi-track timeline engine and distributed Redis Streams cloud queues.',
    candidateFlagshipUsed: 'ToonForge WebGL & Distributed Video Transcoder SaaS',
    urgencyHook: 'Your cloud video rendering costs are scaling uncontrollably without decoupled stream queues.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-5',
    company: 'Geospatial Transit & Fleet Dispatch Networks',
    domain: 'fleet-logistics-transit.com',
    contactEmail: 'cto@fleet-logistics-transit.com',
    sector: 'GEOSPATIAL_LOGISTICS',
    diagnosedProblem: 'Fleet positioning drift and high battery/data drain from naive polling of GPS coordinates.',
    consequenceOfDelay: 'Stale vehicle location feeds cause dispatch misallocations, missed rider pickups, and driver churn.',
    solvedBySystem: 'Motion OAU transit corridor tracking engine utilizing Supabase real-time pub/sub with Haversine batching algorithms.',
    candidateFlagshipUsed: 'Motion OAU Real-time Geospatial Corridor Network',
    urgencyHook: 'Your fleet dispatching is losing accuracy due to un-batched GPS websocket streaming.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-de-1',
    company: 'FinTech & Banking Infrastructure (Berlin / Frankfurt)',
    domain: 'fintech-deutschland.de',
    contactEmail: 'karriere@fintech-deutschland.de',
    sector: 'GERMAN_FINTECH',
    language: 'de',
    region: 'GERMANY',
    diagnosedProblem: 'Transaktions-Inkonsistenzen und Double-Spending-Risiken bei hochfrequenten parallelen Webhook-Zahlungsausgleichen.',
    consequenceOfDelay: 'Ohne striktes Row-Level-Locking führen gleichzeitige Transaktionen zu Ledger-Differenzen und regulatorischen Compliance-Problemen.',
    solvedBySystem: 'ChopOS deterministisches PostgreSQL Row-Level-Locking (SELECT ... FOR UPDATE) mit automatisierter Treuhand-Multi-Split-Zahlungsabwicklung.',
    candidateFlagshipUsed: 'ChopOS Merchant POS & Escrow-Betriebssystem',
    urgencyHook: 'Ihre Zahlungsabwicklung ist bei Spitzenlast ohne Row-Level-Locks anfällig für Race Conditions.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-de-2',
    company: 'Cloud Platforms & High-Throughput Microservices (München / Hamburg)',
    domain: 'cloud-deutschland.de',
    contactEmail: 'engineering@cloud-deutschland.de',
    sector: 'GERMAN_CLOUD_SAAS',
    language: 'de',
    region: 'GERMANY',
    diagnosedProblem: 'Latenz-Spitzen und blockierte Event-Loops bei parallelen Echtzeit-Datenströmen.',
    consequenceOfDelay: 'Unzureichend entkoppelte Stream-Queues führen zu Latenz-Drifts und hohen Infrastrukturkosten.',
    solvedBySystem: 'Resend Mission Control & Redis Streams entkoppelte Consumer-Group-Architektur mit sub-1ms Event-Verarbeitung.',
    candidateFlagshipUsed: 'Resend Mission Control & Autonome Telemetrie-Engine',
    urgencyHook: 'Ihre Microservice-Architektur verliert Durchsatz ohne entkoppelte Stream-Queues.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-kw-1',
    company: 'Kuwait Payment Gateways & FinTech Escrow (Kuwait City / GCC)',
    domain: 'kuwait-fintech.kw',
    contactEmail: 'tech@kuwait-fintech.kw',
    sector: 'KUWAIT_GULF_FINTECH',
    language: 'en',
    region: 'KUWAIT_GULF',
    diagnosedProblem: 'Settlement divergence and multi-currency reconciliation latency during high-volume merchant processing.',
    consequenceOfDelay: 'Without strict row-level transactional isolation, high-volume GCC merchant payments suffer from reconciliation drift and audit discrepancies.',
    solvedBySystem: 'ChopOS zero-discrepancy PostgreSQL ACID row-level locking with automated multi-split escrow routing.',
    candidateFlagshipUsed: 'ChopOS Merchant POS & Sovereign Escrow Platform',
    urgencyHook: 'Your payment escrow reconciliation is vulnerable during high-concurrency peak merchant hours.',
    recommendedCV: 'FullStack',
  },
  {
    id: 'outreach-target-kw-2',
    company: 'Gulf Algorithmic Trading & Sovereign Wealth Desks (Kuwait / UAE)',
    domain: 'gulf-quant.com',
    contactEmail: 'recruiting@gulf-quant.com',
    sector: 'GULF_QUANT_PROP',
    language: 'en',
    region: 'KUWAIT_GULF',
    diagnosedProblem: 'Tick processing latency bleed and order execution slippage during high-volatility global market open overlaps.',
    consequenceOfDelay: 'A 40ms execution lag during market open volatility erodes proprietary trading alpha into execution slippage.',
    solvedBySystem: "GOD'S EYE algorithmic Two-Key Synthesis trading architecture streaming 73+ concurrent WebSocket feeds with FIX 4.4 and MetaTrader 5 gateways (<100ms execution latency).",
    candidateFlagshipUsed: "GOD'S EYE Sovereign Market Intelligence & Trading Platform",
    urgencyHook: 'Your order gateway latency is bleeding alpha during GCC & global market session overlaps.',
    recommendedCV: 'Quant',
  },
];

export function generateDiagnosticPitch(target: OutreachTarget): DiagnosticPitchPackage {
  const candidate = DEFAULT_CANDIDATE;
  const isQuant = target.recommendedCV === 'Quant';
  let cvFile = isQuant ? candidate.cvFiles.quant.filename : candidate.cvFiles.fullStack.filename;
  let cvName = isQuant ? candidate.cvFiles.quant.name : candidate.cvFiles.fullStack.name;

  if (target.language === 'de') {
    cvFile = 'Olumide_Adeyemi-Nana_Systems_Architect_Lebenslauf_DE.pdf';
    cvName = 'German Systems Architect Lebenslauf (PDF)';
    const subject = `Architektur-Diagnose für ${target.company}: ${target.urgencyHook}`;
    const fullBody = `Sehr geehrtes Engineering-Team bei ${target.company},

ich wende mich direkt an Ihre technische Leitung bezüglich einer kritischen Architektur-Schwachstelle: ${target.diagnosedProblem}

${target.consequenceOfDelay}

Mein Name ist Olumide Adeyemi-Nana. Als Senior Full-Stack & Systems Architect mit fundierter Ingenieurausbildung (Obafemi Awolowo University) entwickle ich Software nach den Maßstäben kritischer Infrastruktur – mit klarem Fokus auf Latenz-Minimierung, Concurrency-Sicherheit und deterministische Fail-Safes.

Ich habe die Lösung für diese Herausforderung bereits in Produktion gebaut und verifiziert:
• Referenzsystem: ${target.candidateFlagshipUsed} (${target.solvedBySystem})
• Verifizierter Benchmark: Null Dateninkonsistenz, deterministische PostgreSQL Row-Level-Locks und sub-100ms Ausführungszeit unter hoher Last.
• Produktionsreferenzen und Live-Code:
  - Portfolio: ${candidate.portfolioUrl}
  - GitHub: ${candidate.githubUrl}
  - Flaggschiff: GOD'S EYE Sovereign Intelligence & ChopOS POS Architecture

Was ich ab sofort für ${target.company} leisten kann:
1. Sofortiges technisches Audit Ihrer Daten-Pipelines und Concurrency-Handler.
2. Beseitigung von Latenz-Engpässen und Race Conditions bei Transaktionen.
3. Bereitstellung deterministischer, hochskalierbarer Systeme ohne explodierende Cloud-Kosten.
4. Volle Zeitzonen-Synchronität: Ich arbeite aus der WAT-Zeitzone (GMT+1), zeitlich zu 100 % synchron mit Deutschland / MEZ (UTC+1).

Im Anhang finden Sie meinen aktuellen Lebenslauf als PDF (${cvName} – ${cvFile}). Ich stehe ab sofort für ein 15-minütiges technisches Gespräch zur Verfügung.

Kontakt:
• E-Mail: ${candidate.email}
• WhatsApp / Tel: ${candidate.phone}
• Live-Portfolio: ${candidate.portfolioUrl}

Mit freundlichen Grüßen,

${candidate.name}
${candidate.headline}
GitHub: @Olumidenana`;

    const hookPitch = `Sehr geehrtes Team bei ${target.company},

${target.urgencyHook} ${target.consequenceOfDelay}

Als Senior Systems Architect habe ich genau dieses Problem bereits in Produktion gelöst: ${target.candidateFlagshipUsed} (${target.solvedBySystem}). Ich arbeite aus GMT+1 (100% MEZ-synchron) und stehe ab sofort zur Verfügung. Live-Code: ${candidate.portfolioUrl} (GitHub: github.com/Olumidenana). Anbei mein Lebenslauf als PDF.`;

    const mailtoUrl = `mailto:${target.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

    return {
      target,
      subject,
      hookPitch,
      fullBody,
      mailtoUrl,
      recommendedCVFile: cvFile,
      recommendedCVName: cvName,
    };
  }

  // Kuwait / Gulf region customization
  const isGulf = target.region === 'KUWAIT_GULF';
  const gulfTimezoneNote = isGulf
    ? `\n• Timezone Alignment: Working from WAT (GMT+1), I am only 2 hours from Kuwait/Gulf time (GMT+3), providing full-day real-time business overlap with Kuwait City, Dubai, and Riyadh.`
    : '';

  const subject = isGulf
    ? `Technical Architecture Diagnostic for ${target.company} (Kuwait/Gulf GMT+3 Overlap) — ${target.urgencyHook}`
    : `Urgent Architecture Diagnostic for ${target.company} — ${target.urgencyHook}`;

  const fullBody = `Dear ${target.company} Engineering Leadership,

I am writing directly to address a critical architectural vulnerability that frequently compromises systems in your sector: ${target.diagnosedProblem}

${target.consequenceOfDelay}

My name is Olumide Adeyemi-Nana. I am a Full-Stack Systems Engineer and Sovereign Architecture Quant. My engineering foundation from Obafemi Awolowo University (OAU) approaches software like critical physical infrastructure—diagnosing stress points, friction, and concurrency bottlenecks before they trigger systemic failure.

I have already engineered and benchmarked the exact production solution to this problem:
• Built ${target.candidateFlagshipUsed}: ${target.solvedBySystem}
• Verified Benchmark: Zero data corruption, deterministic ACID row-level locking, and sub-100ms algorithmic execution under high concurrency.
• Live Production Proof: You can inspect my live code, test suites, and GitHub repositories directly at:
  - Portfolio: ${candidate.portfolioUrl}
  - GitHub: ${candidate.githubUrl}
  - Flagship: GOD'S EYE Sovereign Intelligence & MT5 Execution Architecture

What I can do for ${target.company} this week:
1. Conduct an immediate architectural audit of your data pipelines and concurrency handlers.
2. Eliminate latency bottlenecks and double-spending race conditions.
3. Deploy deterministic, high-throughput systems that scale seamlessly without ballooning cloud costs.${gulfTimezoneNote}

Attached is my ${cvName} (${cvFile}). I am available for immediate engagement and can deliver production improvements starting this week.

Let's schedule a 15-minute technical audit:
• Direct Email: ${candidate.email}
• Direct Phone / WhatsApp: ${candidate.phone}
• Live Portfolio: ${candidate.portfolioUrl}

Warm regards,

${candidate.name}
${candidate.headline}
Obafemi Awolowo University Alum
GitHub: @Olumidenana`;

  const hookPitch = `Hi ${target.company} Team,

${target.urgencyHook} If this is not resolved, ${target.consequenceOfDelay}

I'm Olumide, a Full-Stack Systems Engineer and Sovereign Architecture Quant. I have already solved this in production with ${target.candidateFlagshipUsed} (${target.solvedBySystem}).${isGulf ? ' Available immediately with full GMT+3 Kuwait/Gulf business hours overlap.' : ''} You can inspect my live code at ${candidate.portfolioUrl} and github.com/Olumidenana. Attached is my ${cvName}. Let's connect for 15 minutes this week.`;

  const mailtoUrl = `mailto:${target.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;

  return {
    target,
    subject,
    hookPitch,
    fullBody,
    mailtoUrl,
    recommendedCVFile: cvFile,
    recommendedCVName: cvName,
  };
}

export function createCustomOutreachTarget(
  company: string,
  domain: string,
  sector: OutreachSector,
  customProblem?: string
): OutreachTarget {
  let defaultProblem = 'Scalability bottlenecks and high-concurrency data desynchronization.';
  let defaultConsequence = 'System outages and data loss under sudden market or user traffic surges.';
  let defaultSolved = "Sovereign high-concurrency systems delivery with Next.js, FastAPI, PostgreSQL row-level locks, and Redis Streams.";
  let defaultFlagship = "GOD'S EYE & ChopOS Systems Architecture";
  let defaultCV: 'FullStack' | 'Quant' = 'FullStack';

  if (sector === 'QUANT_TRADING') {
    defaultProblem = 'Tick lag and slippage during volatile exchange market events.';
    defaultConsequence = 'Alpha erosion and negative order execution slippage.';
    defaultSolved = '73+ live WebSocket streaming feeds with C FFI bindings to MT5 and FIX 4.4.';
    defaultFlagship = "ICT Flux & GOD'S EYE Sovereign Engine";
    defaultCV = 'Quant';
  } else if (sector === 'SATELLITE_INTELLIGENCE') {
    defaultProblem = 'Opaque physical supply chain and maritime port activity tracking.';
    defaultConsequence = 'Lagged commodity forecasting and reliance on delayed terrestrial reports.';
    defaultSolved = 'ESA Copernicus Sentinel-1 SAR & Sentinel-2 optical imagery via OpenCV.';
    defaultFlagship = "GOD'S EYE Sovereign Intelligence Platform";
    defaultCV = 'Quant';
  } else if (sector === 'FINTECH_PAYMENTS') {
    defaultProblem = 'Double-spending race conditions and settlement reconciliation failures.';
    defaultConsequence = 'Silent ledger drift and costly escrow disputes.';
    defaultSolved = 'PostgreSQL SELECT ... FOR UPDATE row-level locks and Paystack split escrow.';
    defaultFlagship = 'ChopOS Merchant Operating System';
    defaultCV = 'FullStack';
  }

  const cleanDomain = domain.toLowerCase().replace(/https?:\/\//, '').split('/')[0].trim();
  const contactEmail = `founders@${cleanDomain}`;

  return {
    id: `custom-outreach-${Date.now()}`,
    company,
    domain: cleanDomain,
    contactEmail,
    sector,
    diagnosedProblem: customProblem || defaultProblem,
    consequenceOfDelay: defaultConsequence,
    solvedBySystem: defaultSolved,
    candidateFlagshipUsed: defaultFlagship,
    urgencyHook: `Your architecture is at risk from ${customProblem || defaultProblem}`,
    recommendedCV: defaultCV,
  };
}
