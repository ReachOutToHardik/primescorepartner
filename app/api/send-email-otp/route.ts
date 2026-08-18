import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { toEmail, otpCode } = await req.json();

    if (!toEmail) {
      return NextResponse.json({ error: 'Target email address is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || '';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Primescore OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8f9fa;">

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Email Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Banner Area -->
          <tr>
            <td align="center" style="padding: 0;">
              <img src="https://myimgs.org/storage/images/28261/Untitleddesign.jpg" alt="Primescore Banner" style="width: 100%; max-width: 500px; height: auto; display: block; border: 0;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding: 32px 32px 24px 32px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Your Verification Code</h2>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Use the following 6-digit security OTP to complete your partner account registration on the Primescore Partner Portal.
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 12px; color: #111827; margin-left: 12px;">${otpCode}</span>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 32px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                &copy; 2026 Primescore. All rights reserved.<br>
                <a href="https://primescore.in" style="color: #f34e4e; text-decoration: none; font-weight: 500;">primescore.in</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Primescore Partner <partner@update.primescore.in>',
        to: [toEmail],
        subject: `Your Verification Code: ${otpCode} - Primescore Partner Portal`,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (resendRes.ok) {
      return NextResponse.json({ success: true, data: resendData });
    } else {
      console.error('Resend API error:', resendData);
      return NextResponse.json({ error: 'Failed to send email via Resend API', details: resendData }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Send OTP route error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
