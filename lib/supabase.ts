import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duehdrdffguwvipgqywh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZWhkcmRmZmd1d3ZpcGdxeXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTgxMjYsImV4cCI6MjEwMjI5NDEyNn0.htI8EmajgVsejbwSUAuhuL4qUtYIiyebR-67O4gv_jw';

// Custom storage adapter that reads the Remember Me flag.
// If the partner chose "Remember Me (7 days)" → use localStorage.
// Otherwise → sessionStorage so session dies when the tab closes.
const smartStorage = typeof window !== 'undefined'
  ? {
      getItem: (key: string): string | null => {
        // Always check localStorage first (for remember-me sessions)
        const lsVal = window.localStorage.getItem(key);
        if (lsVal) return lsVal;
        return window.sessionStorage.getItem(key);
      },
      setItem: (key: string, value: string): void => {
        const rememberMe = window.localStorage.getItem('primescore-remember-me') === 'true';
        if (rememberMe) {
          window.localStorage.setItem(key, value);
        } else {
          window.sessionStorage.setItem(key, value);
          // Also ensure localStorage doesn't have a stale entry
          window.localStorage.removeItem(key);
        }
      },
      removeItem: (key: string): void => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      },
    }
  : undefined;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: smartStorage,
    storageKey: 'primescore-auth-session',
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
          password: string | null;
          profession: string | null;
          city: string | null;
          state: string | null;
          pan: string | null;
          aadhaar: string | null;
          status: 'pending_kyc' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected';
          role: 'individual' | 'team_leader' | 'team_member';
          team_code: string | null;
          user_referral_code: string | null;
          referred_by_leader_id: string | null;
          prime_points: number;
          lifetime_points_earned: number;
          tier: string | null;
          avatar_url: string | null;
          is_email_verified: boolean;
          kyc_submitted_at: string | null;
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
          status_history: any | null; // JSON array of { status, date, note }
          partner_points_earned: number;
          points_earned: number | null;
          service_amount: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          partner_id: string | null;
          title: string;
          message: string;
          type: string;
          points_badge: string | null;
          is_read: boolean;
          created_at: string;
        };
      };
      point_transactions: {
        Row: {
          id: string;
          partner_id: string;
          referral_id: string | null;
          transaction_type: string;
          points_change: number;
          amount: number | null;
          balance_after: number;
          title: string;
          description: string | null;
          reference_id: string | null;
          created_at: string;
        };
      };
      referral_status_history: {
        Row: {
          id: string;
          referral_id: string;
          stage: string;
          note_details: string | null;
          updated_at: string;
        };
      };
      system_config: {
        Row: {
          id: string;
          submission_points: number | null;
          enrollment_points: number | null;
          conversion_points: number | null;
          team_leader_override_percent: number | null;
          points_per_inr: number | null;
          payout_mode: string | null;
          min_redemption_points: number | null;
          max_daily_redemption_points: number | null;
          tier_multipliers: any | null;
          profession_multipliers: any | null;
          updated_at: string;
        };
      };
    };
  };
};
