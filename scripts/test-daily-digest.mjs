// Quick test to display top jobs and pitch preview
async function run() {
  console.log('Fetching live remote jobs...');
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
  const json = await res.json();
  const jobs = json.data.filter(j => j.remote).slice(0, 5);

  console.log(`\nFound ${jobs.length} top live sample positions:`);
  for (const j of jobs) {
    console.log(`- ${j.title} @ ${j.company_name} (${j.location})`);
  }
}

run();
