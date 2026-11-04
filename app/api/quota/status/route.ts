import { NextResponse } from 'next/server';
import { getQuotaStatus } from '@/lib/quota-tracker';

export const dynamic = 'force-dynamic';

export async function GET() {
  const quota = getQuotaStatus();
  return NextResponse.json({
    success: true,
    quota,
  });
}
