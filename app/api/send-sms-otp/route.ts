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

    const apiKey = process.env.ISHANI_SMS_API_KEY || process.env.ISHANI_SMS_TOKEN || 'sk_8pOcawqCnYDl0637f3heCIonH2SQFSq7qck6nIz-0jU';
    const apiUrl = process.env.ISHANI_SMS_URL || 'https://prod-api.ishani.ltd/api/v1/sms/message';
    const senderId = process.env.ISHANI_SMS_SENDER_ID || 'PRMESC';
    const templateId = process.env.ISHANI_SMS_TEMPLATE_ID || '1707177667685411915';
    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

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

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr: any) {
      console.warn('Ishani SMS gateway network error:', networkErr?.message || networkErr);
      return NextResponse.json(
        { success: false, error: 'SMS Gateway unreachable', details: networkErr?.message },
        { status: 502 }
      );
    }

    const rawResponseText = await response.text();
    let data: any = null;

    try {
      data = JSON.parse(rawResponseText);
    } catch {
      data = { raw: rawResponseText };
    }

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error('Ishani SMS API returned non-200:', response.status, data || rawResponseText);
      return NextResponse.json(
        { success: false, error: 'Failed to dispatch SMS', details: data || rawResponseText },
        { status: response.status >= 400 && response.status < 600 ? response.status : 500 }
      );
    }
  } catch (err: any) {
    console.error('Send SMS OTP route error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message || 'Unknown error' }, { status: 500 });
  }
}
