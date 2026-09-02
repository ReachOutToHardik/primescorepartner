import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomInt } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

const HMAC_SECRET = serviceRoleKey || 'primescore-reset-secret-2026';
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const ALERT_EMAIL = 'info@primescore.in';

const rateLimitStore = new Map<string, { count: number; windowStart: number; alerted: boolean }>();

// Admin client for auth.users admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Database client using anon key (has full PostgreSQL table permissions on public.profiles)
const supabaseDb = createClient(supabaseUrl, anonKey);

function signToken(phone: string, otp: string, expiresAt: number): string {
  const payload = phone + ':' + otp + ':' + expiresAt;
  return createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
}

function verifyToken(phone: string, otp: string, expiresAt: number, token: string): boolean {
  const expected = signToken(phone, otp, expiresAt);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

async function sendAbuseAlert(phone: string, ip: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const html =
    '<div style="font-family:-apple-system,sans-serif;padding:24px;color:#111827">' +
    '<h2 style="color:#dc2626">Security Alert: Password Reset Abuse</h2>' +
    '<p>Suspicious reset attempts on the Primescore Partner Portal.</p>' +
    '<p><strong>Phone:</strong> ' + phone + '</p>' +
    '<p><strong>IP:</strong> ' + ip + '</p>' +
    '<p><strong>Time (IST):</strong> ' + now + '</p>' +
    '<p><strong>Attempts:</strong> ' + MAX_ATTEMPTS + '+ in ' + (RATE_LIMIT_WINDOW_MS / 60000) + ' minutes</p>' +
    '<p style="color:#6b7280;font-size:13px">This number is temporarily blocked.</p>' +
    '</div>';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + resendKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Primescore Security <partner@update.primescore.in>',
      to: [ALERT_EMAIL],
      subject: '[SECURITY ALERT] Password reset rate limit exceeded: ' + phone,
      html,
    }),
  }).catch(() => null);
}

// Helper: robust phone-to-profile lookup
async function findProfileByPhone(cleanPhone: string) {
  const formattedPhone = cleanPhone.slice(0, 5) + ' ' + cleanPhone.slice(5);
  const orFilter = [
    'phone.eq.' + cleanPhone,
    'phone.eq.0' + cleanPhone,
    'phone.eq.+91' + cleanPhone,
    'phone.eq.91' + cleanPhone,
    'phone.eq.' + formattedPhone,
    'phone.ilike.%' + cleanPhone + '%',
  ].join(',');

  const { data: profile } = await supabaseDb
    .from('profiles')
    .select('id, email, name, phone')
    .or(orFilter)
    .maybeSingle();

  if (profile) return profile;

  // Fallback: check Supabase Auth users metadata
  try {
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const matchedUser = userList?.users?.find((u) => {
      const uPhone = String(u.phone || u.user_metadata?.phone || '').replace(/\D/g, '');
      return uPhone.length >= 10 && (uPhone.endsWith(cleanPhone) || cleanPhone.endsWith(uPhone));
    });
    if (matchedUser) {
      return {
        id: matchedUser.id,
        email: matchedUser.email || '',
        name: matchedUser.user_metadata?.name || 'Partner',
        phone: matchedUser.phone || matchedUser.user_metadata?.phone || cleanPhone,
      };
    }
  } catch (err) {
    console.warn('Auth user list lookup fallback note:', err);
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (action === 'send-otp') {
      const { phone } = body;
      if (!phone) {
        return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 });
      }

      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
      }

      const now = Date.now();
      const rl = rateLimitStore.get(cleanPhone);
      if (rl) {
        const inWindow = now - rl.windowStart < RATE_LIMIT_WINDOW_MS;
        if (inWindow && rl.count >= MAX_ATTEMPTS) {
          if (!rl.alerted) {
            rateLimitStore.set(cleanPhone, { ...rl, alerted: true });
            await sendAbuseAlert(cleanPhone, ip);
          }
          const retryMins = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rl.windowStart)) / 60000);
          return NextResponse.json(
            {
              error:
                'Too many attempts. Please wait ' +
                retryMins +
                ' minute' +
                (retryMins > 1 ? 's' : '') +
                ' and try again.',
              rateLimited: true,
            },
            { status: 429 }
          );
        }
        rateLimitStore.set(
          cleanPhone,
          inWindow
            ? { ...rl, count: rl.count + 1 }
            : { count: 1, windowStart: now, alerted: false }
        );
      } else {
        rateLimitStore.set(cleanPhone, { count: 1, windowStart: now, alerted: false });
      }

      const profile = await findProfileByPhone(cleanPhone);

      if (!profile) {
        return NextResponse.json(
          {
            error:
              'No partner account found for this number. Please register first at partner.primescore.in/register',
            notFound: true,
          },
          { status: 404 }
        );
      }

      const otp = randomInt(100000, 999999).toString();
      const expiresAt = Date.now() + OTP_EXPIRY_MS;
      const token = signToken(cleanPhone, otp, expiresAt);

      const smsText =
        otp +
        ' is the OTP for Primescore account verification. This is valid for 10 minutes. Please DO NOT SHARE OTP WITH ANYONE. Primescore.';

      await fetch(process.env.ISHANI_SMS_URL || 'https://api.ishani.ltd/platform/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ISHANI_SMS_API_KEY || 'cHM0MDgudHJhbnM6WUE5Zlc=',
        },
        body: JSON.stringify({
          senderid: process.env.ISHANI_SMS_SENDER_ID || 'PRMESC',
          templateid: process.env.ISHANI_SMS_TEMPLATE_ID || '1707177667685411915',
          text: smsText,
          number: cleanPhone,
          isflash: false,
          isunicode: false,
          corelationid: '',
        }),
      }).catch((err) => console.error('Ishani SMS dispatch error:', err));

      const maskedEmail = profile.email
        ? profile.email.slice(0, 3) + '***@' + profile.email.split('@')[1]
        : null;

      return NextResponse.json({ success: true, token, expiresAt, maskedEmail });
    }

    if (action === 'verify-otp') {
      const { phone, otp, token, expiresAt } = body;
      if (!phone || !otp || !token || !expiresAt) {
        return NextResponse.json({ error: 'Missing verification fields.' }, { status: 400 });
      }
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (Date.now() > Number(expiresAt)) {
        return NextResponse.json(
          { error: 'This OTP has expired after 10 minutes. Please request a new one.' },
          { status: 400 }
        );
      }
      if (!verifyToken(cleanPhone, String(otp), Number(expiresAt), String(token))) {
        return NextResponse.json(
          { error: 'Invalid OTP code. Please check and try again.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'reset-password') {
      const { phone, otp, token, expiresAt, newPassword } = body;
      if (!phone || !otp || !token || !expiresAt || !newPassword) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
      }
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (Date.now() > Number(expiresAt)) {
        return NextResponse.json(
          { error: 'Session expired. Please restart the reset process.' },
          { status: 400 }
        );
      }
      if (!verifyToken(cleanPhone, String(otp), Number(expiresAt), String(token))) {
        return NextResponse.json({ error: 'Invalid session token. Please restart.' }, { status: 400 });
      }
      if (String(newPassword).length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long.' },
          { status: 400 }
        );
      }

      const profile = await findProfileByPhone(cleanPhone);

      if (!profile) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }

      // Resolve the actual Supabase Auth user ID
      let authUserId: string | null = null;

      if (profile.email) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const user = listData?.users?.find(
          (u) => u.email?.toLowerCase() === profile.email.toLowerCase()
        );
        if (user) authUserId = user.id;
      }

      if (!authUserId && profile.id) {
        try {
          const { data: directUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          if (directUser?.user) authUserId = directUser.user.id;
        } catch (_) {}
      }

      if (authUserId) {
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password: newPassword,
          email_confirm: true,
        });

        if (updateErr) {
          console.error('Supabase password update error:', updateErr.message);
          return NextResponse.json(
            { error: 'Failed to update password: ' + updateErr.message },
            { status: 500 }
          );
        }
      } else if (profile.email) {
        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: profile.email,
          password: newPassword,
          email_confirm: true,
          user_metadata: { name: profile.name, phone: profile.phone },
        });

        if (createErr) {
          console.error('Supabase user create error during reset:', createErr.message);
          return NextResponse.json(
            { error: 'Failed to set password: ' + createErr.message },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json({ error: 'No email associated with this account.' }, { status: 400 });
      }

      rateLimitStore.delete(cleanPhone);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Reset password route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
