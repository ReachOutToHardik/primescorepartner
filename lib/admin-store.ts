import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// Allowed admin credentials
const ADMIN_CREDENTIALS: Record<string, string> = {
  'admin@primescore.in': 'admin123',
  'sawai@primescore.in': 'admin123',
  'hardik@primescore.in': 'admin123',
};

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

      adminLogin: (email, pass) => {
        const cleanEmail = email.toLowerCase().trim();
        const validPassword = ADMIN_CREDENTIALS[cleanEmail];
        if (validPassword && validPassword === pass) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      adminLogout: () => set({ isAuthenticated: false }),

      approveKyc: async (partnerId) => {
        try {
          const { supabase } = await import('./supabase');
          await supabase
            .from('profiles')
            .update({ status: 'kyc_approved', updated_at: new Date().toISOString() })
            .eq('id', partnerId);
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
        try {
          const { supabase } = await import('./supabase');
          await supabase
            .from('referrals')
            .update({
              current_stage: status,
              updated_at: new Date().toISOString(),
              ...(status === 'completed' ? { partner_points_earned: 500 } : {}),
            })
            .eq('id', referralId);
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
          details: `Updated status to ${status}. Note: ${note || 'None'}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === referralId
              ? {
                  ...r,
                  status,
                  updatedAt: new Date().toISOString(),
                  pointsEarned: status === 'completed' ? 500 : r.pointsEarned,
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

      toggleBroadcast: (id) =>
        set((state) => ({
          broadcasts: state.broadcasts.map((b) =>
            b.id === id ? { ...b, isActive: !b.isActive } : b
          ),
        })),
    }),
    { name: 'primescore-admin-store-v6' }
  )
);
