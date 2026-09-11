import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client — bypasses RLS, used only server-side
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify the caller's own Supabase session via cookie ──────────────
    const cookieStore = await cookies();
    const supabaseUser = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only in route handler — ignore writes
        },
      },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in and try again.' },
        { status: 401 }
      );
    }

    const partnerId = user.id;
    const sessionEmail = user.email!;

    // ── 2. Parse optional reason from body (safe — we don't trust any ID from body) ──
    let reason = 'Self-service account deletion';
    try {
      const body = await req.json();
      if (body?.reason && typeof body.reason === 'string') {
        reason = body.reason.slice(0, 500); // max 500 chars
      }
    } catch {
      // body may be absent — that's fine
    }

    // ── 3. Fetch partner snapshot BEFORE any destructive operations ──────────
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, phone, city, state, pan, role, status, joined_at, prime_points, lifetime_points_earned')
      .eq('id', partnerId)
      .maybeSingle();

    // Count referrals for the snapshot
    const { count: referralCount } = await supabaseAdmin
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', partnerId);

    // Capture IP + UA for compliance
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null;
    const userAgent = req.headers.get('user-agent') || null;

    // ── 4. Write immutable `deleted_accounts` snapshot row FIRST ────────────
    //    Even if later steps fail, the record is preserved.
    const { error: snapError } = await supabaseAdmin.from('deleted_accounts').insert([
      {
        original_id: partnerId,
        name: profile?.name || null,
        email: sessionEmail,
        phone: profile?.phone || null,
        city: profile?.city || null,
        state: profile?.state || null,
        pan: profile?.pan || null,
        role: profile?.role || null,
        status_at_deletion: profile?.status || null,
        joined_at: profile?.joined_at || null,
        lifetime_points_earned: profile?.lifetime_points_earned || 0,
        referral_count: referralCount || 0,
        deletion_reason: reason,
        deleted_at: new Date().toISOString(),
        deleted_by: 'self',
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    ]);

    if (snapError) {
      console.error('deleted_accounts insert error:', snapError.message);
      // Non-fatal — proceed with deletion; log error only
    }

    // ── 5. Cascade delete in FK dependency order ─────────────────────────────
    const tables: { table: string; column: string }[] = [
      { table: 'point_transactions', column: 'partner_id' },
      { table: 'redemptions',        column: 'partner_id' },
      { table: 'referrals',          column: 'partner_id' },
      { table: 'notifications',      column: 'recipient_id' },
      { table: 'partners',           column: 'id' },
      { table: 'profiles',           column: 'id' },
    ];

    for (const { table, column } of tables) {
      const { error } = await supabaseAdmin.from(table).delete().eq(column, partnerId);
      if (error) {
        console.warn(`${table} delete note:`, error.message);
      }
    }

    // ── 6. Delete Supabase Auth user ─────────────────────────────────────────
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(partnerId);
    if (authDeleteError) {
      console.warn('Auth user delete note:', authDeleteError.message);
    }

    // ── 7. Audit log ─────────────────────────────────────────────────────────
    await supabaseAdmin.from('audit_logs').insert([
      {
        action: 'PARTNER_ACCOUNT_DELETED',
        action_type: 'partner_deleted',
        actor_name: profile?.name || sessionEmail,
        actor_role: 'partner_self',
        target_entity: sessionEmail,
        category: 'auth',
        details: {
          email: sessionEmail,
          reason,
          role: profile?.role,
          lifetimePoints: profile?.lifetime_points_earned || 0,
          deletedAt: new Date().toISOString(),
          ipAddress,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your partner account and all associated data have been permanently deleted.',
    });
  } catch (error: any) {
    console.error('Delete account API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete account. Please contact partner support.' },
      { status: 500 }
    );
  }
}
