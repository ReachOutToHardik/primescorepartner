import { NextRequest, NextResponse } from 'next/server';
import { sendClientReferralWelcomeEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, service, partnerName, userReferralCode } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email address is required' }, { status: 400 });
    }

    const code = (userReferralCode || 'PSMKMVLN').trim().toUpperCase();
    const trackingUrl = `https://dashboard.primescore.in/ref/${code}`;

    const result = await sendClientReferralWelcomeEmail({
      toEmail: customerEmail.trim(),
      clientName: customerName || 'Valued Customer',
      partnerName: partnerName || 'Loan Advisor',
      serviceName: service || 'Credit Rectification',
      clientPortalUrl: trackingUrl,
    });

    return NextResponse.json({
      success: result.success,
      id: result.id,
      simulated: result.simulated,
      trackingUrl,
    });
  } catch (error: any) {
    console.error('Lead Welcome Email Route Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
