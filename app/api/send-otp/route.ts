import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { toEmail, partnerName, otpCode } = await req.json();

    if (!toEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const code = otpCode || Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendOtpEmail({
      toEmail,
      partnerName,
      otpCode: code,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'OTP sent successfully', data: result.data, otpCode: code });
    } else {
      return NextResponse.json({ error: 'Failed to send email via Resend', details: result.error }, { status: 500 });
    }
  } catch (err: any) {
    console.error('OTP Route Error:', err);
    return NextResponse.json({ error: 'Server error sending email', details: err.message }, { status: 500 });
  }
}
