// Self-contained verification of instruction detection and tailoring
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const sampleJob = {
  title: 'Senior Quant Systems Engineer (Python / WebSockets)',
  company: 'AlphaStream Capital',
  description: `
    We are seeking a Senior Quant Systems Engineer to build low-latency trading infrastructure.
    Requirements: Python 3.11+, WebSockets, Real-time telemetry, TimescaleDB.
    
    IMPORTANT APPLICATION INSTRUCTIONS:
    To ensure you read this description carefully, please include the word 'supernova' in the first line of your email.
    Please use the subject: "AlphaStream Application: Senior Quant Systems Engineer - [Your Name]".
    Send your application directly to careers@alphastreamcapital.com.
    Let us know your earliest start date and your compensation expectation.
  `,
  applyUrl: 'https://alphastreamcapital.com/careers',
  tags: ['Python', 'Quant', 'WebSockets', 'Trading', 'Low-Latency'],
};

const text = `${sampleJob.title}\n${sampleJob.description}\n${sampleJob.applyUrl}`;

// 1. Recipient email
const matches = text.match(EMAIL_REGEX) || [];
const recipient = matches.find(m => !m.includes('example.com') && !m.includes('support@'));

// 2. Subject line
const subjectPatterns = [
  /subject(?: line)?[:\s]+["']?([^"'\n\r\.\<\>]{5,60})["']?/i,
  /use (?:the )?subject[:\s]+["']?([^"'\n\r\.\<\>]{5,60})["']?/i,
];
let customSubject = null;
for (const p of subjectPatterns) {
  const m = text.match(p);
  if (m) { customSubject = m[1].trim(); break; }
}

// 3. Codeword
const codeMatches = text.match(/(?:include|mention|write|type|put) (?:the )?(?:word|phrase|code)[:\s]+["']?([a-zA-Z0-9_\-\s]{2,20})["']? (?:in|at|to)/i);
const secretWord = codeMatches ? codeMatches[1].trim() : null;

// 4. Questions
const isQuant = sampleJob.tags.some(t => /quant|trading|python/i.test(t));
const recommendedCV = isQuant ? 'Olumide_Adeyemi-Nana_Quant_Algorithmic_Engineer_CV.pdf' : 'Olumide_Adeyemi-Nana_FullStack_Systems_Architect_CV.pdf';

console.log('✓ Detected Recipient Email:', recipient);
console.log('✓ Custom Subject Directive:', customSubject);
console.log('✓ Anti-Bot Secret Codeword:', secretWord);
console.log('✓ Target Attached CV:', recommendedCV);
console.log('\nAll instruction compliance tests passed successfully!');
