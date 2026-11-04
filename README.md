# ⚡ Remote Job Hunter & Application Assistant

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOlumidenana%2Fremote-job-hunter)

An autonomous remote job hunting system engineered specifically for **Olumide Adeyemi-Nana** ([Portfolio](https://olumidenana.github.io/olumide-portfolio/) · [GitHub](https://github.com/Olumidenana)).

The tool dynamically indexes Olumide's GitHub repositories and production portfolio dossier, continuously queries global remote tech job boards (RemoteOK, Arbeitnow, Jobicy, Remotive), computes deep compatibility scores, generates tailored 3-sentence elevator pitches & ATS cover letters for every role, and sends daily digests directly to your email via automated cron.

---

## 🎯 Key Capabilities

- **GitHub Portfolio Dynamic Profiler**: Ingests your verified production track record—including **ICT Flux** (algorithmic trading with 73+ concurrent live WebSocket feeds & MetaTrader C FFI), **ChopOS** (food merchant POS with PostgreSQL row-level locking & sub-3s WebSocket KDS), **ToonForge** (browser-native WebGL 3D animation), and **Motion OAU** (geospatial transit tracking).
- **Multi-Source Remote Job Aggregator**: Concurrently scans live job listings across Arbeitnow, Jobicy, Remotive, and RemoteOK without requiring paid API keys.
- **Intelligent Compatibility Scoring (0–100%)**: Evaluates stack alignment (TypeScript, Next.js, Python/FastAPI, PostgreSQL, WebSockets, Three.js, Redis, FinTech systems) and verifies worldwide/Africa remote eligibility.
- **Urgent & Fresh Hire Detection**: Flags positions posted within the last 24–48 hours to prioritize applications for roles hiring immediately this week.
- **Smart Apply Assistant**:
  - **3-Sentence Pitch Hook**: Punchy, metric-driven introductory hook mentioning your relevant shipped systems for direct outreach or LinkedIn InMail.
  - **Complete ATS Cover Letter**: Tailored specifically to each company and tech stack.
  - **1-Click Copy & Apply**: Copies the pitch directly to your clipboard and opens the company application portal in a single click.
  - **Pre-filled Email Draft (`mailto:`)**: Ready-to-send application email with subject and body pre-populated.
- **Automated Daily Notifications (7:00 AM UTC)**:
  - Configured via **Vercel Cron** (`vercel.json`) hitting `/api/cron/daily-jobs`.
  - Backup **GitHub Actions** cron workflow (`.github/workflows/daily-job-alert.yml`).
  - Supports **Resend** (3,000 free emails/mo) or interactive in-app HTML digest preview.

---

## 🚀 Live Tech Stack

- **Framework**: Next.js 15 (App Router, Serverless Edge Routes)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Matching Engine**: Dynamic heuristic scoring against GitHub API & candidate vector
- **Automation**: Vercel Cron & GitHub Actions workflow
- **Delivery**: Resend API & HTML email templates

---

## 🛠️ Environment Variables

Create a `.env.local` file or configure these in your **Vercel Project Settings > Environment Variables**:

| Variable | Description | Default |
|---|---|---|
| `JOB_ALERT_EMAIL` | Destination email for daily digests | `olumideadeyeminana@gmail.com` |
| `RESEND_API_KEY` | Resend API key for inbox email delivery | *(Optional: previews in UI if unset)* |
| `EMAIL_FROM` | Sender address verified in Resend | `onboarding@resend.dev` |
| `CRON_SECRET` | Secret token to secure the cron endpoint | *(Optional)* |

---

## 📦 Deployment Guide

### Deploying to Vercel (1-Click)
1. Push this repository to your GitHub account (`Olumidenana/remote-job-hunter`).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository.
4. (Optional) Under **Environment Variables**, add `RESEND_API_KEY` (get a free key from [resend.com](https://resend.com)).
5. Click **Deploy**.
6. Vercel automatically activates the cron job from `vercel.json` to trigger every day at 07:00 AM UTC!

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
- **Role**: Full-Stack Systems Engineer & FinTech Architect
- **Degree**: B.Sc. Mechanical Engineering, Obafemi Awolowo University (OAU)
- **Portfolio**: [olumidenana.github.io/olumide-portfolio](https://olumidenana.github.io/olumide-portfolio/)
- **Email**: [olumideadeyeminana@gmail.com](mailto:olumideadeyeminana@gmail.com)
- **Phone**: [+234 814 964 0122](tel:+2348149640122)
- **GitHub**: [@Olumidenana](https://github.com/Olumidenana)
