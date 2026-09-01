import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

// Admin client for auth.users creation
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Database client using anon key (has full PostgreSQL table permissions)
const supabaseDb = createClient(supabaseUrl, anonKey);

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      phone,
      password,
      profession,
      city,
      state,
      pan,
      aadhaar,
      role,
      teamLeaderCode,
      accountHolder,
      bankAccount,
      bankName,
      ifsc,
      avatarUrl,
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/\D/g, '').trim();
    const cleanPan = (pan || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().trim();
    const cleanAadhaar = (aadhaar || '').replace(/\D/g, '').trim();

    // 1. Check duplicate email in profiles
    const { data: existingEmail } = await supabaseDb
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json({ error: 'This email address is already registered. Please sign in instead.' }, { status: 400 });
    }

    // 2. Check duplicate phone
    if (cleanPhone) {
      const { data: existingPhone } = await supabaseDb
        .from('profiles')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingPhone) {
        return NextResponse.json({ error: 'This mobile number is already registered. Please sign in instead.' }, { status: 400 });
      }
    }

    // 3. Check duplicate PAN
    if (cleanPan) {
      const { data: existingPan } = await supabaseDb
        .from('profiles')
        .select('id')
        .eq('pan', cleanPan)
        .maybeSingle();

      if (existingPan) {
        return NextResponse.json({ error: 'This PAN card number is already registered with another account.' }, { status: 400 });
      }
    }

    // 4. Create Supabase Auth User with confirmed email via Auth Admin
    let userId = '';
    try {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password.trim(),
        email_confirm: true,
        user_metadata: { name: name.trim(), phone: cleanPhone, role },
      });

      if (authUser?.user?.id) {
        userId = authUser.user.id;
      }
    } catch (e: any) {
      console.warn('Auth user admin create notice:', e.message);
    }

    if (!userId) {
      userId = crypto.randomUUID();
    }

    // 5. Resolve team leader referral code to leader's UUID
    let resolvedLeaderId: string | null = null;
    if (teamLeaderCode && teamLeaderCode.trim()) {
      const cleanCode = teamLeaderCode.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);
      if (isUuid) {
        resolvedLeaderId = cleanCode;
      } else {
        try {
          const { data: leaderProfile } = await supabaseDb
            .from('profiles')
            .select('id')
            .or(`team_code.eq.${cleanCode},user_referral_code.eq.${cleanCode}`)
            .maybeSingle();
          if (leaderProfile?.id) {
            resolvedLeaderId = leaderProfile.id;
          }
        } catch (e) {
          console.warn('Leader code lookup notice:', e);
        }
      }
    }

    const cleanNamePrefix = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'PART';
    const generatedTeamCode = role === 'team_leader'
      ? `TL-${cleanNamePrefix}-${Math.floor(Math.random() * 900 + 100)}`
      : `IND-${cleanNamePrefix.slice(0, 3)}-${Math.floor(Math.random() * 900 + 100)}`;

    const registrationTime = new Date().toISOString();

    // 6. Upsert into profiles table (using supabaseDb)
    const profilePayload: any = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      profession: profession || 'Direct Selling Agent (DSA)',
      city: (city || '').trim(),
      state: (state || '').trim(),
      pan: cleanPan,
      aadhaar: cleanAadhaar,
      role: teamLeaderCode ? 'team_member' : (role || 'individual'),
      status: 'kyc_submitted',
      team_code: generatedTeamCode,
      user_referral_code: generatedTeamCode,
      referred_by_leader_id: resolvedLeaderId,
      avatar_url: avatarUrl || null,
      is_email_verified: true,
      prime_points: 0,
      lifetime_points_earned: 0,
      kyc_submitted_at: registrationTime,
      joined_at: registrationTime,
    };

    let createdProfile: any = null;
    const { data: upsertData, error: profileErr } = await supabaseDb
      .from('profiles')
      .upsert([profilePayload], { onConflict: 'email' })
      .select('*')
      .single();

    if (profileErr) {
      console.warn('First profile upsert attempt notice:', profileErr.message);
      // Fallback: If error is caused by a missing optional column, strip and retry
      const fallbackPayload = { ...profilePayload };
      if (profileErr.message?.includes('user_referral_code')) {
        delete fallbackPayload.user_referral_code;
      }
      if (profileErr.message?.includes('aadhaar')) {
        delete fallbackPayload.aadhaar;
      }
      if (profileErr.message?.includes('avatar_url')) {
        delete fallbackPayload.avatar_url;
      }

      const { data: retryData, error: retryErr } = await supabaseDb
        .from('profiles')
        .upsert([fallbackPayload], { onConflict: 'email' })
        .select('*')
        .single();

      if (retryErr) {
        console.error('API profile insert retry error:', retryErr.message);
        return NextResponse.json({ error: retryErr.message }, { status: 500 });
      }
      createdProfile = retryData;
    } else {
      createdProfile = upsertData;
    }

    // 7. Initial notification in notifications table
    try {
      await supabaseDb.from('notifications').insert([
        {
          partner_id: userId,
          title: 'Application Under Review',
          message: "Your partner application is under verification. We'll send you an SMS when you are verified (takes 24 to 48 hours). After verification, you will receive your 100 PrimePoints sign-up bonus.",
          type: 'info',
          is_read: false,
        },
      ]);
    } catch (notifErr) {
      console.warn('Initial notification insert notice:', notifErr);
    }

    // 8. Insert optional bank details
    if (accountHolder?.trim() || bankAccount?.trim() || ifsc?.trim()) {
      try {
        await supabaseDb.from('bank_accounts').insert([
          {
            partner_id: userId,
            account_holder_name: accountHolder.trim() || name.trim(),
            bank_name: bankName?.trim() || 'Bank',
            account_number: bankAccount?.trim() || '',
            ifsc_code: ifsc?.trim().toUpperCase() || '',
            is_verified: false,
          },
        ]);
      } catch (bankErr) {
        console.warn('Bank details insert notice:', bankErr);
      }
    }

    return NextResponse.json({
      success: true,
      profile: createdProfile || profilePayload,
    });
  } catch (err: any) {
    console.error('Register API error:', err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred during registration.' }, { status: 500 });
  }
}
