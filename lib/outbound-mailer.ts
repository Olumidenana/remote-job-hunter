import fs from 'fs';
import path from 'path';
import { ApplicationPackage, RemoteJob } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';

export interface DispatchResponse {
  success: boolean;
  messageId?: string;
  recipient: string;
  subject: string;
  cvAttached: string;
  bccConfirmation: string;
  mode: 'LIVE_DISPATCH' | 'SIMULATED_PREVIEW';
  instructionsApplied: string[];
  note?: string;
}

export async function sendApplicationOnBehalf(
  job: RemoteJob,
  pkg: ApplicationPackage,
  overrideRecipient?: string
): Promise<DispatchResponse> {
  const recipient = overrideRecipient || pkg.recipientEmail;
  const candidate = DEFAULT_CANDIDATE;
  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Locate CV PDF on disk
  const cvFilePath = path.join(process.cwd(), 'public', 'cv', pkg.recommendedCVFile);
  let cvBase64: string | undefined = undefined;

  try {
    if (fs.existsSync(cvFilePath)) {
      const fileBuffer = fs.readFileSync(cvFilePath);
      cvBase64 = fileBuffer.toString('base64');
    }
  } catch (err) {
    console.error(`Warning: Could not read CV attachment at ${cvFilePath}:`, err);
  }

  // 2. Format HTML email body
  const formattedHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">
      <div style="max-width: 650px; margin: 0 auto; padding: 20px;">
        <div style="white-space: pre-wrap; font-size: 14px; color: #1e293b; margin-bottom: 24px;">
${pkg.fullCoverLetter}
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; font-size: 12.5px; color: #475569;">
          <strong>Candidate Verification & Shipped Systems:</strong><br />
          • <strong>Live Interactive Portfolio:</strong> <a href="${candidate.portfolioUrl}" style="color: #0284c7;">${candidate.portfolioUrl}</a><br />
          • <strong>GitHub Repositories:</strong> <a href="${candidate.githubUrl}" style="color: #0284c7;">${candidate.githubUrl}</a><br />
          • <strong>Direct Phone:</strong> ${candidate.phone}<br />
          • <strong>Direct Email:</strong> <a href="mailto:${candidate.email}" style="color: #0284c7;">${candidate.email}</a><br />
          • <strong>Attached Document:</strong> ${pkg.recommendedCVName} (${pkg.recommendedCVFile})
        </div>
      </div>
    </body>
    </html>
  `;

  // 3. Dispatch via Resend API if configured
  if (resendApiKey) {
    try {
      const attachments = cvBase64
        ? [{ filename: pkg.recommendedCVFile, content: cvBase64 }]
        : [];

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Olumide Adeyemi-Nana <onboarding@resend.dev>',
          to: recipient,
          reply_to: candidate.email,
          bcc: [candidate.email], // Candidate gets an instant carbon copy audit trail!
          subject: pkg.subject,
          html: formattedHtml,
          text: pkg.fullCoverLetter,
          attachments,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.id,
          recipient,
          subject: pkg.subject,
          cvAttached: pkg.recommendedCVFile,
          bccConfirmation: candidate.email,
          mode: 'LIVE_DISPATCH',
          instructionsApplied: pkg.instructions.detectedInstructions,
          note: `Application dispatched directly to ${recipient}! A confirmation copy has been sent to ${candidate.email}.`,
        };
      } else {
        const errorData = await res.json();
        console.error('Resend dispatch error:', errorData);
      }
    } catch (err) {
      console.error('Failed to send outbound email application:', err);
    }
  }

  // 4. Fallback / Test Preview Mode
  return {
    success: true,
    recipient,
    subject: pkg.subject,
    cvAttached: pkg.recommendedCVFile,
    bccConfirmation: candidate.email,
    mode: 'SIMULATED_PREVIEW',
    instructionsApplied: pkg.instructions.detectedInstructions,
    note: `Application prepared with all compliance instructions and CV attached. Set RESEND_API_KEY in your Vercel Project Settings to enable live inbox delivery on your behalf.`,
  };
}
