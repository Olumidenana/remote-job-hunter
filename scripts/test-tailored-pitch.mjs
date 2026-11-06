import assert from 'assert';
import { generateApplicationPackage } from '../lib/pitch-generator.ts';

console.log('🧪 Testing Intelligent Pitch Personalization & Domain Matching...\n');

// 1. React / Frontend Job
const frontendJob = {
  id: 'test-front-1',
  title: 'Senior Frontend Engineer (React / Next.js / TypeScript)',
  company: 'Linear Ecosystem Tools',
  location: 'Remote',
  isWorldwide: true,
  url: 'https://linear-tools.com/jobs/1',
  applyUrl: 'mailto:jobs@linear-tools.com',
  source: 'Direct',
  tags: ['frontend', 'react', 'nextjs', 'typescript', 'tailwind'],
  description: 'Building developer tools with Next.js, React Email templates, sub-second telemetry dashboards, and modern UI components.',
  publishedAt: new Date().toISOString(),
  matchScore: 92,
  matchReasons: ['Next.js', 'React'],
  synergyStack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'],
};

const pkgFrontend = generateApplicationPackage(frontendJob);
console.log('Frontend Job Pitch Hook:');
console.log('---');
console.log(pkgFrontend.hookPitch);
console.log('---');
assert(pkgFrontend.hookPitch.includes('Frontend Systems Engineer') || pkgFrontend.hookPitch.includes('Full-Stack'), 'Should use frontend/fullstack persona');
assert(pkgFrontend.hookPitch.includes('Resend Mission Control') || pkgFrontend.hookPitch.includes('ChopOS'), 'Should match developer tools/Next.js systems');
assert(!pkgFrontend.hookPitch.includes('Sovereign Architecture Quant'), 'Must NOT call candidate a Quant for frontend role');

// 2. FinTech / Escrow Job
const fintechJob = {
  id: 'test-fintech-1',
  title: 'Backend Payments & Escrow Engineer',
  company: 'Kora Payments',
  location: 'Remote',
  isWorldwide: true,
  url: 'https://korapay.com/jobs/2',
  applyUrl: 'mailto:careers@korapay.com',
  source: 'Direct',
  tags: ['fintech', 'payments', 'postgresql', 'escrow', 'billing'],
  description: 'Looking for a backend engineer with deep PostgreSQL ACID locking experience, Paystack/Stripe integration, and real-time ledger settlement.',
  publishedAt: new Date().toISOString(),
  matchScore: 95,
  matchReasons: ['PostgreSQL', 'FinTech'],
  synergyStack: ['PostgreSQL', 'Paystack API', 'TypeScript', 'Redis'],
};

const pkgFintech = generateApplicationPackage(fintechJob);
console.log('\nFinTech Job Pitch Hook:');
console.log('---');
console.log(pkgFintech.hookPitch);
console.log('---');
assert(pkgFintech.hookPitch.includes('ChopOS'), 'Should match ChopOS for escrow/payments job');
assert(pkgFintech.hookPitch.includes('FinTech') || pkgFintech.hookPitch.includes('Escrow'), 'Should use FinTech persona');

// 3. Automotive / WhatsApp AI Job
const aiJob = {
  id: 'test-ai-1',
  title: 'AI Diagnostic Copilot & Python Engineer',
  company: 'MotorAI Labs',
  location: 'Remote',
  isWorldwide: true,
  url: 'https://motorai.io/jobs/3',
  applyUrl: 'mailto:jobs@motorai.io',
  source: 'Direct',
  tags: ['python', 'ai', 'whatsapp', 'diagnostics', 'automotive'],
  description: 'Developing WhatsApp AI diagnostic decision trees and automotive telemetry integrations.',
  publishedAt: new Date().toISOString(),
  matchScore: 90,
  matchReasons: ['Python', 'AI'],
  synergyStack: ['Python 3.12', 'FastAPI', 'WhatsApp API'],
};

const pkgAI = generateApplicationPackage(aiJob);
console.log('\nAutomotive AI Job Pitch Hook:');
console.log('---');
console.log(pkgAI.hookPitch);
console.log('---');
assert(pkgAI.hookPitch.includes('AutoCare AI'), 'Should match AutoCare AI for automotive/WhatsApp job');
assert(pkgAI.hookPitch.includes('AI Systems'), 'Should use AI Systems persona');

console.log('\n🎉 ALL PITCH PERSONALIZATION TESTS PASSED! No more generic repetitive copy!');
