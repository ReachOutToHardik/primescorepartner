import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: Request) {
  try {
    const adminPasswordHeader = req.headers.get('x-admin-password');
    const masterPassword = process.env.ADMIN_PASSWORD;

    // Verify admin authentication header
    if (!masterPassword || adminPasswordHeader !== masterPassword) {
      return NextResponse.json(
        { error: 'Unauthorized admin request.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rowsToInsert } = body;

    if (!rowsToInsert || !Array.isArray(rowsToInsert) || rowsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty notification rows.' },
        { status: 400 }
      );
    }

    // Insert via server-side client
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(rowsToInsert)
      .select('*');

    if (error) {
      console.error('Server notification insert error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('API route exception:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
