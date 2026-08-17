import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { usePartnerStore, Referral, ReferralStatus } from './store';
import { useAdminStore } from './admin-store';

/**
 * useSupabaseSync — attaches realtime Supabase listeners and hydrates
 * both the partner store and admin store from the database.
 * Called once in each layout (portal + admin).
 */
export function useSupabaseSync() {
  const partner = usePartnerStore((state) => state.partner);
  const { setPartner, setReferrals, setRedemptions, setTeamMembers, setTotalPoints } = usePartnerStore();
  const isSyncingRef = useRef(false);

  // ─── Admin: fetch all profiles + referrals from Supabase ────────────────────
  async function syncAdminData() {
    try {
      const { data: dbProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileErr) {
        console.error('Admin profile fetch error:', profileErr.message);
      }

      const mappedAdminPartners = (dbProfiles || []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        profession: p.profession || '',
        city: p.city || '',
        state: p.state || '',
        pan: p.pan || '',
        status: p.status,
        role: p.role,
        teamCode: p.team_code || '',
        joinedAt: p.joined_at || p.created_at,
        profilePhoto: p.avatar_url || undefined,
        referredByLeaderId: p.referred_by_leader_id || undefined,
      }));
      useAdminStore.setState({ partners: mappedAdminPartners });

      const { data: dbReferrals, error: refErr } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (refErr) {
        console.error('Admin referral fetch error:', refErr.message);
      }

      const mappedReferrals: Referral[] = (dbReferrals || []).map((r) => ({
        id: r.id,
        partnerId: r.partner_id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email || '',
        city: r.city || '',
        service: r.service_name || '',
        notes: r.notes || '',
        status: (r.current_stage || 'submitted') as ReferralStatus,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        pointsEarned: r.partner_points_earned || 0,
        statusHistory: [],
      }));
      useAdminStore.setState({ referrals: mappedReferrals });
      // Fetch live reward engine config
      const { data: dbConfig } = await supabase
        .from('system_config')
        .select('*')
        .eq('id', 'global_reward_config')
        .maybeSingle();

      if (dbConfig) {
        useAdminStore.setState({
          rewardConfig: {
            submissionPoints: dbConfig.submission_points ?? 20,
            enrollmentPoints: dbConfig.enrollment_points ?? 100,
            conversionPoints: dbConfig.conversion_points ?? 500,
            teamLeaderOverridePercent: Number(dbConfig.team_leader_override_percent ?? 10),
            pointsPerInr: dbConfig.points_per_inr ?? 10,
            payoutMode: dbConfig.payout_mode || 'points',
            minRedemptionPoints: dbConfig.min_redemption_points ?? 500,
            maxDailyRedemptionPoints: dbConfig.max_daily_redemption_points ?? 10000,
            tierMultipliers: dbConfig.tier_multipliers || { silver: 1.0, gold: 1.2, platinum: 1.5 },
            professionMultipliers: dbConfig.profession_multipliers || { dsa: 1.0, ca: 1.15, loan_consultant: 1.1, other: 1.0 },
          },
        });
      }
    } catch (err) {
      console.error('Admin Supabase sync error:', err);
    }
  }

  // ─── Partner: fetch own profile + referrals + redemptions + team ─────────────
  async function syncPartnerData(partnerId: string) {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      // Refresh own profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (profile) {
        setPartner({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          profession: profile.profession || '',
          city: profile.city || '',
          state: profile.state || '',
          pan: profile.pan || '',
          status: profile.status,
          role: profile.role,
          teamCode: profile.team_code || '',
          joinedAt: profile.joined_at || profile.created_at,
          profilePhoto: profile.avatar_url || undefined,
        });
        setTotalPoints(profile.prime_points || 0);
      }

      // Fetch partner's own referrals
      const { data: dbReferrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      const mappedReferrals: Referral[] = (dbReferrals || []).map((r) => ({
        id: r.id,
        partnerId: r.partner_id,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email || '',
        city: r.city || '',
        service: r.service_name || '',
        notes: r.notes || '',
        status: (r.current_stage || 'submitted') as ReferralStatus,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        pointsEarned: r.partner_points_earned || 0,
        statusHistory: [],
      }));
      setReferrals(mappedReferrals);

      // Fetch redemptions
      const { data: dbRedemptions } = await supabase
        .from('redemptions')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      setRedemptions(
        (dbRedemptions || []).map((rd) => ({
          id: rd.id,
          brand: rd.brand_name || '',
          denomination: rd.denomination_inr || 0,
          points: rd.points_deducted || 0,
          redeemedAt: rd.created_at,
          voucherCode: rd.voucher_code || '',
        }))
      );

      // If team leader, fetch team members
      const currentPartner = usePartnerStore.getState().partner;
      if (currentPartner?.role === 'team_leader') {
        const { data: dbMembers } = await supabase
          .from('profiles')
          .select('*')
          .eq('referred_by_leader_id', partnerId);

        setTeamMembers(
          (dbMembers || []).map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone || '',
            profession: m.profession || '',
            city: m.city || '',
            status: m.status,
            joinedAt: m.joined_at || m.created_at,
            casesCount: 0,
            totalMemberPoints: m.prime_points || 0,
            overridePointsEarned: 0,
            referralsLog: [],
            redemptionsLog: [],
          }))
        );
      }
    } catch (err) {
      console.error('Partner Supabase sync error:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }

  useEffect(() => {
    // Always sync admin data (used by admin layout)
    syncAdminData();

    // Sync partner-specific data if logged in
    if (partner?.id) {
      syncPartnerData(partner.id);
    }

    // ─── Realtime: profiles table ────────────────────────────────────────────
    const profilesChannel = supabase
      .channel('realtime-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          // Refresh admin list
          syncAdminData();
          // If it's our own profile, update partner state
          if (partner?.id && payload.new && (payload.new as { id?: string }).id === partner.id) {
            syncPartnerData(partner.id);
          }
        }
      )
      .subscribe();

    // ─── Realtime: referrals table ───────────────────────────────────────────
    const referralsChannel = supabase
      .channel('realtime-referrals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        () => {
          syncAdminData();
          if (partner?.id) {
            syncPartnerData(partner.id);
          }
        }
      )
      .subscribe();

    // ─── Realtime: redemptions table ─────────────────────────────────────────
    const redemptionsChannel = supabase
      .channel('realtime-redemptions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'redemptions' },
        () => {
          if (partner?.id) {
            syncPartnerData(partner.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(referralsChannel);
      supabase.removeChannel(redemptionsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id]);
}
