import { RemoteJob, ScanResult } from '@/types/job';
import { DEFAULT_CANDIDATE } from './profile';
import { generateApplicationPackage } from './pitch-generator';

export interface EmailDispatchResult {
  success: boolean;
  provider: 'Resend' | 'SMTP' | 'PreviewMode';
  recipient: string;
  messageId?: string;
  jobCount: number;
  previewHtml?: string;
  note?: string;
}

export function buildEmailHtml(jobs: RemoteJob[], stats: ScanResult['stats']): string {
  const topJobs = jobs.slice(0, 8);
  const candidate = DEFAULT_CANDIDATE;

  const jobCardsHtml = topJobs.map((job, idx) => {
    const pkg = generateApplicationPackage(job);
    const scoreColor = job.matchScore >= 90 ? '#10b981' : job.matchScore >= 80 ? '#0284c7' : '#8b5cf6';

    return `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span style="display: inline-block; background-color: ${scoreColor}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
              ${job.matchScore}% Match
            </span>
            ${job.urgent ? '<span style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; margin-left: 6px;">Urgent Hire</span>' : ''}
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 8px 0 2px 0;">
              ${idx + 1}. ${job.title}
            </h2>
            <div style="font-size: 14px; font-weight: 600; color: #0284c7;">
              ${job.company} · <span style="color: #64748b; font-weight: normal;">${job.location}</span>
            </div>
          </div>
        </div>

        ${job.salary ? `<div style="font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px;">💰 ${job.salary}</div>` : ''}

        <p style="font-size: 13px; color: #334155; line-height: 1.5; margin: 8px 0;">
          ${job.description}
        </p>

        <div style="background-color: #f8fafc; border-left: 3px solid #0284c7; padding: 10px 12px; margin: 12px 0; border-radius: 4px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0284c7; margin-bottom: 4px;">Why It Fits You:</div>
          <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #334155;">
            ${job.matchReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="margin: 14px 0 10px 0;">
          <a href="${job.applyUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 6px; margin-right: 10px;">
            Apply Directly &rarr;
          </a>
          <span style="font-size: 12px; color: #64748b;">Source: ${job.source}</span>
        </div>

        <details style="margin-top: 12px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
          <summary style="font-size: 12px; font-weight: 600; color: #475569; cursor: pointer;">
            📋 Click to View Tailored Pitch for ${job.company}
          </summary>
          <pre style="background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 11px; white-space: pre-wrap; font-family: monospace; margin-top: 8px;">
${pkg.hookPitch}
          </pre>
        </details>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Remote Engineering Job Digest</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
      <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; color: #ffffff; text-align: left;">
          <span style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            Daily High-Match Alert · ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px 0;">
            ${topJobs.length} New Remote Roles Tailored for You
          </h1>
          <p style="font-size: 14px; color: #94a3b8; margin: 0; line-height: 1.5;">
            Targeted for <strong style="color: #ffffff;">${candidate.name}</strong> (${candidate.headline}) based on your live GitHub portfolio and production track record.
          </p>
        </div>

        <!-- Metrics Strip -->
        <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 24px; display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #0284c7;">${stats.highMatchCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">High Matches (&ge;85%)</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #ef4444;">${stats.urgentCount}</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Urgent / Fresh</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #10b981;">${stats.averageScore}%</div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Avg Compatibility</div>
          </div>
        </div>

        <!-- Job Listings -->
        <div style="padding: 24px;">
          <div style="margin-bottom: 20px;">
            <p style="font-size: 13.5px; color: #334155; line-height: 1.5; margin: 0;">
              ⚡ <strong>Urgent Action Strategy:</strong> Apply to the top 3-5 roles before 12:00 PM today using the pre-tailored hook pitch. Highlight your live systems (<strong>ICT Flux</strong>, <strong>ChopOS</strong>, and <strong>ToonForge</strong>).
            </p>
          </div>

          ${jobCardsHtml}

          <!-- Footer -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0 0 6px 0;">
              Automated by <a href="${candidate.portfolioUrl}" style="color: #0284c7; text-decoration: none; font-weight: 600;">Remote Job Hunter Agent</a>.
            </p>
            <p style="margin: 0;">
              Live Portfolio: <a href="${candidate.portfolioUrl}" style="color: #0284c7;">olumidenana.github.io/olumide-portfolio</a> · GitHub: <a href="${candidate.githubUrl}" style="color: #0284c7;">github.com/Olumidenana</a>
            </p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

export async function sendDailyDigest(jobs: RemoteJob[], stats: ScanResult['stats'], targetEmail?: string): Promise<EmailDispatchResult> {
  const recipient = targetEmail || process.env.JOB_ALERT_EMAIL || DEFAULT_CANDIDATE.email;
  const resendApiKey = process.env.RESEND_API_KEY;
  const htmlContent = buildEmailHtml(jobs, stats);

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Remote Job Hunter <alerts@resend.dev>',
          to: recipient,
          subject: `⚡ ${jobs.length} Remote Job Matches for Olumide (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          provider: 'Resend',
          recipient,
          messageId: data.id,
          jobCount: jobs.length,
        };
      }
    } catch (err) {
      console.error('Failed to send via Resend:', err);
    }
  }

  // 2. Default Preview / Fallback mode
  // The email is generated and ready to be viewed in the UI or sent when API key is provided
  return {
    success: true,
    provider: 'PreviewMode',
    recipient,
    jobCount: jobs.length,
    previewHtml: htmlContent,
    note: 'Digest compiled successfully! To receive live delivery in your inbox, set RESEND_API_KEY in Vercel or your .env.local file.',
  };
}
