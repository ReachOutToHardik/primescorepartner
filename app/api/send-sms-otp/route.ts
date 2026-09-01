import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Target mobile number is required' }, { status: 400 });
    }

    if (!otpCode) {
      return NextResponse.json({ error: 'OTP code is required' }, { status: 400 });
    }

    const cleanNumber = String(phoneNumber).replace(/\D/g, '').slice(-10);

    if (cleanNumber.length !== 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    const apiKey = process.env.ISHANI_SMS_API_KEY || 'cHM0MDgudHJhbnM6WUE5Zlc=';
    const apiUrl = process.env.ISHANI_SMS_URL || 'https://api.ishani.ltd/platform/send-sms';
    const senderId = process.env.ISHANI_SMS_SENDER_ID || 'PRMESC';
    const templateId = process.env.ISHANI_SMS_TEMPLATE_ID || '1707177667685411915';

    const text = `${otpCode} is the OTP for Primescore account verification. This is valid for 10 minutes. Please DO NOT SHARE OTP WITH ANYONE. Primescore.`;

    const payload = {
      senderid: senderId,
      templateid: templateId,
      text: text,
      number: cleanNumber,
      isflash: false,
      isunicode: false,
      corelationid: '',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error('Ishani SMS API error:', data);
      return NextResponse.json({ error: 'Failed to dispatch SMS', details: data }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Send SMS OTP route error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
