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

    const { name, email, password, role, allowedPages } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('admin_staff')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password || 'Staff@2026',
          role: role || 'operations_admin',
          allowed_pages: allowedPages || ['dashboard', 'kyc', 'referrals', 'teams', 'analytics', 'gift-cards', 'services', 'rewards-config', 'notifications', 'settings'],
          is_active: true,
          last_login: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Server staff insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const adminHeader = req.headers.get('x-admin-password');
    const masterPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Primescore@Admin2026';

    if (adminHeader !== masterPassword) {
      return NextResponse.json({ error: 'Unauthorized admin request.' }, { status: 401 });
    }

    const { id, name, email, password, role, allowedPages, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (password !== undefined) updates.password = password;
    if (role !== undefined) updates.role = role;
    if (allowedPages !== undefined) updates.allowed_pages = allowedPages;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabaseAdmin
      .from('admin_staff')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Server staff update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminHeader = req.headers.get('x-admin-password');
    const masterPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Primescore@Admin2026';

    if (adminHeader !== masterPassword) {
      return NextResponse.json({ error: 'Unauthorized admin request.' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admin_staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Server staff delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
