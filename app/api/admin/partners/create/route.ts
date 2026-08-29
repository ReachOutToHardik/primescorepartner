import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
  try {
    const adminHeader = req.headers.get('x-admin-password');
    const masterPassword = process.env.ADMIN_PASSWORD || 'Primescore@Admin2026';

    if (adminHeader !== masterPassword) {
      return NextResponse.json({ error: 'Unauthorized admin request.' }, { status: 401 });
    }

    const {
      name,
      email,
      phone,
      password,
      profession,
      city,
      state,
      pan,
      role,
      status,
      teamCode,
      referredByLeaderId,
    } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const userPassword = password || 'Partner@2026';

    // 1. Create Supabase Auth User
    let userId = '';
    try {
      const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: { name: name.trim(), phone: cleanPhone },
      });

      if (authUser?.user?.id) {
        userId = authUser.user.id;
      }
    } catch (e: any) {
      console.warn('Auth user creation note:', e.message);
    }

    if (!userId) {
      userId = crypto.randomUUID();
    }

    const namePart = (name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 5).toUpperCase();
    const randomCode = Math.floor(100 + Math.random() * 900);
    const finalTeamCode = teamCode ? teamCode.trim().toUpperCase() : `PS-${namePart}-${randomCode}`;

    // 2. Insert into profiles table
    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert(
        [
          {
            id: userId,
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            password: userPassword,
            profession: profession || 'Direct Selling Agent (DSA)',
            city: (city || 'Mumbai').trim(),
            state: (state || 'Maharashtra').trim(),
            pan: (pan || '').trim().toUpperCase(),
            role: role || 'individual',
            status: status || 'kyc_approved',
            team_code: finalTeamCode,
            referred_by_leader_id: referredByLeaderId || null,
            is_email_verified: true,
            prime_points: 100,
            lifetime_points_earned: 100,
            joined_at: new Date().toISOString(),
            kyc_submitted_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'email' }
      )
      .select('*')
      .single();

    if (profileErr) {
      console.error('Profile insert error:', profileErr.message);
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 3. Log 100 Pts welcome bonus transaction
    try {
      await supabaseAdmin.from('point_transactions').insert([
        {
          partner_id: userId,
          transaction_type: 'signup_bonus',
          points_change: 100,
          balance_after: 100,
          title: `🎁 Welcome Sign-up Bonus (Code: ${finalTeamCode})`,
          reference_id: 'BONUS-100',
        },
      ]);
    } catch (e) {
      // ignore point tx error
    }

    // 4. Log Audit Trail
    try {
      await supabaseAdmin.from('admin_audit_logs').insert([
        {
          action: 'PARTNER_CREATED',
          target_id: userId,
          details: `Direct onboarded partner profile: ${name} (${cleanEmail})`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      // ignore log error
    }

    return NextResponse.json({ success: true, data: profileData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
