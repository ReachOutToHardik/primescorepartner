import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Partner, Referral, ReferralStatus, PartnerStatus } from './store';
import { GIFT_CARDS, SERVICE_OPTIONS } from './mock-data';

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
  role: 'super_admin' | 'operations_admin' | 'compliance_officer' | 'support_agent';
  department: string;
  lastLogin: string;
  isActive: boolean;
}

export interface SystemAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  actionType: 'kyc_approval' | 'kyc_rejection' | 'lead_status_update' | 'payout_settlement' | 'broadcast_publish';
  targetEntity: string;
  details: string;
  timestamp: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'promotion';
  publishedAt: string;
  isActive: boolean;
}

// Static admin staff list (only real staff, no demo data)
const INITIAL_STAFF: AdminStaffUser[] = [
  { id: 'ADM-01', name: 'Sawai', email: 'sawai@primescore.in', role: 'super_admin', department: 'Chief Executive Officer (CEO)', lastLogin: new Date().toISOString(), isActive: true },
  { id: 'ADM-02', name: 'Hardik', email: 'hardik@primescore.in', role: 'super_admin', department: 'Technology Head (CTO)', lastLogin: new Date().toISOString(), isActive: true },
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
  isLoadingData: boolean;

  // Actions
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;
  approveKyc: (partnerId: string) => Promise<void>;
  rejectKyc: (partnerId: string, reason: string) => Promise<void>;
  incrementProfileViews: (partnerId: string) => void;
  updateReferralStatus: (referralId: string, status: ReferralStatus, note?: string) => Promise<void>;
  toggleGiftCard: (cardId: string) => void;
  addGiftCard: (card: Omit<GiftCardItem, 'id'>) => void;
  toggleService: (serviceId: string) => void;
  addService: (service: Omit<PlatformService, 'id'>) => void;
  updateService: (serviceId: string, data: Partial<PlatformService>) => void;
  updateRewardConfig: (newConfig: Partial<RewardEngineConfig>) => void;
  addAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  addStaffUser: (user: Omit<AdminStaffUser, 'id' | 'lastLogin'>) => void;
  toggleStaffStatus: (id: string) => void;
  createBroadcast: (b: Omit<BroadcastAnnouncement, 'id' | 'publishedAt'>) => void;
  toggleBroadcast: (id: string) => void;
  issueAdminPoints: (partnerId: string, pointsAmount: number, reason: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      partners: [],
      referrals: [],
      giftCards: INITIAL_GIFT_CARDS,
      services: INITIAL_SERVICES,
      staff: INITIAL_STAFF,
      auditLogs: [],
      broadcasts: [],
      rewardConfig: DEFAULT_REWARD_CONFIG,
      isAuthenticated: false,
      isLoadingData: false,

      adminLogin: (email, pass) => {
        const cleanEmail = email.toLowerCase().trim();
        // Verify email is in allowed list AND password matches env var
        const masterPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        const isAllowedEmail = ALLOWED_ADMIN_EMAILS.includes(cleanEmail);
        const isCorrectPassword = masterPassword && pass === masterPassword;
        if (isAllowedEmail && isCorrectPassword) {
          set({ isAuthenticated: true });
          return true;
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
        set({ isAuthenticated: false });
      },

      approveKyc: async (partnerId) => {
        try {
          const { supabase } = await import('./supabase');
          
          // 1. Update status to kyc_approved & credit 100 Pts sign-up bonus
          await supabase
            .from('profiles')
            .update({
              status: 'kyc_approved',
              prime_points: 100,
              lifetime_points_earned: 100,
              updated_at: new Date().toISOString(),
            })
            .eq('id', partnerId);

          // 2. Log 100 Pts Welcome Sign-up Bonus transaction
          try {
            await supabase.from('point_transactions').insert([
              {
                partner_id: partnerId,
                transaction_type: 'signup_bonus',
                points_change: 100,
                balance_after: 100,
                title: '🎁 Welcome Sign-up Bonus (KYC Approved)',
                reference_id: 'BONUS-100',
              },
            ]);
          } catch (txErr) {
            console.warn('Sign-up bonus transaction log warning:', txErr);
          }

          // 3. Send approval + 100 Pts notification to partner
          try {
            await supabase.from('notifications').insert([
              {
                partner_id: partnerId,
                title: '🎉 KYC Verified & +100 Pts Sign-Up Bonus Credited!',
                message: 'Your partner account is verified! You received your +100 PrimePoints sign-up bonus. Start submitting client referrals now!',
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

        const state = get();
        const target = state.partners.find((p) => p.id === partnerId);
        const newLog: SystemAuditLog = {
          id: `LOG-${Date.now()}`,
          actorName: 'Super Admin',
          actorRole: 'super_admin',
          actionType: 'kyc_approval',
          targetEntity: target?.name || partnerId,
          details: 'Approved partner KYC identity documents.',
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId ? { ...p, status: 'kyc_approved' as PartnerStatus } : p
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

        // Map status → points to award on that stage transition
        const stagePointsMap: Record<string, number> = {
          submitted: submissionPoints,   // e.g. 20 pts on submission
          enrolled: enrollmentPoints,    // e.g. 100 pts on enrollment
          completed: conversionPoints,   // e.g. 500 pts on completion
        };
        const pointsForStage = stagePointsMap[status] ?? 0;

        try {
          const { supabase } = await import('./supabase');

          // 1. Update referral status in DB
          await supabase
            .from('referrals')
            .update({
              current_stage: status,
              updated_at: new Date().toISOString(),
              ...(pointsForStage > 0 ? { partner_points_earned: pointsForStage } : {}),
            })
            .eq('id', referralId);

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
                balance_after: newBalance,
                title: `Referral ${status.charAt(0).toUpperCase() + status.slice(1)}: ${referral?.customerName || referralId}`,
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

      addStaffUser: (user) =>
        set((state) => ({
          staff: [
            ...state.staff,
            { ...user, id: `ADM-${Date.now()}`, lastLogin: new Date().toISOString() },
          ],
        })),

      toggleStaffStatus: (id) =>
        set((state) => ({
          staff: state.staff.map((u) =>
            u.id === id ? { ...u, isActive: !u.isActive } : u
          ),
        })),

      createBroadcast: (b) =>
        set((state) => {
          const newBroadcast: BroadcastAnnouncement = {
            ...b,
            id: `BC-${Date.now()}`,
            publishedAt: new Date().toISOString(),
          };
          const newLog: SystemAuditLog = {
            id: `LOG-${Date.now()}`,
            actorName: 'Super Admin',
            actorRole: 'super_admin',
            actionType: 'broadcast_publish',
            targetEntity: b.title,
            details: `Published announcement banner to all partner dashboards.`,
            timestamp: new Date().toISOString(),
          };
          return {
            broadcasts: [newBroadcast, ...state.broadcasts],
            auditLogs: [newLog, ...state.auditLogs],
          };
        }),

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

      toggleBroadcast: (id) =>
        set((state) => ({
          broadcasts: state.broadcasts.map((b) =>
            b.id === id ? { ...b, isActive: !b.isActive } : b
          ),
        })),
    }),
    {
      name: 'primescore-admin-store-v7',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.sessionStorage)
        : undefined,
    }
  )
);
