import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PartnerRole = 'individual' | 'team_leader' | 'team_member';
export type PartnerStatus = 'pending_kyc' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected';
export type ReferralStatus = 'submitted' | 'received' | 'enrolled' | 'in_progress' | 'completed' | 'rejected';
export type Tier = 'Silver' | 'Gold' | 'Platinum';

export interface TeamMemberReferral {
  id: string;
  customerName: string;
  service: string;
  status: ReferralStatus;
  createdAt: string;
  pointsEarned: number;
  overrideEarned: number;
}

export interface TeamMemberRedemption {
  id: string;
  brand: string;
  denomination: number;
  redeemedAt: string;
  voucherCode: string;
}

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
  overridePointsEarned: number;
  referralsLog?: TeamMemberReferral[];
  redemptionsLog?: TeamMemberRedemption[];
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
  profilePhoto?: string;
  referredByLeaderName?: string;
  referredByLeaderId?: string;
}

export interface Referral {
  id: string;
  partnerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  service: string;
  notes?: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  pointsEarned: number;
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
  tier: Tier;
  isAuthenticated: boolean;

  setPartner: (partner: Partner) => void;
  setReferrals: (referrals: Referral[]) => void;
  setRedemptions: (redemptions: RedemptionRecord[]) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setTotalPoints: (points: number) => void;
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'pointsEarned' | 'statusHistory' | 'partnerId'>) => void;
  updateReferralStatus: (id: string, status: ReferralStatus, note?: string) => void;
  redeemGiftCard: (brand: string, denomination: number, pointsRequired: number) => { success: boolean; voucherCode?: string; message?: string };
  onboardTeamMember: (member: Omit<TeamMember, 'id' | 'casesCount' | 'totalMemberPoints' | 'overridePointsEarned' | 'joinedAt'>) => void;
  updateTeamMemberStatus: (id: string, status: PartnerStatus) => void;
  logout: () => void;
}

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      partner: null,
      referrals: [],
      redemptions: [],
      teamMembers: [],
      totalPoints: 0,
      tier: 'Silver',
      isAuthenticated: false,

      setPartner: (partner) => set({ partner, isAuthenticated: true }),

      setReferrals: (referrals) => set({ referrals }),

      setRedemptions: (redemptions) => set({ redemptions }),

      setTeamMembers: (teamMembers) => set({ teamMembers }),

      setTotalPoints: (totalPoints) => set({ totalPoints }),

      addReferral: (newRef) => {
        const { referrals, partner } = get();
        const id = `REF-${new Date().getFullYear()}-${String(referrals.length + 1).padStart(3, '0')}`;
        const now = new Date().toISOString();

        const referral: Referral = {
          ...newRef,
          id,
          partnerId: partner?.id || '',
          status: 'submitted',
          createdAt: now,
          updatedAt: now,
          pointsEarned: 0,
          statusHistory: [
            { status: 'submitted', date: now, note: 'Referral submitted by partner' },
          ],
        };

        set({ referrals: [referral, ...referrals] });
      },

      updateReferralStatus: (id, status, note) => {
        const { referrals, totalPoints } = get();
        const now = new Date().toISOString();

        const updatedReferrals = referrals.map((r) => {
          if (r.id === id) {
            let pointsEarned = r.pointsEarned;
            if (status === 'enrolled' && r.status !== 'enrolled') pointsEarned += 20;
            if (status === 'completed' && r.status !== 'completed') pointsEarned += 500;

            return {
              ...r,
              status,
              updatedAt: now,
              pointsEarned,
              statusHistory: [
                ...r.statusHistory,
                { status, date: now, note: note || `Status updated to ${status}` },
              ],
            };
          }
          return r;
        });

        let newPoints = totalPoints;
        const targetRef = referrals.find((r) => r.id === id);
        if (targetRef && targetRef.status !== 'completed' && status === 'completed') newPoints += 500;
        else if (targetRef && targetRef.status !== 'enrolled' && status === 'enrolled') newPoints += 20;

        set({ referrals: updatedReferrals, totalPoints: newPoints });
      },

      redeemGiftCard: (brand, denomination, pointsRequired) => {
        const { totalPoints, redemptions } = get();

        if (totalPoints < pointsRequired) {
          return { success: false, message: 'Insufficient PrimePoints balance' };
        }

        const voucherCode = `${brand.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const newRedemption: RedemptionRecord = {
          id: `RDM-${String(redemptions.length + 1).padStart(3, '0')}`,
          brand,
          denomination,
          points: pointsRequired,
          redeemedAt: new Date().toISOString(),
          voucherCode,
        };

        set({
          totalPoints: totalPoints - pointsRequired,
          redemptions: [newRedemption, ...redemptions],
        });

        return { success: true, voucherCode };
      },

      onboardTeamMember: (memberData) => {
        const { teamMembers, totalPoints } = get();
        const newMember: TeamMember = {
          ...memberData,
          id: `TM-${String(teamMembers.length + 1).padStart(3, '0')}`,
          joinedAt: new Date().toISOString(),
          casesCount: 0,
          totalMemberPoints: 0,
          overridePointsEarned: 0,
          referralsLog: [],
          redemptionsLog: [],
        };

        set({
          teamMembers: [newMember, ...teamMembers],
          totalPoints: totalPoints + 20,
        });
      },

      updateTeamMemberStatus: (id, status) => {
        const { teamMembers } = get();
        const updated = teamMembers.map((m) => (m.id === id ? { ...m, status } : m));
        set({ teamMembers: updated });
      },

      logout: async () => {
        try {
          const { supabase } = await import('./supabase');
          await supabase.auth.signOut();
        } catch (e) {
          console.error('Signout error:', e);
        }
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('primescore-partner-store-v9');
          window.sessionStorage.clear();
        }
        set({
          partner: null,
          referrals: [],
          redemptions: [],
          teamMembers: [],
          totalPoints: 0,
          tier: 'Silver',
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'primescore-partner-store-v9',
    }
  )
);
