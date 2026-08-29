import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, service, partnerName, userReferralCode } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email address is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || '';
    const code = (userReferralCode || 'PSMKMVLN').trim().toUpperCase();
    const trackingUrl = `https://dashboard.primescore.in/ref/${code}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to PrimeScore</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #111827; line-height: 1.6; background-color: #ffffff;">

  <p style="margin: 0 0 16px 0;">Hello <strong>${customerName || 'Valued Customer'}</strong>,</p>
  
  <p style="margin: 0 0 16px 0;">
    Your credit rectification case for <strong>${service || 'Bureau Report Rectification'}</strong> has been registered into the PrimeScore platform by your partner <strong>${partnerName || 'Financial Partner'}</strong>!
  </p>

  <p style="margin: 0 0 24px 0;">
    Join your personal PrimeScore Customer Dashboard to inspect all 4 credit bureau reports (CIBIL, Experian, Equifax, CRIF High Mark) and track your dispute status live:
  </p>

  <p style="margin: 0 0 24px 0;">
    <a href="${trackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #1B2A72; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: 700; border-radius: 6px; font-size: 14px;">
      Access Your Dashboard &rarr;
    </a>
  </p>

  <p style="margin: 0; font-size: 13px; color: #6b7280;">
    Direct Dashboard Link: <a href="${trackingUrl}" style="color: #1B2A72; text-decoration: underline; font-weight: 600;">${trackingUrl}</a>
  </p>

</body>
</html>
    `;

    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY is not configured in .env.local. Simulating email log dispatch:');
      console.log(`✉️ [LEAD WELCOME EMAIL DISPATCH TO]: ${customerEmail}`);
      console.log(`🔗 Tracking URL: ${trackingUrl}`);
      return NextResponse.json({ success: true, simulated: true, trackingUrl });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'PrimeScore Operations <onboarding@resend.dev>',
        to: [customerEmail.trim()],
        subject: `Welcome to PrimeScore - Track Your Credit Bureau Report`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.warn('Resend API Lead Welcome Email Note:', resendData);
      return NextResponse.json({ success: true, warning: resendData?.message || 'Email logged', trackingUrl });
    }

    return NextResponse.json({ success: true, id: resendData.id, trackingUrl });
  } catch (error: any) {
    console.error('Lead Welcome Email Route Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
