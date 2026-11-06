import assert from 'assert';
import {
  normalizeCompany,
  isCompanyMatch,
  extractDomain,
  isAlreadyApplied,
  recordApplication,
  getApplicationHistory,
} from '../lib/tracker.ts';

console.log('🧪 Testing Remote Job Hunter Deduplication Engine...\n');

// Test 1: normalizeCompany
console.log('Test 1: Company Normalization');
assert.strictEqual(normalizeCompany('Vexcash AG'), 'vexcash');
assert.strictEqual(normalizeCompany('Vexcash, LLC'), 'vexcash');
assert.strictEqual(normalizeCompany('Stripe, Inc.'), 'stripe');
assert.strictEqual(normalizeCompany('FinTech & Escrow Platforms (Global / EMEA)'), 'fintechescrowplatforms');
assert.strictEqual(normalizeCompany('Monzo Bank Ltd'), 'monzobank');
console.log('  ✓ normalizeCompany correctly removes legal suffixes and noise');

// Test 2: isCompanyMatch
console.log('Test 2: Company Matching');
assert.strictEqual(isCompanyMatch('Vexcash AG', 'Vexcash'), true);
assert.strictEqual(isCompanyMatch('Stripe', 'Stripe Inc'), true);
assert.strictEqual(isCompanyMatch('Amazon', 'Google'), false);
console.log('  ✓ isCompanyMatch matches company variations reliably');

// Test 3: extractDomain
console.log('Test 3: Domain Extraction');
assert.strictEqual(extractDomain('jobs@vexcashag.com'), 'vexcashag.com');
assert.strictEqual(extractDomain('hiring@stripe.com'), 'stripe.com');
// Public webmail should be ignored (return '')
assert.strictEqual(extractDomain('candidate@gmail.com'), '');
assert.strictEqual(extractDomain('user@outlook.com'), '');
// ATS boards should NOT be used as company domain
assert.strictEqual(extractDomain('https://jobs.lever.co/stripe/123'), '');
assert.strictEqual(extractDomain('https://weworkremotely.com/jobs/456'), '');
// Direct company website
assert.strictEqual(extractDomain('https://www.vexcashag.com/careers'), 'vexcashag.com');
console.log('  ✓ extractDomain isolates corporate domains without blocking ATS platforms');

// Test 4: isAlreadyApplied against seeded data
console.log('Test 4: Seeded History Verification');
const history = getApplicationHistory();
console.log(`  Seeded history count: ${history.length}`);
assert(history.length >= 3, 'Seed history should contain initial records');

// Should block Vexcash AG (by company)
assert.strictEqual(isAlreadyApplied('random-job-id', 'Vexcash AG', 'Junior Dev'), true, 'Should block Vexcash AG');
// Should block Vexcash (by normalized name without suffix)
assert.strictEqual(isAlreadyApplied('random-job-id', 'Vexcash', 'Senior Dev'), true, 'Should block Vexcash by normalized name');
// Should block by email
assert.strictEqual(isAlreadyApplied('new-id', 'Different Name', 'Role', 'jobs@vexcashag.com'), true, 'Should block by email');
// Should block outreach target 1
assert.strictEqual(isAlreadyApplied('outreach-target-1', 'FinTech & Escrow Platforms', 'Pitch', 'engineering@fintech-settlements.com'), true, 'Should block outreach-target-1');
// Should block outreach target 2
assert.strictEqual(isAlreadyApplied('outreach-target-2', 'Algorithmic Trading', 'Pitch', 'recruiting@quant-propdesks.com'), true, 'Should block outreach-target-2');

// Should ALLOW completely new company
assert.strictEqual(isAlreadyApplied('job-new-123', 'Totally Unique Startup Ltd', 'Backend Lead', 'careers@uniquestartup.io', 'https://uniquestartup.io'), false, 'Should allow unique company');

// Test 5: Dynamic Recording & Immediate Subsequent Blocking
console.log('Test 5: Dynamic Record & Subsequent Block');
recordApplication({
  id: 'test-app-run',
  type: 'JOB_APP',
  jobId: 'job-unique-999',
  company: 'Quantum Mesh Technologies Inc',
  jobTitle: 'Core Distributed Systems Architect',
  recipientEmail: 'founders@quantummesh.io',
  companyEmailPicked: 'founders@quantummesh.io',
  actualDeliveredTo: 'test@resend.dev',
  deliveryMode: 'LIVE_COMPANY_INBOX',
  subject: 'Application: Core Distributed Systems Architect — Olumide Adeyemi-Nana',
  status: 'SENT',
  sentAt: new Date().toISOString(),
  cvAttached: 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf',
  complianceNotes: ['Test record'],
});

// Now it MUST be blocked by ID
assert.strictEqual(isAlreadyApplied('job-unique-999'), true, 'Must block by newly registered job ID');
// MUST be blocked by company name variation
assert.strictEqual(isAlreadyApplied('different-id', 'Quantum Mesh Technologies'), true, 'Must block by company name variation');
// MUST be blocked by email
assert.strictEqual(isAlreadyApplied('other-id', 'Other Company', 'Title', 'founders@quantummesh.io'), true, 'Must block by recipient email');
// MUST be blocked by corporate domain
assert.strictEqual(isAlreadyApplied('other-id-2', 'Other Corp', 'Title', 'hr@quantummesh.io'), true, 'Must block by corporate domain');

console.log('\n🎉 ALL DEDUPLICATION TESTS PASSED WITH 100% SUCCESS!');
