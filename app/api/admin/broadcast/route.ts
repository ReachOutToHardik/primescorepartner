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

    const { title, message, type, isActive } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('broadcasts')
      .insert([
        {
          title: title.trim(),
          message: message.trim(),
          type: type || 'info',
          is_active: isActive !== false,
          published_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Server broadcast insert error:', error.message);
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

    const { id, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID is required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('broadcasts')
      .update({ is_active: isActive })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Server broadcast update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
