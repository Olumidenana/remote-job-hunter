import { NextResponse } from 'next/server';
import { getQuotaStatus } from '@/lib/quota-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const quota = getQuotaStatus();
  let resendEmails: any[] = [];
  let resendStatus: string = 'NO_KEY';

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails?limit=100', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      resendStatus = `HTTP_${res.status}`;
      if (res.ok) {
        const data = await res.json();
        resendEmails = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      } else {
        const errText = await res.text();
        resendStatus = `ERR_${res.status}_${errText.slice(0, 100)}`;
      }
    } catch (e: any) {
      resendStatus = `EXCEPTION_${e?.message || e}`;
    }
  }

  return NextResponse.json({
    success: true,
    quota,
    hasResendKey: !!apiKey,
    resendStatus,
    totalDispatchedInResend: resendEmails.length,
    sentEmails: resendEmails.map(e => ({
      id: e.id,
      to: e.to,
      subject: e.subject,
      created_at: e.created_at,
    })),
  });
}
