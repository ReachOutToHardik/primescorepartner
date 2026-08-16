import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duehdrdffguwvipgqywh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZWhkcmRmZmd1d3ZpcGdxeXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTgxMjYsImV4cCI6MjEwMjI5NDEyNn0.htI8EmajgVsejbwSUAuhuL4qUtYIiyebR-67O4gv_jw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          profession: string | null;
          city: string | null;
          state: string | null;
          pan: string | null;
          status: 'pending_kyc' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected';
          role: 'individual' | 'team_leader' | 'team_member';
          team_code: string | null;
          referred_by_leader_id: string | null;
          prime_points: number;
          tier: string;
          avatar_url: string | null;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          partner_id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          city: string | null;
          service_name: string;
          notes: string | null;
          current_stage: string;
          partner_points_earned: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
