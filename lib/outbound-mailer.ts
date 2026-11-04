import fs from 'fs';
import path from 'path';
import { ApplicationPackage, RemoteJob } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';
import {
  canDispatch,
  recordDispatchSuccess,
  markResendDailyLimitExceeded,
  paceResendDispatch,
  getQuotaStatus,
} from './quota-tracker';

export interface DispatchResponse {
  success: boolean;
  messageId?: string;
  recipient: string;
  targetCompanyEmail: string;
  actualDeliveredTo: string;
  deliveryMode: 'LIVE_COMPANY_INBOX' | 'SANDBOX_FORWARD_READY';
  mailtoUrl?: string;
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
  overrideRecipient?: string,
  dispatchType: 'JOB_APP' | 'OUTREACH' = 'JOB_APP'
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

  // 3. Pre-flight Quota Gatekeeper
  const quotaCheck = canDispatch(dispatchType);
  if (!quotaCheck.allowed) {
    console.warn(`[QUOTA SHIELD] Dispatch deferred: ${quotaCheck.reason}`);
    return {
      success: true,
      recipient,
      targetCompanyEmail: recipient,
      actualDeliveredTo: candidate.email,
      deliveryMode: 'SANDBOX_FORWARD_READY',
      mailtoUrl: pkg.mailtoUrl,
      subject: pkg.subject,
      cvAttached: pkg.recommendedCVFile,
      bccConfirmation: candidate.email,
      mode: 'SIMULATED_PREVIEW',
      instructionsApplied: pkg.instructions.detectedInstructions,
      note: `[DAILY QUOTA GUARD] ${quotaCheck.reason} Application has been structured and recorded in your outbox.`,
    };
  }

  // 4. Dispatch via Resend API
  if (resendApiKey) {
    try {
      // Pacing delay (650ms) to respect Resend's 2 req/s limit
      await paceResendDispatch(650);

      const attachments = cvBase64
        ? [{ filename: pkg.recommendedCVFile, content: cvBase64 }]
        : [];

      const senderEmail = process.env.EMAIL_FROM || 'Olumide Adeyemi-Nana <onboarding@resend.dev>';
      const isSandboxTestingDomain = senderEmail.includes('resend.dev');

      // If on Resend's onboarding@resend.dev free sandbox, Resend only allows sending to the verified owner (candidate.email).
      // Sending to external 3rd-party emails without custom domain will fail with 403.
      // In sandbox mode, deliver directly to candidate.email with 1-click forward headers.
      const targetSendEmail = (!isSandboxTestingDomain && recipient) ? recipient : candidate.email;
      const isDirectCompany = targetSendEmail === recipient && !isSandboxTestingDomain;

      const emailSubject = isDirectCompany
        ? pkg.subject
        : `[FORWARD-READY APPLICATION] To: ${recipient} — ${pkg.subject}`;

      const emailHtmlContent = isDirectCompany
        ? formattedHtml
        : `
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #166534;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 6px;">🎯 Target Recruiter Picked: ${recipient}</div>
            • <strong>Company:</strong> ${job.company} (${job.title})<br/>
            • <strong>Attached Resume:</strong> ${pkg.recommendedCVFile}<br/>
            • <strong>Instructions Applied:</strong> ${pkg.instructions.detectedInstructions.join('; ') || 'Standard Single-Column ATS'}<br/>
            • <strong>1-Click Dispatch:</strong> <a href="${pkg.mailtoUrl}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 6px;">Forward to ${recipient} via Mail Client &rarr;</a>
          </div>
          ${formattedHtml}
        `;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: targetSendEmail,
          reply_to: candidate.email,
          subject: emailSubject,
          html: emailHtmlContent,
          text: pkg.fullCoverLetter,
          attachments,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Record quota consumption (1 single credit used!)
        recordDispatchSuccess(dispatchType);

        return {
          success: true,
          messageId: data.id,
          recipient,
          targetCompanyEmail: recipient,
          actualDeliveredTo: targetSendEmail,
          deliveryMode: isDirectCompany ? 'LIVE_COMPANY_INBOX' : 'SANDBOX_FORWARD_READY',
          mailtoUrl: pkg.mailtoUrl,
          subject: emailSubject,
          cvAttached: pkg.recommendedCVFile,
          bccConfirmation: candidate.email,
          mode: 'LIVE_DISPATCH',
          instructionsApplied: pkg.instructions.detectedInstructions,
          note: isDirectCompany
            ? `Live email dispatched directly to company hiring address ${recipient}!`
            : `Delivered to your verified inbox (${candidate.email}) forward-ready with CV attached. Resend quota used: 1 credit.`,
        };
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Resend API error' }));
        console.warn('[RESEND API WARN]:', errorData);

        const errMsg = JSON.stringify(errorData).toLowerCase();
        if (res.status === 429 || errMsg.includes('quota') || errMsg.includes('limit') || errMsg.includes('rate')) {
          markResendDailyLimitExceeded();
          return {
            success: true,
            recipient,
            targetCompanyEmail: recipient,
            actualDeliveredTo: candidate.email,
            deliveryMode: 'SANDBOX_FORWARD_READY',
            mailtoUrl: pkg.mailtoUrl,
            subject: pkg.subject,
            cvAttached: pkg.recommendedCVFile,
            bccConfirmation: candidate.email,
            mode: 'SIMULATED_PREVIEW',
            instructionsApplied: pkg.instructions.detectedInstructions,
            note: `Resend daily limit reached (${errorData.message || 'quota exceeded'}). Quota Shield engaged for today.`,
          };
        }
      }
    } catch (err) {
      console.error('Failed to send outbound email application:', err);
    }
  }

  // 5. Fallback Preview Mode
  return {
    success: true,
    recipient,
    targetCompanyEmail: recipient,
    actualDeliveredTo: candidate.email,
    deliveryMode: 'SANDBOX_FORWARD_READY',
    mailtoUrl: pkg.mailtoUrl,
    subject: pkg.subject,
    cvAttached: pkg.recommendedCVFile,
    bccConfirmation: candidate.email,
    mode: 'SIMULATED_PREVIEW',
    instructionsApplied: pkg.instructions.detectedInstructions,
    note: 'Compiled successfully in local preview mode.',
  };
}
