/**
 * SCAN LIVE JOBS — Fetch from all job APIs and count direct-email targets
 * Shows exactly what the site sees and which ones we can email directly
 */

async function cleanHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}

function isLocationCompatible(loc) {
  if (!loc) return true;
  const l = loc.toLowerCase();
  const blocked = ['us only', 'usa only', 'united states only', 'canada only', 'uk only', 'australia only', 'eu only'];
  return !blocked.some(b => l.includes(b));
}

function calculateMatchScore(title, tags = [], desc = '') {
  const text = `${title} ${tags.join(' ')} ${desc}`.toLowerCase();
  let score = 0;
  const hits = [];
  const checks = [
    ['typescript', 15], ['node.js', 15], ['nodejs', 15], ['react', 12], ['next.js', 12],
    ['python', 10], ['postgresql', 10], ['redis', 10], ['websocket', 12], ['distributed', 12],
    ['fintech', 10], ['backend', 8], ['full.stack', 8], ['systems architect', 15],
    ['algorithmic', 12], ['quant', 12], ['trading', 10], ['rust', 8], ['go ', 6],
    ['microservice', 8], ['real.time', 8], ['api', 5], ['cloud', 5], ['remote', 5],
  ];
  for (const [kw, pts] of checks) {
    if (new RegExp(kw).test(text)) { score += pts; hits.push(kw); }
  }
  return Math.min(score, 100);
}

// Try to find a direct email in the job description
function extractDirectEmail(desc, companyName) {
  // Look for email patterns in description
  const emailRegex = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
  const found = desc.match(emailRegex) || [];
  // Filter out common noise
  const noise = ['example.com', 'noreply', 'no-reply', 'support@', 'info@amazon', 'info@google'];
  return found.filter(e => !noise.some(n => e.includes(n)))[0] || null;
}

// Try to construct a likely careers email from company domain
function guessCareerEmail(company, applyUrl) {
  try {
    const url = new URL(applyUrl);
    const domain = url.hostname.replace(/^www\./, '');
    // Skip job board domains
    const boards = ['lever.co', 'greenhouse.io', 'workable.com', 'ashbyhq.com', 'jobicy.com',
                    'remotive.com', 'arbeitnow.com', 'linkedin.com', 'indeed.com', 'glassdoor.com',
                    'apply.', 'jobs.', 'careers.', 'talent.', 'hire.'];
    if (boards.some(b => domain.includes(b) || applyUrl.includes(b))) return null;
    return `careers@${domain}`;
  } catch { return null; }
}

async function main() {
  console.log('🔍 Scanning all live job APIs...\n');
  const jobs = [];

  // 1. Arbeitnow
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const item of (data.data || [])) {
        const desc = await cleanHtml(item.description || '');
        const score = calculateMatchScore(item.title, item.tags || [], desc);
        if (score >= 65 && (item.remote || isLocationCompatible(item.location))) {
          const directEmail = extractDirectEmail(desc, item.company_name);
          const guessedEmail = guessCareerEmail(item.company_name, item.url || '');
          jobs.push({
            source: 'Arbeitnow',
            title: item.title,
            company: item.company_name,
            applyUrl: item.url,
            score,
            directEmail,
            guessedEmail,
            desc: desc.slice(0, 200),
          });
        }
      }
    }
    console.log(`✅ Arbeitnow: fetched`);
  } catch(e) { console.log(`❌ Arbeitnow: ${e.message}`); }

  // 2. Remotive
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=50', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const item of (data.jobs || [])) {
        const desc = await cleanHtml(item.description || '');
        const score = calculateMatchScore(item.title, item.tags || [], desc);
        if (score >= 65 && isLocationCompatible(item.candidate_required_location)) {
          const directEmail = extractDirectEmail(desc, item.company_name);
          const guessedEmail = guessCareerEmail(item.company_name, item.url || '');
          jobs.push({
            source: 'Remotive',
            title: item.title,
            company: item.company_name,
            applyUrl: item.url,
            score,
            directEmail,
            guessedEmail,
            desc: desc.slice(0, 200),
          });
        }
      }
    }
    console.log(`✅ Remotive: fetched`);
  } catch(e) { console.log(`❌ Remotive: ${e.message}`); }

  // 3. Jobicy
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50&tag=engineer', {
      headers: { 'User-Agent': 'RemoteJobHunter/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      for (const item of (data.jobs || [])) {
        const desc = await cleanHtml(item.jobDescription || '');
        const score = calculateMatchScore(item.jobTitle, [], desc);
        if (score >= 65) {
          const directEmail = extractDirectEmail(desc, item.companyName);
          const guessedEmail = guessCareerEmail(item.companyName, item.url || '');
          jobs.push({
            source: 'Jobicy',
            title: item.jobTitle,
            company: item.companyName,
            applyUrl: item.url,
            score,
            directEmail,
            guessedEmail,
            desc: desc.slice(0, 200),
          });
        }
      }
    }
    console.log(`✅ Jobicy: fetched`);
  } catch(e) { console.log(`❌ Jobicy: ${e.message}`); }

  // Deduplicate
  const seen = new Set();
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase()}-${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });

  unique.sort((a,b) => b.score - a.score);

  const withDirect = unique.filter(j => j.directEmail);
  const withGuessed = unique.filter(j => !j.directEmail && j.guessedEmail);
  const noEmail = unique.filter(j => !j.directEmail && !j.guessedEmail);

  console.log(`\n════════════════════════════════════════`);
  console.log(`  TOTAL MATCHED JOBS: ${unique.length}`);
  console.log(`  With direct email in description: ${withDirect.length}`);
  console.log(`  With guessable company email:     ${withGuessed.length}`);
  console.log(`  No email (job board apply only):  ${noEmail.length}`);
  console.log(`════════════════════════════════════════\n`);

  if (withDirect.length > 0) {
    console.log('📧 DIRECT EMAILS FOUND:');
    for (const j of withDirect) {
      console.log(`  [${j.score}] ${j.company} — ${j.title}`);
      console.log(`        📧 ${j.directEmail}`);
    }
  }

  console.log('\n📋 TOP 30 by score (with guessed email):');
  for (const j of withGuessed.slice(0,30)) {
    console.log(`  [${j.score}] ${j.company} — ${j.title}`);
    console.log(`        📤 ${j.guessedEmail} | Apply: ${j.applyUrl?.slice(0,60)}`);
  }

  // Save full list for dispatch script
  import('fs').then(({default: fs}) => {
    fs.writeFileSync('./scripts/live-jobs-scan.json', JSON.stringify(unique, null, 2));
    console.log(`\n💾 Full scan saved to scripts/live-jobs-scan.json (${unique.length} jobs)`);
  });
}

main().catch(console.error);
