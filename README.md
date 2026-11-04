# 👁️ Remote Job Hunter & Sovereign Apply Assistant

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlumidenana%2Fremote-job-hunter)

An autonomous remote engineering career engine built specifically for **Olumide Adeyemi-Nana** ([Portfolio](https://olumidenana.github.io/olumide-portfolio/) · [GitHub](https://github.com/Olumidenana)).

The platform directly indexes your production track record—headlined by your newly developed Tier-1 Flagship architecture, **GOD'S EYE**—alongside your live repositories, continuously scans global remote job boards (RemoteOK, Arbeitnow, Jobicy, Remotive), matches listings with high-affinity scoring, generates tailored 3-sentence hooks and complete ATS cover letters, and dispatches automated daily alerts to your email.

---

## 🏛️ Flagship Production Showcase

The engine automatically tailors your pitches and cover letters around your highest tier architectures:

1. **👁️ GOD'S EYE (Sovereign Market Intelligence & Automated Execution Platform)**:
   - **Satellite Earth Observation**: Interfaces ESA Copernicus Sentinel-1 SAR & Sentinel-2 multispectral imagery via OpenCV, evaluating maritime tanker density and Hough Circle crude oil tank fill percentages (e.g. Cushing hub).
   - **Macro Radar Feeds**: Token Bucket rate-limited (9.0 req/s) SEC EDGAR ingestion (Form 8-K, 13D, Form 4) with SHA-256 cryptographic provenance.
   - **Distributed Event Bus**: TimescaleDB + Redis Streams with consumer groups for real-time document NLP signals.
   - **Sovereign Two-Key Synthesis Interlock**: Deterministic algorithmic trade execution uniting Macro Resonance matrices with ICT Time-and-Price strategies via **MetaTrader 5 (MT5)** & **FIX Protocol 4.4 Gateways** (`<100ms` execution latency).
2. **⚡ ChopOS (Merchant OS & Escrow Engine)**:
   - Next.js & PostgreSQL platform with automated Paystack multi-split escrow, strict row-level locking (`SELECT ... FOR UPDATE`) eliminating double-spending, and sub-3s WebSocket KDS order sync.
3. **📈 ICT Flux (High-Frequency Quant Trading Engine)**:
   - 73+ concurrent live WebSocket feeds streaming forex, equity, and synthetic markets with zero-lookahead event routing and direct C FFI terminal bridges.
4. **🎨 ToonForge & Video Assembler SaaS**:
   - In-browser 3D WebGL animation (Three.js) coupled with a 700KB TypeScript timeline engine and distributed cloud FFMPEG queues.

---

## 🎯 Key Capabilities

- **GOD'S EYE Affinity Matcher**: Prioritizes roles in AI/ML, Python/FastAPI, Quantitative Systems, Distributed Streaming, Data Engineering, and Full-Stack Next.js.
- **Multi-Source Remote Job Aggregator**: Concurrently queries Arbeitnow, Jobicy, Remotive, and RemoteOK without requiring paid API keys.
- **Urgent & Fresh Hire Detection**: Flags positions posted in the last 24–48 hours to prioritize applications for companies hiring immediately this week.
- **Smart Apply Assistant**:
  - **3-Sentence Punchy Pitch**: High-impact elevator pitch highlighting GOD'S EYE and ChopOS metrics for LinkedIn InMail or application forms.
  - **Complete ATS Cover Letter**: Tailored specifically to each company and tech stack.
  - **1-Click Copy & Apply**: Copies the pitch directly to your clipboard and opens the company application portal in a single click.
  - **Pre-filled Email Draft (`mailto:`)**: Ready-to-send application email with subject and body pre-populated.
- **Automated Daily Notifications (7:00 AM UTC)**:
  - Configured via **Vercel Cron** (`vercel.json`) hitting `/api/cron/daily-jobs`.
  - Sends to **`olumideadeyeminana@gmail.com`**.
  - Supports **Resend** (3,000 free emails/mo) or interactive in-app HTML digest preview.

---

## 📦 Deployment Guide (Vercel 1-Click)

1. Click the button below:  
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlumidenana%2Fremote-job-hunter)
2. Import the repository into your Vercel account (`Olumidenana/remote-job-hunter`).
3. (Optional) In **Environment Variables**, add:
   * `JOB_ALERT_EMAIL`: `olumideadeyeminana@gmail.com`
   * `RESEND_API_KEY`: *(Get a free key at [resend.com](https://resend.com))*
4. Click **Deploy**.
5. Vercel automatically activates the cron job from `vercel.json` to trigger every day at 07:00 AM UTC!

---

## 🏃 Local Development

```bash
# Clone the repository
git clone https://github.com/Olumidenana/remote-job-hunter.git
cd remote-job-hunter

# Install dependencies
npm install

# Test the multi-source aggregation engine
npm run test:engine

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 👤 Candidate Profile

- **Name**: Olumide Adeyemi-Nana
- **Role**: Full-Stack Systems Engineer & Sovereign Architecture Quant
- **Degree**: B.Sc. Mechanical Engineering, Obafemi Awolowo University (OAU)
- **Portfolio**: [olumidenana.github.io/olumide-portfolio](https://olumidenana.github.io/olumide-portfolio/)
- **Email**: [olumideadeyeminana@gmail.com](mailto:olumideadeyeminana@gmail.com)
- **Phone**: [+234 814 964 0122](tel:+2348149640122)
- **GitHub**: [@Olumidenana](https://github.com/Olumidenana)
