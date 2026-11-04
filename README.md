# 👁️ Remote Job Hunter & Sovereign Apply Assistant

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlumidenana%2Fremote-job-hunter)

An autonomous remote engineering career engine and outbound email apply dispatcher built specifically for **Olumide Adeyemi-Nana** ([Portfolio](https://olumidenana.github.io/olumide-portfolio/) · [GitHub](https://github.com/Olumidenana)).

The platform directly indexes your production track record—headlined by your **Tier-1 Flagship architecture, GOD'S EYE**—alongside your live repositories, continuously scans global remote job boards, analyzes job descriptions for anti-bot instructions and required formats, attaches your targeted CV PDF, and sends tailored applications on your behalf.

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

## 🎯 Advanced Capabilities

### 1. 🔍 Deep Instruction Reader & Anti-Bot Compliance Engine
Job postings often include specific anti-bot traps or instructions to filter candidates. This engine parses each description to extract:
- **Direct Hiring Emails**: Scans text and `mailto:` links for recruiter contacts (`careers@`, `jobs@`, `hiring@`).
- **Required Subject Lines**: Formats subject lines according to company requirements (e.g. `"Application: Senior Engineer - [Your Name]"`).
- **Secret Codewords**: Detects instructions like *"Include the word 'supernova' in the first line"* and automatically embeds the requirement.
- **Mandatory Question Answering**: Injects explicit answers for earliest start date (immediate this week), timezone overlap (GMT+1/WAT flexible with US/EU), and salary expectations.

### 2. 📎 Automatic CV Selection & Direct Attachment
The engine selects and attaches the appropriate targeted CV based on role requirements:
- **`Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf`**: For Quant, Python, Trading, Low-Latency, Machine Learning, and Computer Vision roles.
- **`Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf`**: For Full-Stack, Next.js, React, Node.js, and Web Development roles.
Both CVs are embedded in `public/cv/` and attached directly to outbound application emails.

### 3. ✉️ Outbound Email Dispatcher (Sends on Your Behalf)
- Dispatches emails directly to recruiters via Resend API (`POST /api/apply/send`).
- Includes a BCC copy sent to **`olumideadeyeminana@gmail.com`** for a real-time audit trail of every application.
- Includes clickable links to your live portfolio ([olumidenana.github.io/olumide-portfolio](https://olumidenana.github.io/olumide-portfolio/)) and GitHub.

### 4. 📋 Applications Outbox & Tracking
- Tracks all dispatched applications in an interactive **Outbox Drawer**.
- Records timestamp, company, role, recipient email, attached CV, and verified instructions to prevent duplicate applications.

### 5. ⏰ Automated Daily Notification Cycle
- Automated cron in `vercel.json` (`schedule: 0 7 * * *`) scans jobs every morning at **7:00 AM UTC (8:00 AM WAT)** and delivers a digest to your inbox.

---

## 🛠️ Environment Variables

Configure these in your **Vercel Project Settings > Environment Variables**:

| Variable | Description | Default |
|---|---|---|
| `JOB_ALERT_EMAIL` | Destination email for daily digests & application audit copies | `olumideadeyeminana@gmail.com` |
| `RESEND_API_KEY` | Resend API key for outbound emailing with CV attachments | *(Optional: simulated preview if unset)* |
| `EMAIL_FROM` | Sender address verified in Resend | `onboarding@resend.dev` |
| `CRON_SECRET` | Secret token to secure the cron endpoint | *(Optional)* |

---

## 📦 Deployment Guide (Vercel 1-Click)

1. Click the button below:  
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlumidenana%2Fremote-job-hunter)
2. Import the repository into your Vercel account (`Olumidenana/remote-job-hunter`).
3. Add your `RESEND_API_KEY` (Free tier from [resend.com](https://resend.com) provides 3,000 emails/month).
4. Click **Deploy**.
5. Vercel automatically activates the daily cron (`vercel.json`) to run every day at 07:00 AM UTC!

---

## 🏃 Local Development

```bash
# Clone the repository
git clone https://github.com/Olumidenana/remote-job-hunter.git
cd remote-job-hunter

# Install dependencies
npm install

# Test instruction detection and CV targeting
npm run test:engine

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard and applications outbox.

---

## 👤 Candidate Profile

- **Name**: Olumide Adeyemi-Nana
- **Role**: Full-Stack Systems Engineer & Sovereign Architecture Quant
- **Degree**: B.Sc. Mechanical Engineering, Obafemi Awolowo University (OAU)
- **Portfolio**: [olumidenana.github.io/olumide-portfolio](https://olumidenana.github.io/olumide-portfolio/)
- **Email**: [olumideadeyeminana@gmail.com](mailto:olumideadeyeminana@gmail.com)
- **Phone**: [+234 814 964 0122](tel:+2348149640122)
- **GitHub**: [@Olumidenana](https://github.com/Olumidenana)
