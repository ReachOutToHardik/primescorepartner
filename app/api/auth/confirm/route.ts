import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find user in auth.users
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = userList.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 });
    }

    // 2. Mark email as confirmed in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Email ${cleanEmail} verified and confirmed.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
