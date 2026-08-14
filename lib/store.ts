import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PARTNER, MOCK_REFERRALS, MOCK_REDEMPTIONS, MOCK_TEAM_MEMBERS } from './mock-data';

export type PartnerRole = 'individual' | 'team_leader';
export type PartnerStatus = 'pending_kyc' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected';
export type ReferralStatus = 'submitted' | 'received' | 'enrolled' | 'in_progress' | 'completed' | 'rejected';
export type Tier = 'Silver' | 'Gold' | 'Platinum';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  city: string;
  status: PartnerStatus;
  joinedAt: string;
  casesCount: number;
  totalMemberPoints: number;
  overridePointsEarned: number; // 10% cut earned by TL from this member
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  city: string;
  state: string;
  pan: string;
  status: PartnerStatus;
  role: PartnerRole;
  teamCode: string;
  joinedAt: string;
  avatar?: string;
}

export interface Referral {
  id: string;
  partnerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  service: string;
  notes: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  pointsEarned: number;
  teamMemberId?: string;
  teamMemberName?: string;
  overrideEarned?: number;
  statusHistory: { status: ReferralStatus; date: string; note: string }[];
}

export interface RedemptionRecord {
  id: string;
  brand: string;
  denomination: number;
  points: number;
  redeemedAt: string;
  voucherCode: string;
}

interface PartnerStore {
  partner: Partner | null;
  referrals: Referral[];
  redemptions: RedemptionRecord[];
  teamMembers: TeamMember[];
  totalPoints: number;
  isAuthenticated: boolean;

  setPartner: (p: Partner) => void;
  logout: () => void;
  addReferral: (r: Referral) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  addRedemption: (r: RedemptionRecord, pointsCost: number) => void;
  onboardTeamMember: (member: Omit<TeamMember, 'id' | 'joinedAt' | 'casesCount' | 'totalMemberPoints' | 'overridePointsEarned'>) => void;
  getTier: () => Tier;
  loginDemo: () => void;
  initDemoData: () => void;
}

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      partner: MOCK_PARTNER,
      referrals: MOCK_REFERRALS,
      redemptions: MOCK_REDEMPTIONS,
      teamMembers: MOCK_TEAM_MEMBERS,
      totalPoints: 1000,
      isAuthenticated: true,

      setPartner: (p) => set({ partner: p, isAuthenticated: true }),
      logout: () => set({ partner: null, isAuthenticated: false }),

      addReferral: (r) =>
        set((s) => ({ referrals: [r, ...s.referrals] })),

      onboardTeamMember: (member) =>
        set((s) => {
          const newMember: TeamMember = {
            ...member,
            id: `TM-00${s.teamMembers.length + 1}`,
            joinedAt: new Date().toISOString(),
            casesCount: 0,
            totalMemberPoints: 0,
            overridePointsEarned: 0,
          };
          return { teamMembers: [newMember, ...s.teamMembers] };
        }),

      updateReferralStatus: (id, status) =>
        set((s) => ({
          referrals: s.referrals.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  updatedAt: new Date().toISOString(),
                  pointsEarned: status === 'completed' ? 500 : r.pointsEarned,
                  statusHistory: [
                    ...r.statusHistory,
                    { status, date: new Date().toISOString(), note: '' },
                  ],
                }
              : r
          ),
          totalPoints:
            status === 'completed'
              ? s.totalPoints + 500
              : s.totalPoints,
        })),

      addRedemption: (r, pointsCost) =>
        set((s) => ({
          redemptions: [r, ...s.redemptions],
          totalPoints: Math.max(0, s.totalPoints - pointsCost),
        })),

      getTier: () => {
        const pts = get().totalPoints;
        if (pts >= 20000) return 'Platinum';
        if (pts >= 5000) return 'Gold';
        return 'Silver';
      },

      loginDemo: () =>
        set({
          partner: MOCK_PARTNER,
          referrals: MOCK_REFERRALS,
          redemptions: MOCK_REDEMPTIONS,
          totalPoints: 1000,
          isAuthenticated: true,
        }),

      initDemoData: () => {
        const state = get();
        if (!state.partner || state.referrals.length === 0) {
          set({
            partner: MOCK_PARTNER,
            referrals: MOCK_REFERRALS,
            redemptions: MOCK_REDEMPTIONS,
            totalPoints: 1000,
            isAuthenticated: true,
          });
        }
      },
    }),
    { name: 'primescore-partner-store' }
  )
);

