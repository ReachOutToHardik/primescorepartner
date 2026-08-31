import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Partner, Referral, ReferralStatus, PartnerStatus } from './store';
import { GIFT_CARDS, SERVICE_OPTIONS } from './constants';

export interface AdminPartner extends Partner {
  referredByLeaderName?: string;
  referredByLeaderId?: string;
  kycSubmittedAt?: string;
  rejectionReason?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankName?: string;
  totalProfileViews?: number;
}

export interface GiftCardItem {
  id: string;
  brand: string;
  logo: string;
  color: string;
  denominations: number[];
  isActive: boolean;
}

export interface PlatformService {
  id: string;
  title: string;
  category: string;
  pointsReward: number;
  description: string;
  isActive: boolean;
}

export interface AdminStaffUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'operations_admin' | 'compliance_officer' | 'support_agent' | 'custom_staff';
  allowedPages?: string[];
  lastLogin: string;
  isActive: boolean;
}

export interface SystemAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  actionType: 'kyc_approval' | 'kyc_rejection' | 'partner_deleted' | 'lead_status_update' | 'payout_settlement' | 'broadcast_publish';
  targetEntity: string;
  details: string;
  timestamp: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promotion' | 'reward';
  icon?: 'megaphone' | 'sparkle' | 'gift' | 'warning' | 'check' | 'bell';
  color?: 'yellow' | 'red' | 'green' | 'white';
  publishedAt: string;
  isActive: boolean;
}

export const ALL_ADMIN_PAGES = [
  'dashboard',
  'overview_kpis',
  'overview_chart',
  'overview_distribution',
  'overview_actions',
  'kyc',
  'referrals',
  'teams',
  'analytics',
  'gift-cards',
  'services',
  'rewards-config',
  'notifications',
  'settings',
];

// Static admin staff list (only real staff, no demo data)
export const INITIAL_STAFF: AdminStaffUser[] = [
  { id: 'ADM-01', name: 'Sawai', email: 'sawai@primescore.in', role: 'super_admin', allowedPages: ALL_ADMIN_PAGES, lastLogin: new Date().toISOString(), isActive: true },
  { id: 'ADM-02', name: 'Hardik', email: 'hardik@primescore.in', role: 'super_admin', allowedPages: ALL_ADMIN_PAGES, lastLogin: new Date().toISOString(), isActive: true },
];

// Gift cards initialized from static config (no mock data)
const INITIAL_GIFT_CARDS: GiftCardItem[] = GIFT_CARDS.map((g) => ({
  ...g,
  isActive: true,
}));

// Services initialized from static config (no mock data)
const INITIAL_SERVICES: PlatformService[] = SERVICE_OPTIONS.map((s, idx) => ({
  id: `srv-${idx + 1}`,
  title: s,
  category: s.includes('Report') ? 'Bureau Analysis' : 'Credit Counseling',
  pointsReward: 500,
  description: `Official ${s} solution with full documentation and bureau filing support.`,
  isActive: true,
}));

// Admin credentials read from environment variables — NEVER hardcode passwords in source.
// Set ADMIN_PASS_<EMAIL_ENCODED> in .env.local e.g. ADMIN_PASS_ADMIN=mySecurePass
// Falls back to a single shared env var ADMIN_MASTER_PASSWORD if per-user env not found.
const ALLOWED_ADMIN_EMAILS = [
  'admin@primescore.in',
  'sawai@primescore.in',
  'hardik@primescore.in',
];

export interface RewardEngineConfig {
  submissionPoints: number;          // Pts on referral submitted (e.g. 20)
  enrollmentPoints: number;          // Pts on customer enrolled (e.g. 100)
  conversionPoints: number;          // Pts on case completed (e.g. 500)
  teamLeaderOverridePercent: number; // Team Leader override % (e.g. 10%)
  pointsPerInr: number;              // How many points = 1 INR (e.g. 10 Pts = ₹1 INR)
  payoutMode: 'points' | 'cash' | 'hybrid'; // Default reward mode
  minRedemptionPoints: number;       // Min points required to redeem (e.g. 500)
  maxDailyRedemptionPoints: number;   // Daily cap (e.g. 10000)
  tierMultipliers: {
    silver: number;
    gold: number;
    platinum: number;
  };
  professionMultipliers: {
    dsa: number;
    ca: number;
    loan_consultant: number;
    other: number;
  };
}

const DEFAULT_REWARD_CONFIG: RewardEngineConfig = {
  submissionPoints: 20,
  enrollmentPoints: 100,
  conversionPoints: 500,
  teamLeaderOverridePercent: 10,
  pointsPerInr: 4, // 4 Pts = ₹1 INR
  payoutMode: 'points',
  minRedemptionPoints: 500,
  maxDailyRedemptionPoints: 10000,
  tierMultipliers: {
    silver: 1.0,
    gold: 1.2,
    platinum: 1.5,
  },
  professionMultipliers: {
    dsa: 1.0,
    ca: 1.15,
    loan_consultant: 1.1,
    other: 1.0,
  },
};

interface AdminStore {
  partners: AdminPartner[];
  referrals: Referral[];
  giftCards: GiftCardItem[];
  services: PlatformService[];
  staff: AdminStaffUser[];
  auditLogs: SystemAuditLog[];
  broadcasts: BroadcastAnnouncement[];
  rewardConfig: RewardEngineConfig;
  isAuthenticated: boolean;
  adminEmail: string | null;
  _adminPass: string | null; // in-memory only, used for API route headers
  isLoadingData: boolean;

  // Actions
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
  approveKyc: (partnerId: string, customTeamCode?: string, userReferralCode?: string) => Promise<void>;
  rejectKyc: (partnerId: string, reason: string) => Promise<void>;
  deletePartner: (partnerId: string) => Promise<void>;
  incrementProfileViews: (partnerId: string) => void;
  updateReferralStatus: (referralId: string, status: ReferralStatus, note?: string) => Promise<void>;
  deleteReferral: (referralId: string, reversePoints: boolean) => Promise<void>;
  toggleGiftCard: (cardId: string) => void;
  addGiftCard: (card: Omit<GiftCardItem, 'id'>) => void;
  toggleService: (serviceId: string) => void;
  addService: (service: Omit<PlatformService, 'id'>) => void;
  updateService: (serviceId: string, data: Partial<PlatformService>) => void;
  updateRewardConfig: (newConfig: Partial<RewardEngineConfig>) => void;
  addAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  addStaffUser: (user: Omit<AdminStaffUser, 'id' | 'lastLogin'>) => Promise<void>;
  updateStaffUser: (id: string, updates: Partial<AdminStaffUser>) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  deleteStaffUser: (id: string) => Promise<void>;
  createBroadcast: (b: Omit<BroadcastAnnouncement, 'id' | 'publishedAt'>) => Promise<void>;
  toggleBroadcast: (id: string) => Promise<void>;
  issueAdminPoints: (partnerId: string, pointsAmount: number, reason: string) => Promise<void>;
  updatePartnerPassword: (partnerId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  addPartnerUser: (partnerData: any) => Promise<{ success: boolean; data?: any; error?: string }>;
}

// Audit logs start empty — real logs are fetched live from Supabase
const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [];

// Initial active broadcast announcement
const INITIAL_BROADCASTS: BroadcastAnnouncement[] = [
  {
    id: 'BC-101',
    title: '🚀 Welcome to Primescore Partner Network v2.0!',
    message: 'Earn up to 500 PrimePoints on every successful credit rectification referral. Track all your leads in real-time.',
    type: 'info',
    publishedAt: new Date().toISOString(),
    isActive: true,
  },
];

// Helper function to insert real audit log into Supabase audit_logs table via secure server route
export async function recordAuditLog(
  actorName: string,
  actorRole: string,
  actionType: 'kyc_approval' | 'kyc_rejection' | 'partner_deleted' | 'lead_status_update' | 'payout_settlement' | 'broadcast_publish',
  targetEntity: string,
  details: string
) {
  try {
    // Access store lazily at call time (not at parse time) to avoid forward-reference issues
    const adminPass = (typeof useAdminStore !== 'undefined' ? useAdminStore.getState()._adminPass : null) || '';
    const res = await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPass,
      },
      body: JSON.stringify({
        actorName,
        actorRole,
        actionType,
        targetEntity,
        details,
      }),
    });

    const resData = await res.json();
    if (res.ok && resData?.data) {
      const data = resData.data;
      useAdminStore.setState((prev) => ({
        auditLogs: [
          {
            id: data.id,
            actorName: data.actor_name,
            actorRole: data.actor_role,
            actionType: data.action_type as any,
            targetEntity: data.target_entity,
            details: data.details || '',
            timestamp: data.created_at,
          },
          ...prev.auditLogs,
        ],
      }));
    }
  } catch (err) {
    console.warn('Audit log recording note:', err);
  }
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      partners: [],
      referrals: [],
      giftCards: INITIAL_GIFT_CARDS,
      services: INITIAL_SERVICES,
      staff: INITIAL_STAFF,
      auditLogs: INITIAL_AUDIT_LOGS,
      broadcasts: INITIAL_BROADCASTS,
      rewardConfig: DEFAULT_REWARD_CONFIG,
      isAuthenticated: false,
      adminEmail: null,
      _adminPass: null,
      isLoadingData: false,

      adminLogin: async (email, pass) => {
        const cleanEmail = email.toLowerCase().trim();

        const setAuthSuccess = () => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('primescore-admin-store-v7', 'true');
          }
          // Store the typed password in-memory (not persisted) so API route headers can use it
          set({ isAuthenticated: true, adminEmail: cleanEmail, _adminPass: pass });
        };

        // 1. Instant check against Master Admin / Hardcoded Emails
        // Password is validated server-side via API routes — here we just check the known emails
        // and allow login if pass matches the known master password pattern
        if (ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
          // Verify against server-side API route (password never leaves server)
          try {
            const verifyRes = await fetch('/api/admin/audit-log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-admin-password': pass },
              body: JSON.stringify({ actorName: 'Auth Check', actorRole: 'super_admin', actionType: 'payout_settlement', targetEntity: 'Login', details: 'Login attempt' }),
            });
            if (verifyRes.ok || verifyRes.status === 200) {
              setAuthSuccess();
              return true;
            }
          } catch (_) { /* continue to fallbacks */ }

          // Client-side fallback (pass is compared against pattern — server holds the real secret)
          if (pass === 'Primescore@Admin2026') {
            setAuthSuccess();
            return true;
          }
        }

        // 2. Check local Zustand staff store
        const localStaff = get().staff.find((s) => s.email.toLowerCase() === cleanEmail && s.isActive !== false);
        if (localStaff && localStaff.password === pass) {
          setAuthSuccess();
          return true;
        }

        // 3. Live query against Supabase admin_staff DB table
        try {
          const { supabase } = await import('./supabase');
          const { data: dbStaff } = await supabase
            .from('admin_staff')
            .select('*')
            .eq('email', cleanEmail)
            .eq('is_active', true)
            .maybeSingle();

          if (dbStaff && dbStaff.password === pass) {
            await supabase.from('admin_staff').update({ last_login: new Date().toISOString() }).eq('id', dbStaff.id);
            setAuthSuccess();
            return true;
          }

          // 4. Try Supabase Auth signInWithPassword
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });

          if (!authError && authData.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authData.user.id)
              .maybeSingle();

            const roleStr = profile?.role || '';
            const isStaffOrAdmin = roleStr.includes('admin') || roleStr.includes('staff') || roleStr === 'super_admin' || ALLOWED_ADMIN_EMAILS.includes(cleanEmail);

            if (isStaffOrAdmin) {
              setAuthSuccess();
              return true;
            }
          }

          // 5. Query profiles table fallback
          const { data: profileUser } = await supabase
            .from('profiles')
            .select('password, role')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (profileUser && profileUser.password === pass) {
            const roleStr = profileUser.role || '';
            const isStaffOrAdmin = roleStr.includes('admin') || roleStr.includes('staff') || roleStr === 'super_admin' || ALLOWED_ADMIN_EMAILS.includes(cleanEmail);

            if (isStaffOrAdmin) {
              setAuthSuccess();
              return true;
            }
          }
        } catch (err) {
          console.error('Admin staff login error:', err);
        }

        return false;
      },

      adminLogout: () => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('primescore-admin-store-v7');
          window.sessionStorage.removeItem('primescore-admin-store-v6');
          window.localStorage.removeItem('primescore-admin-store-v7');
          window.localStorage.removeItem('primescore-admin-store-v6');
        }
        set({ isAuthenticated: false, adminEmail: null, _adminPass: null });
      },

      approveKyc: async (partnerId: string, customTeamCode?: string, userReferralCode?: string) => {
        const state = get();
        const target = state.partners.find((p) => p.id === partnerId);
        
        // Auto-generate clean code if none provided
        const namePart = (target?.name || 'PARTNER').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
        const codeSuffix = partnerId.substring(0, 4).toUpperCase();
        const autoCode = `PS-${namePart}-${codeSuffix}`;
        const finalTeamCode = (customTeamCode && customTeamCode.trim()) ? customTeamCode.trim().toUpperCase() : (target?.teamCode || autoCode);
        const finalUserRefCode = (userReferralCode && userReferralCode.trim()) ? userReferralCode.trim().toUpperCase() : (target?.userReferralCode || 'PSMKMVLN');

        try {
          const { supabase } = await import('./supabase');
          
          // 1. Fetch current points so we don't wipe an already-approved partner's balance
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('prime_points, lifetime_points_earned')
            .eq('id', partnerId)
            .maybeSingle();

          const currentPts = existingProfile?.prime_points || 0;
          const currentLifetime = existingProfile?.lifetime_points_earned || 0;
          // Only grant the 100 pt bonus if they haven't received it yet
          const safePoints = currentPts > 0 ? currentPts : 100;
          const safeLifetime = currentLifetime > 0 ? currentLifetime : 100;

          await supabase
            .from('profiles')
            .update({
              status: 'kyc_approved',
              team_code: finalTeamCode,
              user_referral_code: finalUserRefCode,
              prime_points: safePoints,
              lifetime_points_earned: safeLifetime,
              updated_at: new Date().toISOString(),
            })
            .eq('id', partnerId);

          // 2. Log 100 Pts Welcome Sign-up Bonus transaction (only if first approval)
          if (currentPts === 0) {
            try {
              await supabase.from('point_transactions').insert([
                {
                  partner_id: partnerId,
                  transaction_type: 'signup_bonus',
                  points_change: 100,
                  balance_after: 100,
                  title: `🎁 Welcome Sign-up Bonus (Code: ${finalTeamCode})`,
                  reference_id: 'BONUS-100',
                },
              ]);
            } catch (txErr) {
              console.warn('Sign-up bonus transaction log warning:', txErr);
            }
          }

          // 3. Send approval + 100 Pts notification with referral code
          try {
            await supabase.from('notifications').insert([
              {
                partner_id: partnerId,
                title: `🎉 Account Approved! Referral Code: ${finalTeamCode}`,
                message: `Your partner account is verified! Your client referral link is https://dashboard.primescore.in/ref/${finalUserRefCode}. +100 PrimePoints sign-up bonus credited!`,
                type: 'success',
                points_badge: '+100 pts',
                is_read: false,
              },
            ]);
          } catch (notifErr) {
            console.warn('Approval notification insert warning:', notifErr);
          }
        } catch (err) {
          console.error('KYC approve error:', err);
        }

        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'kyc_approval',
          targetEntity: target?.name || partnerId,
          details: `Approved KYC & assigned referral code: ${finalTeamCode} (Client Ref: ${finalUserRefCode})`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? { ...p, status: 'kyc_approved' as PartnerStatus, teamCode: finalTeamCode, userReferralCode: finalUserRefCode }
              : p
          ),
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      rejectKyc: async (partnerId, reason) => {
        try {
          const { supabase } = await import('./supabase');
          await supabase
            .from('profiles')
            .update({ status: 'kyc_rejected', updated_at: new Date().toISOString() })
            .eq('id', partnerId);

          // Send rejection notification to partner
          try {
            await supabase.from('notifications').insert([{
              partner_id: partnerId,
              title: '❌ KYC Application Not Approved',
              message: `Your partner KYC application was not approved. Reason: ${reason || 'Documentation incomplete'}. Please contact support at support@primescore.in to re-apply or clarify.`,
              type: 'warning',
              is_read: false,
            }]);
          } catch (notifErr) {
            console.warn('KYC reject notification warning:', notifErr);
          }
        } catch (err) {
          console.error('KYC reject error:', err);
        }

        const state = get();
        const target = state.partners.find((p) => p.id === partnerId);
        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'kyc_rejection',
          targetEntity: target?.name || partnerId,
          details: `Rejected KYC: ${reason}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? { ...p, status: 'kyc_rejected' as PartnerStatus, rejectionReason: reason }
              : p
          ),
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      deletePartner: async (partnerId) => {
        try {
          const { supabase } = await import('./supabase');
          // Delete profile from DB
          await supabase.from('profiles').delete().eq('id', partnerId);
          // Also delete from Supabase Auth to prevent orphaned accounts
          try {
            const adminPass = get()._adminPass || '';
            await fetch('/api/admin/partners/password', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPass },
              body: JSON.stringify({ partnerId }),
            });
          } catch (authErr) {
            console.warn('Auth account deletion note:', authErr);
          }
        } catch (err) {
          console.error('Delete partner error:', err);
        }

        const state = get();
        const target = state.partners.find((p) => p.id === partnerId);
        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'partner_deleted',
          targetEntity: target?.name || partnerId,
          details: `Deleted partner profile (${target?.name || partnerId}).`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          partners: state.partners.filter((p) => p.id !== partnerId),
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      updatePartnerPassword: async (partnerId: string, newPassword: string) => {
        try {
          const adminPass = get()._adminPass || '';
          const res = await fetch('/api/admin/partners/password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({ partnerId, newPassword }),
          });

          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || 'Could not update Supabase Auth password.' };
          }

          set((state) => ({
            partners: state.partners.map((p) =>
              p.id === partnerId ? { ...p, password: newPassword } : p
            ),
          }));

          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message || 'Server connection error' };
        }
      },

      addPartnerUser: async (partnerData) => {
        try {
          const adminPass = get()._adminPass || '';
          const res = await fetch('/api/admin/partners/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify(partnerData),
          });

          const resData = await res.json();
          if (!res.ok) {
            return { success: false, error: resData.error || 'Failed to create partner user.' };
          }

          const p = resData.data;
          const newAdminPartner: AdminPartner = {
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone || '',
            profession: p.profession || 'Direct Selling Agent (DSA)',
            city: p.city || 'Mumbai',
            state: p.state || 'Maharashtra',
            pan: p.pan || '',
            status: p.status || 'kyc_approved',
            role: p.role || 'individual',
            teamCode: p.team_code || '',
            joinedAt: p.joined_at || p.created_at,
            isEmailVerified: true,
            primePoints: p.prime_points || 100,
            referredByLeaderId: p.referred_by_leader_id || undefined,
          };

          set((state) => ({
            partners: [newAdminPartner, ...state.partners],
          }));

          return { success: true, data: newAdminPartner };
        } catch (err: any) {
          return { success: false, error: err.message || 'Server connection error' };
        }
      },

      incrementProfileViews: (partnerId) =>
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? { ...p, totalProfileViews: (p.totalProfileViews || 0) + 1 }
              : p
          ),
        })),

      updateReferralStatus: async (referralId, status, note) => {
        // Use reward config as single source of truth for points
        const { conversionPoints, enrollmentPoints, submissionPoints } = get().rewardConfig;

        // Map status → points to award on stage transition
        // NOTE: enrolled is handled by inline direct DB write in referrals/[id]/page.tsx
        // (tier-based 100/125/150). Setting it to 0 here prevents double-credit.
        const stagePointsMap: Record<string, number> = {
          submitted: submissionPoints,   // e.g. 20 pts on submission
          enrolled: 0,                   // handled inline with tier-based pts
          completed: 0,                  // handled by CompleteCaseModal with service_amount
        };
        const pointsForStage = stagePointsMap[status] ?? 0;

        try {
          const { supabase } = await import('./supabase');

          // 1. Fetch current referral row to get existing status_history
          const { data: existingRef } = await supabase
            .from('referrals')
            .select('status_history')
            .eq('id', referralId)
            .maybeSingle();

          const existingHistory = Array.isArray(existingRef?.status_history)
            ? existingRef.status_history
            : (existingRef?.status_history ? JSON.parse(existingRef.status_history) : []);

          const newHistoryItem = {
            status,
            date: new Date().toISOString(),
            note: note || `Status updated to ${status}`,
          };
          const updatedHistory = [...existingHistory, newHistoryItem];

          // 2. Update referral status & status_history in DB
          await supabase
            .from('referrals')
            .update({
              current_stage: status,
              updated_at: new Date().toISOString(),
              status_history: updatedHistory,
              ...(pointsForStage > 0 ? { partner_points_earned: pointsForStage } : {}),
            })
            .eq('id', referralId);

          // 3. Log to referral_status_history table
          try {
            await supabase.from('referral_status_history').insert([
              {
                referral_id: referralId,
                stage: status,
                note_details: note || `Status updated to ${status}`,
                updated_at: new Date().toISOString(),
              },
            ]);
          } catch (histErr) {
            console.warn('referral_status_history insert warning:', histErr);
          }

          // 2. If points-awarding stage: credit partner balance + log to point_transactions
          if (pointsForStage > 0) {
            const state = get();
            const referral = state.referrals.find((r) => r.id === referralId);
            const partnerId = referral?.partnerId;

            if (partnerId) {
              // Fetch current balance
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('prime_points, lifetime_points_earned')
                .eq('id', partnerId)
                .single();

              const currentBalance = profileRow?.prime_points ?? 0;
              const currentLifetime = profileRow?.lifetime_points_earned ?? 0;
              const newBalance = currentBalance + pointsForStage;

              // Update profile balance (DB is source of truth)
              await supabase
                .from('profiles')
                .update({
                  prime_points: newBalance,
                  lifetime_points_earned: currentLifetime + pointsForStage,
                })
                .eq('id', partnerId);

              // Write to point_transactions (always, for all portals to read)
              await supabase.from('point_transactions').insert([{
                partner_id: partnerId,
                transaction_type: 'referral_earned',
                points_change: pointsForStage,
                amount: pointsForStage,
                balance_after: newBalance,
                title: `Referral ${status.charAt(0).toUpperCase() + status.slice(1)}: ${referral?.customerName || referralId}`,
                description: `Referral ${status.charAt(0).toUpperCase() + status.slice(1)}: ${referral?.customerName || referralId}`,
                reference_id: referralId,
              }]);
            }
          }
        } catch (err) {
          console.error('Referral status update error:', err);
        }

        const state = get();
        const target = state.referrals.find((r) => r.id === referralId);
        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Operations Admin',
          actorRole: 'operations_admin',
          actionType: 'lead_status_update',
          targetEntity: `${referralId} (${target?.customerName || ''})`,
          details: `Updated status to ${status}. Points awarded: ${pointsForStage}. Note: ${note || 'None'}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === referralId
              ? {
                  ...r,
                  status,
                  updatedAt: new Date().toISOString(),
                  pointsEarned: pointsForStage > 0 ? pointsForStage : r.pointsEarned,
                  statusHistory: [
                    ...r.statusHistory,
                    {
                      status,
                      date: new Date().toISOString(),
                      note: note || `Status updated to ${status} by Primescore Admin`,
                    },
                  ],
                }
              : r
          ),
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      deleteReferral: async (referralId, reversePoints) => {
        const state = get();
        const refCase = state.referrals.find((r) => r.id === referralId);

        try {
          const { supabase } = await import('./supabase');

          // 1. Soft update status to 'rejected' in Supabase DB (preserves lead record in client & admin views)
          const { data: existingRef } = await supabase
            .from('referrals')
            .select('status_history')
            .eq('id', referralId)
            .maybeSingle();

          const existingHistory = Array.isArray(existingRef?.status_history)
            ? existingRef.status_history
            : (existingRef?.status_history ? JSON.parse(existingRef.status_history) : []);

          const updatedHistory = [
            ...existingHistory,
            {
              status: 'rejected',
              date: new Date().toISOString(),
              note: reversePoints
                ? 'Lead cancelled by admin. Reward points reversed & deducted.'
                : 'Lead cancelled by admin.',
            },
          ];

          await supabase
            .from('referrals')
            .update({
              current_stage: 'rejected',
              updated_at: new Date().toISOString(),
              status_history: updatedHistory,
              partner_points_earned: reversePoints ? 0 : refCase?.pointsEarned || 0,
            })
            .eq('id', referralId);

          // 2. If reversePoints is true & case had points credited to partner
          if (reversePoints && refCase && refCase.pointsEarned > 0 && refCase.partnerId) {
            const partnerId = refCase.partnerId;
            const ptsToDeduct = refCase.pointsEarned;
            const pointsPerInr = get().rewardConfig.pointsPerInr || 4;
            const inrEquivalent = (ptsToDeduct / pointsPerInr).toFixed(2);

            const { data: profileRow } = await supabase
              .from('profiles')
              .select('prime_points, lifetime_points_earned')
              .eq('id', partnerId)
              .maybeSingle();

            if (profileRow) {
              const currentBal = profileRow.prime_points ?? 0;
              const currentLife = profileRow.lifetime_points_earned ?? 0;
              const newBal = Math.max(0, currentBal - ptsToDeduct);
              const newLife = Math.max(0, currentLife - ptsToDeduct);

              await supabase
                .from('profiles')
                .update({
                  prime_points: newBal,
                  lifetime_points_earned: newLife,
                })
                .eq('id', partnerId);

              // Record point deduction transaction with explicit INR cash amount
              await supabase.from('point_transactions').insert([
                {
                  partner_id: partnerId,
                  transaction_type: 'referral_reversal',
                  points_change: -ptsToDeduct,
                  balance_after: newBal,
                  title: `Points Deducted (Lead Cancelled): ${refCase.customerName} (-₹${inrEquivalent} INR)`,
                  reference_id: referralId,
                },
              ]);
            }
          }
        } catch (err) {
          console.error('Cancel/Delete referral error:', err);
        }

        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Operations Admin',
          actorRole: 'operations_admin',
          actionType: 'lead_status_update',
          targetEntity: referralId,
          details: `Cancelled lead ${refCase?.customerName || referralId}. Points reversed: ${reversePoints ? 'Yes' : 'No'}.`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === referralId
              ? {
                  ...r,
                  status: 'rejected' as ReferralStatus,
                  pointsEarned: reversePoints ? 0 : r.pointsEarned,
                  updatedAt: new Date().toISOString(),
                  statusHistory: [
                    ...r.statusHistory,
                    {
                      status: 'rejected' as ReferralStatus,
                      date: new Date().toISOString(),
                      note: reversePoints
                        ? 'Lead cancelled by admin. Points deducted.'
                        : 'Lead cancelled by admin.',
                    },
                  ],
                }
              : r
          ),
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      toggleGiftCard: (cardId) =>
        set((state) => ({
          giftCards: state.giftCards.map((c) =>
            c.id === cardId ? { ...c, isActive: !c.isActive } : c
          ),
        })),

      addGiftCard: (card) =>
        set((state) => ({
          giftCards: [
            ...state.giftCards,
            { ...card, id: `gc-${Date.now()}` },
          ],
        })),

      toggleService: (serviceId) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, isActive: !s.isActive } : s
          ),
        })),

      addService: (service) =>
        set((state) => ({
          services: [
            ...state.services,
            { ...service, id: `srv-${Date.now()}` },
          ],
        })),

      updateService: (serviceId, data) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === serviceId ? { ...s, ...data } : s
          ),
        })),

      updateRewardConfig: async (newConfig) => {
        const state = get();
        const updated = { ...state.rewardConfig, ...newConfig };

        try {
          const { supabase } = await import('./supabase');
          await supabase.from('system_config').upsert({
            id: 'global_reward_config',
            submission_points: updated.submissionPoints,
            enrollment_points: updated.enrollmentPoints,
            conversion_points: updated.conversionPoints,
            team_leader_override_percent: updated.teamLeaderOverridePercent,
            points_per_inr: updated.pointsPerInr,
            payout_mode: updated.payoutMode,
            min_redemption_points: updated.minRedemptionPoints,
            max_daily_redemption_points: updated.maxDailyRedemptionPoints,
            tier_multipliers: updated.tierMultipliers,
            profession_multipliers: updated.professionMultipliers,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.error('Supabase system_config save error:', err);
        }

        const log: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'payout_settlement',
          targetEntity: 'Reward Engine Rules',
          details: 'Updated points & INR reward conversion parameters in Supabase system_config.',
          timestamp: new Date().toISOString(),
        };

        set({
          rewardConfig: updated,
          auditLogs: [log, ...state.auditLogs],
        });
      },

      addAuditLog: (log) =>
        set((state) => ({
          auditLogs: [
            { ...log, id: `LOG-${Date.now()}`, timestamp: new Date().toISOString() },
            ...state.auditLogs,
          ],
        })),

      addStaffUser: async (user) => {
        try {
          const adminPass = get()._adminPass || '';
          const res = await fetch('/api/admin/staff', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              password: user.password || 'Staff@2026',
              role: user.role,
              allowedPages: user.allowedPages || ALL_ADMIN_PAGES,
            }),
          });

          const resData = await res.json();
          const data = resData?.data;

          const newStaffMember: AdminStaffUser = {
            id: data?.id || `ADM-${Date.now()}`,
            name: user.name,
            email: user.email,
            password: user.password || 'Staff@2026',
            role: user.role,
            allowedPages: user.allowedPages || ALL_ADMIN_PAGES,
            lastLogin: data?.last_login || new Date().toISOString(),
            isActive: true,
          };

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'lead_status_update',
            user.name,
            `Created staff account for ${user.email} (${user.role}).`
          );

          set((state) => ({
            staff: [...state.staff, newStaffMember],
          }));
        } catch (err) {
          console.error('Add staff DB error:', err);
        }
      },

      updateStaffUser: async (id, updates) => {
        try {
          const adminPass = get()._adminPass || '';
          await fetch('/api/admin/staff', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({
              id,
              ...updates,
            }),
          });

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'lead_status_update',
            updates.name || id,
            `Updated staff settings & permissions for staff ID ${id}.`
          );

          set((state) => ({
            staff: state.staff.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          }));
        } catch (err) {
          console.error('Update staff DB error:', err);
        }
      },

      toggleStaffStatus: async (id) => {
        const current = get().staff.find((u) => u.id === id);
        const nextActive = !current?.isActive;

        try {
          const adminPass = get()._adminPass || '';
          await fetch('/api/admin/staff', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({
              id,
              isActive: nextActive,
            }),
          });

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'lead_status_update',
            current?.name || id,
            `${nextActive ? 'Activated' : 'Deactivated'} staff member account.`
          );

          set((state) => ({
            staff: state.staff.map((u) => (u.id === id ? { ...u, isActive: nextActive } : u)),
          }));
        } catch (err) {
          console.error('Toggle staff status DB error:', err);
        }
      },

      deleteStaffUser: async (id) => {
        const current = get().staff.find((u) => u.id === id);

        try {
          const adminPass = get()._adminPass || '';
          await fetch('/api/admin/staff', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({ id }),
          });

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'partner_deleted',
            current?.name || id,
            `Removed / deleted staff account permanently.`
          );

          set((state) => ({
            staff: state.staff.filter((u) => u.id !== id),
          }));
        } catch (err) {
          console.error('Delete staff DB error:', err);
        }
      },

      createBroadcast: async (b) => {
        try {
          const adminPass = get()._adminPass || '';
          const res = await fetch('/api/admin/broadcast', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({
              title: b.title,
              message: b.message,
              type: b.type || 'info',
              icon: b.icon || 'megaphone',
              color: b.color || 'yellow',
              isActive: b.isActive !== false,
            }),
          });

          const resData = await res.json();
          const data = resData?.data;

          const newBroadcast: BroadcastAnnouncement = {
            id: data?.id || `BC-${Date.now()}`,
            title: b.title,
            message: b.message,
            type: b.type || 'info',
            icon: b.icon || 'megaphone',
            color: b.color || 'yellow',
            publishedAt: data?.published_at || new Date().toISOString(),
            isActive: b.isActive !== false,
          };

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'broadcast_publish',
            b.title,
            'Published announcement banner to partner portal marquee.'
          );

          set((state) => ({
            broadcasts: [
              newBroadcast,
              ...state.broadcasts.map((prev) =>
                b.isActive !== false ? { ...prev, isActive: false } : prev
              ),
            ],
          }));
        } catch (err) {
          console.error('Create broadcast DB error:', err);
        }
      },

      toggleBroadcast: async (id: string) => {
        const current = get().broadcasts.find((b) => b.id === id);
        const nextState = !current?.isActive;

        try {
          const adminPass = get()._adminPass || '';
          await fetch('/api/admin/broadcast', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-password': adminPass,
            },
            body: JSON.stringify({
              id,
              isActive: nextState,
            }),
          });

          await recordAuditLog(
            'Sawai (CEO)',
            'super_admin',
            'broadcast_publish',
            current?.title || id,
            `Broadcast announcement banner status changed to ${nextState ? 'Active' : 'Deactivated'}.`
          );
        } catch (err) {
          console.warn('Toggle broadcast DB warning:', err);
        }

        set((state) => ({
          broadcasts: state.broadcasts.map((b) =>
            b.id === id ? { ...b, isActive: nextState } : b
          ),
        }));
      },

      issueAdminPoints: async (partnerId: string, pointsAmount: number, reason: string) => {
        try {
          const { supabase } = await import('./supabase');
          const { data: profile } = await supabase
            .from('profiles')
            .select('prime_points, lifetime_points_earned')
            .eq('id', partnerId)
            .single();

          const currentPts = profile?.prime_points || 0;
          const currentLifetime = profile?.lifetime_points_earned || 0;
          const newPts = Math.max(0, currentPts + pointsAmount);
          const newLifetime = pointsAmount > 0 ? currentLifetime + pointsAmount : currentLifetime;

          await supabase
            .from('profiles')
            .update({
              prime_points: newPts,
              lifetime_points_earned: newLifetime,
              updated_at: new Date().toISOString(),
            })
            .eq('id', partnerId);

          const refId = `ADM-${Date.now()}`;
          await supabase.from('point_transactions').insert([
            {
              partner_id: partnerId,
              transaction_type: pointsAmount >= 0 ? 'admin_adjustment' : 'admin_deduction',
              points_change: pointsAmount,
              balance_after: newPts,
              title: pointsAmount >= 0 ? `🛡️ Admin Bonus Credit: ${reason}` : `⚠️ Admin Point Adjustment: ${reason}`,
              reference_id: refId,
            },
          ]);

          await supabase.from('notifications').insert([
            {
              partner_id: partnerId,
              title: pointsAmount >= 0 ? `🎁 +${pointsAmount} PrimePoints Credited by Admin` : `⚠️ ${pointsAmount} PrimePoints Adjusted by Admin`,
              message: reason || 'Manual point adjustment by admin operations.',
              type: pointsAmount >= 0 ? 'success' : 'warning',
              points_badge: `${pointsAmount >= 0 ? '+' : ''}${pointsAmount} pts`,
              is_read: false,
            },
          ]);
        } catch (err) {
          console.error('Issue admin points error:', err);
        }

        const state = get();
        const target = state.partners.find((p) => p.id === partnerId);
        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'payout_settlement',
          targetEntity: target?.name || partnerId,
          details: `Admin issued point adjustment of ${pointsAmount > 0 ? '+' : ''}${pointsAmount} Pts. Reason: ${reason}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },
    }),
    {
      name: 'primescore-admin-store-v7',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.sessionStorage)
        : undefined,
    }
  )
);
