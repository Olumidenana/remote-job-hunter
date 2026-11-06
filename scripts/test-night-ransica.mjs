// scripts/test-night-ransica.mjs
import { fetchRemoteJobs } from '../lib/job-engine.ts';

async function test() {
  console.log('⚡ Testing Ransica & Night Shift Remote Engine Integration...');
  const result = await fetchRemoteJobs();
  
  const nightJobs = result.matchedJobs.filter(j => j.isNightShift);
  const ransicaJobs = result.matchedJobs.filter(j => j.source === 'Ransica');

  console.log(`\n🎉 Total Scanned Jobs: ${result.matchedJobs.length}`);
  console.log(`🌙 Night / US-Hours Shift Compatible Jobs: ${nightJobs.length}`);
  console.log(`🌍 Ransica International Opportunities: ${ransicaJobs.length}`);

  console.log('\n--- Sample Night Shift Opportunities Ready to Apply ---');
  nightJobs.slice(0, 3).forEach((j, i) => {
    console.log(`\n[${i + 1}] ${j.title} (${j.company})`);
    console.log(`    Shift: ${j.shiftType} — ${j.shiftReason}`);
    console.log(`    Recruiter Email: ${j.instructions?.recipientEmail || 'None'}`);
    console.log(`    Match Score: ${j.matchScore}%`);
  });
}

test().catch(console.error);
