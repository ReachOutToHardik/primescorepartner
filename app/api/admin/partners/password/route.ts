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
    const masterPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Primescore@Admin2026';

    if (adminHeader !== masterPassword) {
      return NextResponse.json({ error: 'Unauthorized admin request.' }, { status: 401 });
    }

    const { partnerId, newPassword } = await req.json();

    if (!partnerId || !newPassword) {
      return NextResponse.json({ error: 'partnerId and newPassword are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 1. Update Supabase Auth User Password if user exists in auth.users
    try {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(partnerId, {
        password: newPassword,
      });
      if (authErr) {
        console.warn('Auth updateUserById note (user may use custom auth):', authErr.message);
      }
    } catch (e: any) {
      console.warn('Auth update skipped:', e.message);
    }

    // 2. Update profiles / partners table in Supabase
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .eq('id', partnerId);

    if (profileErr) {
      // Also try partners table fallback
      await supabaseAdmin
        .from('partners')
        .update({ password: newPassword })
        .eq('id', partnerId);
    }

    // 3. Log Audit Trail
    try {
      await supabaseAdmin.from('admin_audit_logs').insert([
        {
          action: 'PARTNER_PASSWORD_RESET',
          target_id: partnerId,
          details: `Partner password updated by Admin HQ`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      // ignore log insertion error
    }

    return NextResponse.json({ success: true, message: 'Partner password updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
