/**
 * DOMAIN VERIFIER — Check which outbox email domains actually exist (have MX records)
 * Uses DNS lookup to separate real company emails from fake/placeholder ones
 */
import dns from 'dns/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const outbox = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/outbox.json'), 'utf8'));

async function checkDomain(email) {
  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    return { email, domain, real: records.length > 0, mx: records.map(r => r.exchange).join(', ') };
  } catch {
    return { email, domain, real: false, mx: 'NO MX RECORD' };
  }
}

async function main() {
  console.log('🔍 Checking all outbox email domains for MX records...\n');

  const unique = [...new Set(outbox.map(e => e.recipientEmail))];
  const results = await Promise.all(unique.map(checkDomain));

  const real = results.filter(r => r.real);
  const fake = results.filter(r => !r.real);

  console.log('✅ REAL DOMAINS (MX records confirmed):');
  for (const r of real) console.log(`   ${r.email.padEnd(45)} → ${r.mx}`);

  console.log('\n❌ FAKE/DEAD DOMAINS (no MX records — email never reached anyone):');
  for (const r of fake) console.log(`   ${r.email}`);

  console.log(`\n📊 Summary: ${real.length} real, ${fake.length} fake out of ${unique.length} total`);
}

main().catch(console.error);
