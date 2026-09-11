'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePartnerStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  CheckCircle,
  Clock,
  Coins,
  TrendUp,
  UserPlus,
  ArrowRight,
  Sparkle,
  Trophy,
  ShieldCheck,
  Building,
  Headset,
  BookBookmark,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Lightning,
  Funnel,
  ShareNetwork,
  Copy,
  CaretRight,
  CaretLeft,
  QrCode,
  LockKey,
  PaperPlaneTilt,
  Crown,
  Gift,
  Info
} from '@phosphor-icons/react';

// Chart.js Setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

// Tier Level & Partner Offers Carousel Data (3 Cards: Welcome Bonus, Gold Tier & Platinum Tier)
const TIER_OFFERS = [
  {
    id: 1,
    badge: '100 Pts Signup Bonus · Refer Your Circle',
    title: 'New Partner Welcome & Referral Bonus',
    description: 'Get 100 PrimePoints on KYC approval. Share your referral link with your network and earn on every client enrollment.',
    icon: Gift,
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    link: '/refer',
    ctaText: 'Refer Circle',
    code: 'TKT-BONUS',
  },
  {
    id: 2,
    badge: '20,000 – 49,999 PrimePoints · Gold Tier',
    title: 'Gold Partner Tier',
    description: '125 Pts on Referred User Enrollment · 12% Case Completion Commission · Dedicated Relationship Manager',
    icon: Coins,
    iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    link: '/rewards',
    ctaText: 'View Tier',
    code: 'TKT-GOLD',
  },
  {
    id: 3,
    badge: '50,000+ PrimePoints · Platinum VIP',
    title: 'Platinum VIP Tier',
    description: '150 Pts on Referred User Enrollment · 15% Case Completion Commission · Dedicated RM & Priority Payouts',
    icon: Crown,
    iconBg: 'bg-indigo-50 text-[#1B2A72] border-indigo-200',
    link: '/rewards',
    ctaText: 'View Tier',
    code: 'TKT-PLAT',
  },
];

export default function PartnerDashboard() {
  const { partner, referrals, redemptions, totalPoints, tier } = usePartnerStore();
  const currentTier = tier || 'Gold';

  // Offers Carousel Auto Switcher (every 4.5 seconds)
  const [offerSlideIndex, setOfferSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOfferSlideIndex((prev) => (prev + 1) % TIER_OFFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrevOffer = () => {
    setOfferSlideIndex((prev) => (prev === 0 ? TIER_OFFERS.length - 1 : prev - 1));
  };

  const handleNextOffer = () => {
    setOfferSlideIndex((prev) => (prev + 1) % TIER_OFFERS.length);
  };

  // Metrics calculation
  const totalCount = referrals.length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;
  const pendingCount = referrals.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length;

  // Time range filter state & Chart Metric mode toggle
  const [timeRange, setTimeRange] = useState<'today' | '15d' | '30d' | 'month' | '6m' | '1y'>('6m');
  const [chartMetricMode, setChartMetricMode] = useState<'both' | 'referrals' | 'points'>('both');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [pointTransactions, setPointTransactions] = useState<{
    id: string;
    transaction_type: string;
    points_change: number;
    balance_after: number;
    title: string;
    reference_id: string | null;
    created_at: string;
  }[]>([]);

  const [pointsPerInr, setPointsPerInr] = useState(4);

  // Fetch dynamic reward conversion rate from Supabase system_config
  useEffect(() => {
    const fetchRewardConfig = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('system_config')
          .select('points_per_inr')
          .eq('id', 'global_reward_config')
          .single();
        if (data?.points_per_inr) {
          setPointsPerInr(Number(data.points_per_inr));
        }
      } catch (err) {
        console.warn('Config fetch note:', err);
      }
    };
    fetchRewardConfig();
  }, []);

  // Fetch real point_transactions from DB table (Single Source of Truth)
  useEffect(() => {
    if (!partner?.id) return;
    const fetchTransactions = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('partner_id', partner.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (data) setPointTransactions(data);
      } catch (err) {
        console.warn('Point transactions fetch error:', err);
      }
    };
    fetchTransactions();
  }, [partner?.id]);

  // Interactive trend datasets dynamically aggregated from EVERY real partner referral and point transaction
  const trendData = useMemo(() => {
    const now = new Date();

    // Unified events array sorted ASCENDING by date
    const events: { dateStr: string; pointsChange: number; isReferral: boolean }[] = [];

    const toLocalDateStr = (isoString?: string | null) => {
      if (!isoString) return new Date().toISOString().split('T')[0];
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString.split('T')[0];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const existingTxRefIds = new Set(pointTransactions.map((tx) => tx.reference_id || tx.id));

    // 1. Point Transactions from DB (Single Source of Truth for Points Ledger)
    if (pointTransactions.length > 0) {
      pointTransactions.forEach((tx) => {
        if (!tx.created_at) return;
        events.push({
          dateStr: toLocalDateStr(tx.created_at),
          pointsChange: tx.points_change || 0,
          isReferral: tx.transaction_type === 'referral_earned',
        });
      });

      // Account for any remaining points between DB transactions and current totalPoints
      const dbTxSum = pointTransactions.reduce((sum, tx) => sum + (tx.points_change || 0), 0);
      const remainingUnloggedPoints = totalPoints - dbTxSum;
      if (remainingUnloggedPoints > 0 && partner) {
        events.push({
          dateStr: toLocalDateStr(partner.kycSubmittedAt || partner.joinedAt),
          pointsChange: remainingUnloggedPoints,
          isReferral: false,
        });
      }
    } else {
      // Fallback for new accounts without DB transactions yet
      if (partner && totalPoints > 0) {
        events.push({
          dateStr: toLocalDateStr(partner.kycSubmittedAt || partner.joinedAt),
          pointsChange: totalPoints,
          isReferral: false,
        });
      }
    }

    // 2. Add local redemptions ONLY if not already in DB transactions
    redemptions.forEach((rdm) => {
      if (!existingTxRefIds.has(rdm.id) && !existingTxRefIds.has(rdm.voucherCode)) {
        events.push({
          dateStr: toLocalDateStr(rdm.redeemedAt),
          pointsChange: -rdm.points,
          isReferral: false,
        });
      }
    });

    // 3. Referral Volume markers (strictly for Referrals Count metric, zero points pollution)
    const partnerReferrals = referrals.filter(
      (r) => !partner?.id || r.partnerId === partner.id || r.partnerId === 'demo'
    );
    partnerReferrals.forEach((r) => {
      if (!r.createdAt) return;
      events.push({
        dateStr: toLocalDateStr(r.createdAt),
        pointsChange: 0,
        isReferral: true,
      });
    });

    // Sort events ascending by date
    events.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    const buildBuckets = (numPeriods: number, periodType: 'day' | 'month') => {
      const buckets: { key: string; label: string; referrals: number; points: number }[] = [];

      if (periodType === 'day') {
        for (let i = numPeriods - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const key = `${year}-${month}-${day}`;
          const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          buckets.push({ key, label, referrals: 0, points: 0 });
        }
      } else {
        for (let i = numPeriods - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthNum = String(d.getMonth() + 1).padStart(2, '0');
          const key = `${d.getFullYear()}-${monthNum}`;
          const label = d.toLocaleString('en-US', { month: 'short' });
          buckets.push({ key, label, referrals: 0, points: 0 });
        }
      }

      // Map events directly into their corresponding date/month bucket
      events.forEach((ev) => {
        const evMonthKey = ev.dateStr.substring(0, 7);
        const evKey = periodType === 'day' ? ev.dateStr : evMonthKey;
        const targetBucket = buckets.find((b) => b.key === evKey);
        if (targetBucket) {
          if (ev.isReferral) {
            targetBucket.referrals += 1;
          }
          if (ev.pointsChange > 0) {
            targetBucket.points += ev.pointsChange;
          }
        }
      });

      return buckets;
    };

    if (timeRange === 'today') return buildBuckets(1, 'day');
    if (timeRange === '15d') return buildBuckets(15, 'day');
    if (timeRange === '30d') return buildBuckets(30, 'day');
    if (timeRange === 'month') return buildBuckets(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), 'day');
    if (timeRange === '6m') return buildBuckets(6, 'month');
    return buildBuckets(12, 'month');
  }, [timeRange, referrals, redemptions, pointTransactions, partner]);

  // Chart.js Dataset Configuration
  const chartJsData = useMemo(() => {
    const datasets: any[] = [];

    if (chartMetricMode === 'points' || chartMetricMode === 'both') {
      datasets.push({
        fill: true,
        label: 'PrimePoints Earned',
        data: trendData.map((d) => d.points),
        borderColor: '#1B2A72',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(27, 42, 114, 0.12)');
          gradient.addColorStop(1, 'rgba(27, 42, 114, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#1B2A72',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: trendData.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      });
    }

    if (chartMetricMode === 'referrals' || chartMetricMode === 'both') {
      datasets.push({
        fill: chartMetricMode === 'referrals',
        label: 'Referrals Submitted',
        data: trendData.map((d) => d.referrals),
        borderColor: '#E63329',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(230, 51, 41, 0.12)');
          gradient.addColorStop(1, 'rgba(230, 51, 41, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#E63329',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: trendData.length > 20 ? 2 : 4,
        pointHoverRadius: 6,
        yAxisID: chartMetricMode === 'both' ? 'y1' : 'y',
      });
    }

    return {
      labels: trendData.map((d) => d.label),
      datasets,
    };
  }, [trendData, chartMetricMode]);

  // Chart.js Options
  const chartJsOptions: any = useMemo(() => {
    const scalesConfig: any = {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter', size: 10, weight: '500' }, color: '#64748B', maxRotation: 45 },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#64748B',
          precision: 0,
          stepSize: chartMetricMode === 'referrals' ? 1 : undefined,
        },
        grid: { color: 'rgba(241, 245, 249, 1)' },
      },
    };

    if (chartMetricMode === 'both') {
      scalesConfig.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#94A3B8',
          precision: 0,
          stepSize: 1,
        },
        grid: { display: false },
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            font: { family: 'Inter', size: 11, weight: '600' },
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#0F1A4E',
          padding: 10,
          cornerRadius: 6,
          titleFont: { family: 'Inter', size: 12, weight: '700' },
          bodyFont: { family: 'Inter', size: 11 },
          callbacks: {
            label: function (context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              if (label.includes('PrimePoints')) {
                return ` ${label}: ${value} Pts`;
              }
              return ` ${label}: ${value} Case${value !== 1 ? 's' : ''}`;
            },
          },
        },
      },
      scales: scalesConfig,
    };
  }, [chartMetricMode]);

  // Chronologically sorted transaction ledger for IN / OUT activity
  const passbookLedger = useMemo(() => {
    // If real point_transactions exist in DB, map directly from database table (Single Source of Truth)
    if (pointTransactions.length > 0) {
      return pointTransactions.map((tx) => {
        const d = tx.created_at ? new Date(tx.created_at) : new Date();
        const categoryMap: Record<string, 'earned_referral' | 'earned_enrolled' | 'submitted' | 'redeemed_voucher'> = {
          signup_bonus: 'earned_referral',
          referral_earned: 'earned_referral',
          enrolled_earned: 'earned_enrolled',
          voucher_redeemed: 'redeemed_voucher',
        };

        return {
          id: tx.id,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: categoryMap[tx.transaction_type] || 'submitted',
          title: tx.title,
          referenceId: tx.reference_id || tx.id,
          amount: tx.points_change,
          runningBalance: tx.balance_after,
        };
      });
    }

    // Fallback: Compute dynamically via mathematical accumulator formula (Previous Balance + Added Points)
    const transactions: {
      id: string;
      date: string;
      rawDate: Date;
      category: 'earned_referral' | 'earned_enrolled' | 'submitted' | 'redeemed_voucher';
      title: string;
      referenceId: string;
      amount: number;
      runningBalance: number;
    }[] = [];

    // 1. Sign-Up Bonus Entry (if verified or bonus credited)
    if (partner?.status === 'kyc_approved' || (partner?.primePoints && partner.primePoints >= 100)) {
      const d = partner?.joinedAt ? new Date(partner.joinedAt) : new Date(Date.now() - 86400000);
      transactions.push({
        id: `tx-signup-bonus-${partner?.id || 'partner'}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: d,
        category: 'earned_referral',
        title: '🎁 Welcome Sign-up Bonus (KYC Approved)',
        referenceId: 'BONUS-100',
        amount: 100,
        runningBalance: 0,
      });
    }

    // 2. Referral Activity Entries
    referrals.forEach((r) => {
      const d = r.createdAt ? new Date(r.createdAt) : new Date();
      if (r.status === 'completed') {
        transactions.push({
          id: `tx-ref-comp-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'earned_referral',
          title: `Referral Case Resolved (${r.customerName})`,
          referenceId: r.id,
          amount: r.pointsEarned || 500,
          runningBalance: 0,
        });
      } else if (r.status === 'enrolled') {
        transactions.push({
          id: `tx-ref-enr-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'earned_enrolled',
          title: `Customer Enrolled (${r.customerName})`,
          referenceId: r.id,
          amount: 20,
          runningBalance: 0,
        });
      } else {
        transactions.push({
          id: `tx-ref-sub-${r.id}`,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawDate: d,
          category: 'submitted',
          title: `Client Lead Submitted (${r.customerName})`,
          referenceId: r.id,
          amount: 0,
          runningBalance: 0,
        });
      }
    });

    // 3. Voucher Redemption Entries
    redemptions.forEach((rdm) => {
      const d = rdm.redeemedAt ? new Date(rdm.redeemedAt) : new Date();
      transactions.push({
        id: `tx-rdm-${rdm.id}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: d,
        category: 'redeemed_voucher',
        title: `Voucher Redemption Claim (${rdm.brand} ₹${rdm.denomination})`,
        referenceId: rdm.id,
        amount: -(rdm.points || 0),
        runningBalance: 0,
      });
    });

    // Sort chronologically ascending to compute accurate running balance accumulator
    transactions.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    let currBalance = 0;
    transactions.forEach((tx) => {
      currBalance += tx.amount;
      tx.runningBalance = Math.max(0, currBalance);
    });

    // Return in reverse chronological order (newest activity first)
    return transactions.reverse();
  }, [referrals, redemptions, partner, pointTransactions]);

  // Recent 5 referrals
  const recentReferrals = useMemo(() => referrals.slice(0, 5), [referrals]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Hero Section: Offers Carousel + Quick Actions Deck */}
      {/* Top Hero Section: Offers Carousel + Quick Actions Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column: Offers & Tier Rewards Carousel */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-2.5">
          {/* Section Header */}
          <div className="flex items-center justify-between px-0.5">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0F1A4E] tracking-tight">
              Offers &amp; Tier Benefits
            </h2>

            {/* Navigation Arrows (< and >) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevOffer}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200/80 shadow-2xs"
                title="Previous offer"
              >
                <CaretLeft size={15} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleNextOffer}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-200/80 shadow-2xs"
                title="Next offer"
              >
                <CaretRight size={15} weight="bold" />
              </button>
            </div>
          </div>

          {/* Dynamic Offer Card (Smooth Horizontal Scrolling Carousel with Abstract Ticket Design) */}
          <div className="flex-1 flex flex-col justify-between space-y-2.5">
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${offerSlideIndex * 100}%)` }}
              >
                {TIER_OFFERS.map((offer, idx) => {
                  return (
                    <div key={offer.id} className="w-full shrink-0">
                      <Link
                        href={offer.link}
                        className="block group cursor-pointer"
                        title={`${offer.title} - ${offer.ctaText}`}
                      >
                        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#1B2A72]/30 transition-all duration-300 flex items-stretch">
                          {/* Ticket Perforation Notches (Top and Bottom Cutouts) */}
                          <div className="absolute -top-2.5 right-[84px] sm:right-[114px] w-5 h-5 rounded-full bg-[#F4F6FA] border-b border-slate-200/90 z-10 pointer-events-none" />
                          <div className="absolute -bottom-2.5 right-[84px] sm:right-[114px] w-5 h-5 rounded-full bg-[#F4F6FA] border-t border-slate-200/90 z-10 pointer-events-none" />

                          {/* Main Ticket Body (Left Section) */}
                          <div className="flex-1 p-3.5 sm:p-4.5 flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                            {/* Abstract Geometric Vector Stamp (No AI Icons) */}
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 group-hover:border-[#1B2A72]/30 transition-all">
                              {idx === 0 && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-700">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                                  <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                                  <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">+100</text>
                                </svg>
                              )}
                              {idx === 1 && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-600">
                                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                                  <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                                  <text x="12" y="15" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="currentColor">GLD</text>
                                </svg>
                              )}
                              {idx === 2 && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#1B2A72]">
                                  <rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(45 12 12)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
                                  <text x="12" y="15" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="currentColor">VIP</text>
                                </svg>
                              )}
                            </div>

                            {/* Middle Ticket Info */}
                            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-block text-[9px] sm:text-[10px] font-bold text-slate-600 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 truncate">
                                  {offer.badge}
                                </span>
                              </div>
                              <h3 className="font-display text-xs sm:text-sm md:text-base font-bold text-[#0F1A4E] group-hover:text-[#1B2A72] leading-snug truncate transition-colors">
                                {offer.title}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                                {offer.description}
                              </p>
                            </div>
                          </div>

                          {/* Dashed Perforation Tear Line */}
                          <div className="w-0 border-r-2 border-dashed border-slate-200/90 my-2.5 shrink-0" />

                          {/* Right Ticket Stub (Action Rip with Minimal Abstract Ticket Code) */}
                          <div className="w-[84px] sm:w-[114px] bg-slate-50/70 group-hover:bg-blue-50/50 flex flex-col items-center justify-center p-2 sm:p-3 text-center transition-colors shrink-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F1A4E] group-hover:bg-[#1B2A72] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 active:scale-95 transition-all mb-1">
                              <ArrowRight size={14} weight="bold" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#0F1A4E] group-hover:text-[#1B2A72] uppercase tracking-wider truncate block w-full px-1">
                              {offer.ctaText}
                            </span>
                            <span className="text-[8px] font-mono text-slate-400 mt-0.5 tracking-tighter">
                              {`TKT-0${idx + 1}`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {TIER_OFFERS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setOfferSlideIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    offerSlideIndex === idx
                      ? 'w-5 h-1.5 bg-[#1B2A72]'
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 3 Dedicated Quick Action Tiles */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0F1A4E] tracking-tight">
              Quick Actions
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Share &amp; Refer
            </span>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 items-stretch">
            {/* 1. PrimeScore Referral (Direct Client Signup Web Link) */}
            <a
              href={`https://dashboard.primescore.in/ref/${(partner as any)?.userReferralCode || 'PSMKMVLN'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center"
              title="Open direct client sign-up web link in PrimeScore"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-[#1B2A72] group-hover:bg-[#1B2A72] group-hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs group-hover:scale-105 mb-2">
                <PaperPlaneTilt size={20} weight="bold" />
              </div>
              <span className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#1B2A72] transition-colors leading-tight flex items-center gap-0.5">
                Dashboard <ArrowUpRight size={10} className="text-slate-400 group-hover:text-[#1B2A72] transition-colors" />
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Dashboard Refer
              </span>
            </a>

            {/* 2. Client Referral (Referral Form - Core Primary Action) */}
            {partner?.status === 'kyc_approved' ? (
              <Link
                href="/refer"
                className="group flex flex-col items-center justify-center p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-red-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 text-[#E63329] group-hover:bg-[#E63329] group-hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs group-hover:scale-105 mb-2">
                  <UserPlus size={20} weight="bold" />
                </div>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#E63329] transition-colors leading-tight">
                  Refer Client
                </span>
                <span className="text-[10px] text-red-600 font-semibold mt-0.5">
                  + Add Lead
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setKycModalOpen(true)}
                className="group flex flex-col items-center justify-center p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-red-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 text-[#E63329] group-hover:bg-[#E63329] group-hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs group-hover:scale-105 mb-2">
                  <UserPlus size={20} weight="bold" />
                </div>
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#E63329] transition-colors leading-tight">
                  Refer Client
                </span>
                <span className="text-[10px] text-red-600 font-semibold mt-0.5">
                  + Add Lead
                </span>
              </button>
            )}

            {/* 3. Show QR Code Modal */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="group flex flex-col items-center justify-center p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center"
              title="View your partner client QR code"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#0F1A4E] group-hover:text-white transition-all duration-200 flex items-center justify-center shadow-2xs group-hover:scale-105 mb-2">
                <QrCode size={20} weight="bold" />
              </div>
              <span className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0F1A4E] transition-colors leading-tight">
                Show QR
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                Scan Code
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Overview Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-display font-bold text-base sm:text-lg text-[#0F1A4E] tracking-tight">
            Performance Overview
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Real-time Partner Metrics
          </span>
        </div>

        {/* Metric Stats Rail (2x2 Grid on Mobile, 4 Blocks on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Referrals */}
        <Link href="/referrals" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-[#1B2A72]/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-[#1B2A72] transition-colors tracking-wider truncate">
                Total Referrals
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 text-[#1B2A72] group-hover:bg-[#1B2A72] group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Users size={18} weight="bold" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {totalCount}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendUp size={12} /> +15%
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Submitted client leads</p>
          </Card>
        </Link>

        {/* Approved & Completed */}
        <Link href="/referrals?status=completed" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-emerald-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-emerald-700 transition-colors tracking-wider truncate">
                Completed & Paid
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <CheckCircle size={18} weight="fill" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {completedCount}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                {Math.round((completedCount / (totalCount || 1)) * 100)}% Success
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Resolved & rewarded</p>
          </Card>
        </Link>

        {/* Pending In Progress */}
        <Link href="/referrals?status=pending" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-amber-700 transition-colors tracking-wider truncate">
                Active Pending
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Clock size={18} weight="bold" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-slate-900">
                {pendingCount}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-700 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border border-amber-200">In Pipeline</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Active bureau processing</p>
          </Card>
        </Link>

        {/* Total Reward Points */}
        <Link href="/rewards" className="block">
          <Card variant="elevated" className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 hover:shadow-md hover:border-amber-500/30 transition-all cursor-pointer group h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 group-hover:text-[#1B2A72] transition-colors tracking-wider truncate">
                PrimePoints Balance
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-100/60 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center shadow-2xs shrink-0">
                <Coins size={18} weight="fill" className="text-amber-500 group-hover:text-white" />
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="font-mono-num font-bold text-2xl sm:text-3xl text-[#1B2A72]">
                {totalPoints.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                (≈ ₹{Math.round(totalPoints / (pointsPerInr || 4)).toLocaleString('en-IN')})
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Instant Gift Vouchers</p>
          </Card>
        </Link>
        </div>
      </div>

      {/* Middle Section: Chart + PrimePoints Tier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Referral & Performance Analytics Chart */}
        <Card variant="elevated" className="lg:col-span-8 p-6 space-y-4 border border-slate-200 shadow-xs rounded-2xl bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                Referral & Performance Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Track referral volume and earned reward points over selected period.
              </p>
            </div>

            {/* Date Range Pill Buttons */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
              {(
                [
                  { id: 'today', label: '1D', fullLabel: 'Today' },
                  { id: '15d', label: '15D', fullLabel: '15 Days' },
                  { id: '30d', label: '30D', fullLabel: '30 Days' },
                  { id: 'month', label: 'Month', fullLabel: 'This Month' },
                  { id: '6m', label: '6M', fullLabel: '6 Months' },
                  { id: '1y', label: '1Y', fullLabel: '1 Year' },
                ] as { id: 'today' | '15d' | '30d' | 'month' | '6m' | '1y'; label: string; fullLabel: string }[]
              ).map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setTimeRange(range.id)}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
                    timeRange === range.id
                      ? 'bg-[#1B2A72] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="sm:hidden">{range.label}</span>
                  <span className="hidden sm:inline">{range.fullLabel || range.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metric View Mode Toggles & Summary Metrics Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* View Mode Toggle Segmented Control */}
            <div className="flex items-center gap-1 text-xs bg-slate-100/70 p-1 rounded-lg w-full sm:w-auto">
              <span className="text-slate-400 font-semibold text-[10px] uppercase px-1 hidden sm:inline">View:</span>
              {(
                [
                  { id: 'both', label: 'Overview' },
                  { id: 'referrals', label: 'Referrals' },
                  { id: 'points', label: 'Points' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setChartMetricMode(mode.id)}
                  className={`flex-1 sm:flex-initial px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    chartMetricMode === mode.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Total Metric Count Highlights */}
            <div className="flex items-center gap-3 text-xs font-mono-num font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 self-end sm:self-auto">
              <span>Total Referrals: <strong className="text-slate-900">{totalCount}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Points: <strong className="text-[#1B2A72]">+{totalPoints.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 w-full pt-2">
            <Line data={chartJsData} options={chartJsOptions} />
          </div>
        </Card>

        {/* Right 4 cols: PrimePoints Tier Status & Quick Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F1A4E] text-white p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
                Partner Tier Status
              </span>
              <span className="px-3 py-1 bg-[#F5C518] text-[#0F1A4E] font-display font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1 shadow-xs">
                <Trophy size={14} weight="fill" /> {currentTier} Tier
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-300 block">Available Balance</span>
              <span className="font-mono-num font-bold text-3xl text-white">
                {totalPoints.toLocaleString()} Pts
              </span>
              <p className="text-xs text-[#F5C518] font-bold mt-1 font-mono-num">
                &asymp; ₹{Math.round(totalPoints / (pointsPerInr || 4)).toLocaleString('en-IN')} INR Payout Equivalent
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/rewards"
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 group"
              >
                <span>View Rewards Roadmap</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/redeem"
                className="px-3.5 py-1.5 bg-white text-[#1B2A72] hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                Redeem
              </Link>
            </div>
          </div>

          {/* Instant Referral URL Card (Exact User Design) */}
          <Card variant="elevated" className="p-6 space-y-4 border border-slate-200 shadow-xs rounded-2xl bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center shrink-0">
                <ShareNetwork size={20} weight="bold" className="text-[#1B2A72]" />
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Instant Referral URL
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Share your direct client signup link or scan to open referral submission form.
            </p>

            <button
              type="button"
              onClick={() => {
                if (partner?.status !== 'kyc_approved') {
                  setKycModalOpen(true);
                } else {
                  setQrModalOpen(true);
                }
              }}
              className="w-full p-3.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors cursor-pointer group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span>Generate Client QR &amp; Link</span>
                {partner?.status !== 'kyc_approved' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1 border border-amber-200">
                    <LockKey size={12} weight="bold" /> Locked
                  </span>
                )}
              </span>
              <CaretRight size={16} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </Card>
        </div>
      </div>

      {/* Itemized PrimePoints Transaction Passbook & Audit Ledger Table */}
      <Card variant="elevated" className="p-6 space-y-4 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h2 className="font-display text-[13px] sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
              <Receipt size={20} className="text-[#1B2A72] shrink-0" />
              <span className="truncate">Itemized PrimePoints Transaction Passbook</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete chronological ledger of all points earned from client referrals, team overrides, and redeemed gift vouchers.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
            Total Transactions: {passbookLedger.length}
          </span>
        </div>

        {/* ── Mobile Card Stack (shown below md) ── */}
        <div className="md:hidden space-y-2.5">
          {passbookLedger.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400 font-medium">
              No points transactions yet. Submit referrals or redeem vouchers to see activity here.
            </p>
          ) : (
            passbookLedger.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-3 shadow-2xs"
              >
                {/* Row 1: Badge + Date */}
                <div className="flex items-center justify-between gap-2">
                  {tx.category === 'earned_referral' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">
                      <ArrowUpRight size={11} /> Earned
                    </span>
                  ) : tx.category === 'earned_enrolled' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase rounded-md border border-blue-200">
                      <ArrowUpRight size={11} /> Enrolled
                    </span>
                  ) : tx.category === 'redeemed_voucher' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-md border border-red-200">
                      <ArrowDownRight size={11} /> Redeemed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                      Submitted
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">{tx.date}</span>
                </div>

                {/* Row 2: Title */}
                <p className="text-xs font-semibold text-slate-900 leading-snug">{tx.title}</p>

                {/* Row 3: Points Change + Running Balance */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Points Change</p>
                    <p className={`font-mono font-bold text-sm ${
                      tx.amount > 0 ? 'text-emerald-600' : tx.amount < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()} Pts` : tx.amount < 0 ? `${tx.amount.toLocaleString()} Pts` : '0 Pts'}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Running Balance</p>
                    <p className="font-mono font-bold text-sm text-slate-900">
                      {tx.runningBalance.toLocaleString()} Pts
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Desktop Table (shown md and above) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Transaction Details & Reference</th>
                <th className="py-3.5 px-4 text-right">Points Change</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-num">
              {passbookLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    No points transactions recorded yet. Submit client referrals or claim gift vouchers to log activities.
                  </td>
                </tr>
              ) : (
                passbookLedger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-sans whitespace-nowrap">{tx.date}</td>

                    <td className="py-3.5 px-4">
                      {tx.category === 'earned_referral' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase rounded-md border border-emerald-200">
                          <ArrowUpRight size={12} className="text-emerald-600" /> Earned IN
                        </span>
                      ) : tx.category === 'earned_enrolled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase rounded-md border border-blue-200">
                          <ArrowUpRight size={12} className="text-blue-600" /> Enrolled IN
                        </span>
                      ) : tx.category === 'redeemed_voucher' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] uppercase rounded-md border border-red-200">
                          <ArrowDownRight size={12} className="text-red-600" /> Redeemed OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-md border border-slate-200">
                          Submitted
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                      <div>{tx.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Ref: {tx.referenceId}</div>
                    </td>

                    <td className={`py-3.5 px-4 text-right font-bold text-sm font-mono ${
                      tx.amount > 0 ? 'text-emerald-600' : tx.amount < 0 ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()} Pts` : tx.amount < 0 ? `${tx.amount.toLocaleString()} Pts` : '0 Pts'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {tx.runningBalance.toLocaleString()} Pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </Card>

      {/* INSTANT CLIENT QR CODE & LINK MODAL */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={
          <span className="text-[13px] sm:text-base font-bold text-slate-900 whitespace-nowrap block truncate">
            Generate Client QR &amp; Direct Referral Link
          </span>
        }
      >
        <div className="space-y-5 text-center py-2">
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Scan this QR code or copy your direct client signup link to submit new referrals instantly with automatic partner code tracking.
          </p>

          <div className="w-56 p-4 mx-auto bg-white rounded-2xl border-2 border-dashed border-[#1B2A72]/30 flex flex-col items-center justify-center gap-2.5 shadow-sm relative group">
            <QRCodeSVG
              value={`https://dashboard.primescore.in/ref/${(partner as any)?.userReferralCode || 'PSMKMVLN'}`}
              size={170}
              bgColor={"#FFFFFF"}
              fgColor={"#0F1A4E"}
              level={"H"}
              includeMargin={false}
              imageSettings={{
                src: "/qr-logo.png",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <span className="text-[10px] font-bold text-[#1B2A72] bg-indigo-50 px-2.5 py-1 rounded-md mt-1 border border-indigo-200 font-mono-num uppercase">
              Client Code: {(partner as any)?.userReferralCode || 'PSMKMVLN'}
            </span>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Direct Client Referral Web Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://dashboard.primescore.in/ref/${(partner as any)?.userReferralCode || 'PSMKMVLN'}`}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://dashboard.primescore.in/ref/${(partner as any)?.userReferralCode || 'PSMKMVLN'}`);
                  alert('Client referral link copied to clipboard!');
                }}
                className="px-4 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy size={15} weight="bold" /> Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* KYC Under Review Alert Modal */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.joinedAt}
      />
    </div>
  );
}
