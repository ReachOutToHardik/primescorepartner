import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { usePartnerStore, Referral, ReferralStatus, RedemptionRecord } from './store';
import { useAdminStore } from './admin-store';

/**
 * useSupabaseSync — attaches realtime Supabase listeners and hydrates
 * both the partner store and admin store from the database.
 * Called once in each layout (portal + admin).
 */
export function useSupabaseSync() {
  const partner = usePartnerStore((state) => state.partner);
  const isAdminAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const { setPartner, setReferrals, setRedemptions, setTeamMembers, setTotalPoints } = usePartnerStore();
  const isSyncingRef = useRef(false);

  // ─── Admin: fetch all profiles + referrals from Supabase ────────────────────
  async function syncAdminData() {
    try {
      useAdminStore.setState({ isLoadingData: true });
      const { data: dbProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id, name, email, phone, profession, city, state, pan, status, role, team_code, created_at, joined_at, is_email_verified, avatar_url, referred_by_leader_id, prime_points, kyc_submitted_at')
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
        isEmailVerified: p.is_email_verified !== false,
        profilePhoto: p.avatar_url || undefined,
        referredByLeaderId: p.referred_by_leader_id || undefined,
        primePoints: p.prime_points || 0,
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
        statusHistory: Array.isArray(r.status_history)
          ? r.status_history
          : (r.status_history ? (typeof r.status_history === 'string' ? JSON.parse(r.status_history) : r.status_history) : []),
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

      // Fetch live broadcasts from Supabase
      const { data: dbBroadcasts } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbBroadcasts && dbBroadcasts.length > 0) {
        useAdminStore.setState({
          broadcasts: dbBroadcasts.map((b) => ({
            id: b.id,
            title: b.title,
            message: b.message,
            type: b.type || 'info',
            icon: b.icon || 'megaphone',
            color: b.color || 'yellow',
            publishedAt: b.published_at || b.created_at,
            isActive: b.is_active !== false,
          })),
        });
      }

      // Fetch live audit logs from Supabase
      const { data: dbAuditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbAuditLogs && dbAuditLogs.length > 0) {
        useAdminStore.setState({
          auditLogs: dbAuditLogs.map((l) => ({
            id: l.id,
            actorName: l.actor_name,
            actorRole: l.actor_role || 'super_admin',
            actionType: l.action_type,
            targetEntity: l.target_entity,
            details: l.details || '',
            timestamp: l.created_at,
          })),
        });
      }
    } catch (err) {
      console.error('Admin Supabase sync error:', err);
    } finally {
      useAdminStore.setState({ isLoadingData: false });
    }
  }

  // ─── Partner: fetch own profile + referrals + redemptions + team ─────────────
  async function syncPartnerData(partnerId: string) {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      // Refresh own profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .maybeSingle();

      let profile = profileData;

      if (!profile) {
        const userObj = (await supabase.auth.getUser()).data?.user;
        if (userObj?.email) {
          const targetEmail = userObj.email.toLowerCase().trim();
          const { data: profByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', targetEmail)
            .maybeSingle();

          if (profByEmail) {
            profile = profByEmail;
          } else {
            const defaultName = userObj.user_metadata?.name || userObj.user_metadata?.full_name || targetEmail.split('@')[0] || 'Partner User';
            const newProf = {
              id: partnerId,
              name: defaultName,
              email: targetEmail,
              phone: userObj.user_metadata?.phone || '',
              profession: userObj.user_metadata?.profession || 'Financial Consultant',
              city: 'Mumbai',
              state: 'Maharashtra',
              status: 'kyc_approved',
              role: 'individual',
              team_code: 'PS-' + partnerId.substring(0, 6).toUpperCase(),
              created_at: new Date().toISOString(),
              joined_at: new Date().toISOString(),
              prime_points: 100,
            };
            const { data: created } = await supabase
              .from('profiles')
              .upsert(newProf, { onConflict: 'email' })
              .select('*')
              .maybeSingle();
            profile = created || (newProf as any);
          }
        }
      }

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
          kycSubmittedAt: profile.kyc_submitted_at || profile.joined_at || profile.created_at,
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
        statusHistory: Array.isArray(r.status_history)
          ? r.status_history
          : (r.status_history ? (typeof r.status_history === 'string' ? JSON.parse(r.status_history) : r.status_history) : []),
      }));
      setReferrals(mappedReferrals);

      // Fetch redemptions with fallback if created_at column is missing
      let { data: dbRedemptions, error: redemptionsError } = await supabase
        .from('redemptions')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

      if (redemptionsError && redemptionsError.code === '42703') {
        const fallback = await supabase
          .from('redemptions')
          .select('*')
          .eq('partner_id', partnerId);
        dbRedemptions = fallback.data;
      }

      const currentLocalRedemptions = usePartnerStore.getState().redemptions || [];
      const dbMappedRedemptions: RedemptionRecord[] = (dbRedemptions || []).map((rd) => ({
        id: rd.id,
        brand: rd.brand_name || '',
        denomination: rd.denomination_inr || 0,
        points: rd.points_burned || rd.points_deducted || rd.points_required || 0,
        redeemedAt: rd.created_at || rd.redeemed_at || new Date().toISOString(),
        voucherCode: rd.voucher_code || '',
      }));

      const mergedRedemptionsMap = new Map<string, RedemptionRecord>();
      dbMappedRedemptions.forEach((r) => mergedRedemptionsMap.set(r.id, r));
      currentLocalRedemptions.forEach((r) => {
        if (!mergedRedemptionsMap.has(r.id)) {
          mergedRedemptionsMap.set(r.id, r);
        }
      });

      setRedemptions(Array.from(mergedRedemptionsMap.values()));

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
    // ─── Guard: verify a live Supabase session or admin auth before touching any DB table ──
    const runSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !isAdminAuthenticated) return; // Unauthenticated public requests bail out

      if (isAdminAuthenticated || session) {
        syncAdminData();
      }

      if (partner?.id) {
        syncPartnerData(partner.id);
      }
    };

    runSync();

    // ─── Realtime: subscribe if session exists or admin is authenticated ─────
    let profilesChannel: ReturnType<typeof supabase.channel> | null = null;
    let referralsChannel: ReturnType<typeof supabase.channel> | null = null;
    let redemptionsChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && !isAdminAuthenticated) return;

      const subId = Math.random().toString(36).substring(2, 7);

      profilesChannel = supabase
        .channel(`realtime-profiles-${subId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            syncAdminData();
            if (partner?.id && payload.new && (payload.new as { id?: string }).id === partner.id) {
              syncPartnerData(partner.id);
            }
          }
        )
        .subscribe();

      referralsChannel = supabase
        .channel(`realtime-referrals-${subId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'referrals' },
          () => {
            syncAdminData();
            if (partner?.id) syncPartnerData(partner.id);
          }
        )
        .subscribe();

      redemptionsChannel = supabase
        .channel(`realtime-redemptions-${subId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'redemptions' },
          () => {
            if (partner?.id) syncPartnerData(partner.id);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (profilesChannel) supabase.removeChannel(profilesChannel);
      if (referralsChannel) supabase.removeChannel(referralsChannel);
      if (redemptionsChannel) supabase.removeChannel(redemptionsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id, isAdminAuthenticated]);
}
