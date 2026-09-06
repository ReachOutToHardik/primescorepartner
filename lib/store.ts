import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PartnerRole = 'individual' | 'team_leader' | 'team_member';
export type PartnerStatus = 'pending_kyc' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected';
export type ReferralStatus = 'submitted' | 'received' | 'enrolled' | 'in_progress' | 'completed' | 'rejected';
export type Tier = 'Silver' | 'Gold' | 'Platinum';

export const calculateTier = (points: number): Tier => {
  if (points >= 50000) return 'Platinum';
  if (points >= 20000) return 'Gold';
  return 'Silver';
};

export const getReferredUserEnrollmentPoints = (tier: Tier): number => {
  switch (tier) {
    case 'Platinum': return 150;
    case 'Gold': return 125;
    case 'Silver':
    default: return 100;
  }
};

export const getCaseCommissionRate = (tier: Tier): number => {
  switch (tier) {
    case 'Platinum': return 15; // 15%
    case 'Gold': return 12;     // 12%
    case 'Silver':
    default: return 10;        // 10%
  }
};

export const calculateCaseCompletionPoints = (tier: Tier, serviceAmount: number): number => {
  const rate = getCaseCommissionRate(tier);
  const commissionInr = Math.round((serviceAmount || 0) * (rate / 100));
  return commissionInr * 4; // 4 Pts per ₹1 INR (e.g. ₹10,000 @ 10% = ₹1,000 = 4,000 Pts)
};

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
  state?: string;
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
  kycSubmittedAt?: string;
  isEmailVerified?: boolean;
  profilePhoto?: string;
  referredByLeaderName?: string;
  referredByLeaderId?: string;
  primePoints?: number;
  lifetimePoints?: number; // total points ever earned (not deducted by redemptions)
  userReferralCode?: string;
  aadhaar?: string;
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
  setTotalPoints: (points: number, lifetimePoints?: number) => void;
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

      // Tier is based on lifetime_points_earned so redemptions don't cause tier drops
      setTotalPoints: (points, lifetimePoints) => set({
        totalPoints: points,
        tier: calculateTier(lifetimePoints !== undefined ? lifetimePoints : points),
      }),

      addReferral: (newRef) => {
        const { referrals, partner } = get();
        // Use crypto.randomUUID to avoid ID collisions with DB entries
        const id = `REF-${new Date().getFullYear()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
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
        const { referrals } = get();
        const now = new Date().toISOString();

        const updatedReferrals = referrals.map((r) => {
          if (r.id === id) {
            // Points are managed exclusively by DB writes in admin-store.
            // Do NOT mutate pointsEarned here to avoid stale/double-credit.
            return {
              ...r,
              status,
              updatedAt: now,
              statusHistory: [
                ...r.statusHistory,
                { status, date: now, note: note || `Status updated to ${status}` },
              ],
            };
          }
          return r;
        });

        set({ referrals: updatedReferrals });
      },

      redeemGiftCard: (brand, denomination, pointsRequired) => {
        const { totalPoints, redemptions, partner } = get();

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

        const newBalance = Math.max(0, totalPoints - pointsRequired);

        set({
          totalPoints: newBalance,
          partner: partner ? { ...partner, primePoints: newBalance } : null,
          redemptions: [newRedemption, ...redemptions],
        });

        return { success: true, voucherCode };
      },

      onboardTeamMember: async (memberData) => {
        const { teamMembers, totalPoints, partner } = get();
        const memberId = `TM-${String(teamMembers.length + 1).padStart(3, '0')}`;
        const newMember: TeamMember = {
          ...memberData,
          id: memberId,
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

        // Async sync to Supabase DB profiles table
        // Note: For proper Supabase Auth account creation, use /api/admin/partners/create instead.
        try {
          const { supabase } = await import('./supabase');
          const cleanNamePrefix = memberData.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'TM';
          const memberCode = `TM-${cleanNamePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

          await supabase.from('profiles').upsert(
            [
              {
                id: crypto.randomUUID(),
                name: memberData.name.trim(),
                email: memberData.email.trim().toLowerCase(),
                phone: memberData.phone.trim(),
                profession: memberData.profession,
                city: memberData.city.trim(),
                state: (memberData.state || 'Rajasthan').trim(),
                role: 'team_member',
                status: memberData.status || 'kyc_approved',
                team_code: memberCode,
                user_referral_code: memberCode,
                referred_by_leader_id: partner?.id || partner?.teamCode || null,
                is_email_verified: true,
                prime_points: 100,
                lifetime_points_earned: 100,
                kyc_submitted_at: new Date().toISOString(),
              },
            ],
            { onConflict: 'email' }
          );
        } catch (e) {
          console.warn('Sub-agent DB sync note:', e);
        }
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
          // Clear all Zustand store keys (current + legacy versions)
          const keysToRemove = [
            'primescore-partner-store-v10',
            'primescore-partner-store-v9',
            'primescore-partner-store-v8',
            'primescore-auth-session',
            'primescore-remember-me',
          ];
          keysToRemove.forEach((k) => {
            window.localStorage.removeItem(k);
            window.sessionStorage.removeItem(k);
          });
          // Clear any supabase auth tokens
          Object.keys(window.localStorage)
            .filter((k) => k.startsWith('sb-'))
            .forEach((k) => window.localStorage.removeItem(k));
          Object.keys(window.sessionStorage)
            .filter((k) => k.startsWith('sb-'))
            .forEach((k) => window.sessionStorage.removeItem(k));
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
      name: 'primescore-partner-store-v10',
    }
  )
);
