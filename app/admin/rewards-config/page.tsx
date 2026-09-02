'use client';

import React, { useState } from 'react';
import { useAdminStore, RewardEngineConfig } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Coins,
  CurrencyInr,
  SlidersHorizontal,
  CheckCircle,
  FloppyDisk,
  Trophy,
  UsersThree,
  Wrench,
  Percent,
  Sparkle,
  Calculator,
  ArrowRight,
  PencilSimple,
  ArrowClockwise,
} from '@phosphor-icons/react';

export default function RewardsConfigPage() {
  const { rewardConfig, updateRewardConfig, services, updateService } = useAdminStore();

  // Local Form State initialized from store
  const [formData, setFormData] = useState<RewardEngineConfig>({ ...rewardConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Service Edit Modal
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceFee, setEditServiceFee] = useState<number>(10000);

  // Simulator State based on Case Amount received
  const [simProfession, setSimProfession] = useState<'ca' | 'dsa' | 'loan_consultant' | 'other'>('ca');
  const [simTier, setSimTier] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [simCases, setSimCases] = useState<number>(10);
  const [simSelectedServiceId, setSimSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [simCaseAmount, setSimCaseAmount] = useState<number>(10000);

  // Handle Form Change
  const handleChange = (field: keyof RewardEngineConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleNestedChange = (
    category: 'tierMultipliers' | 'professionMultipliers',
    key: string,
    val: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: val,
      },
    }));
    setSaveSuccess(false);
  };

  const handleSaveConfig = () => {
    updateRewardConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleReset = () => {
    setFormData({ ...rewardConfig });
    setSaveSuccess(false);
  };

  const handleOpenEditService = (serviceId: string, currentFee: number) => {
    setEditingServiceId(serviceId);
    setEditServiceFee(currentFee || 10000);
  };

  const handleSaveServiceFee = () => {
    if (editingServiceId) {
      const pPerInr = formData.pointsPerInr || 4;
      updateService(editingServiceId, {
        typicalFee: editServiceFee,
        pointsReward: Math.round(editServiceFee * 0.1 * pPerInr),
      });
      setEditingServiceId(null);
    }
  };

  const handleSelectSimService = (serviceId: string) => {
    setSimSelectedServiceId(serviceId);
    const srv = services.find((s) => s.id === serviceId);
    if (srv && srv.typicalFee) {
      setSimCaseAmount(srv.typicalFee);
    }
  };

  // Live Case Amount & Tier Commission Simulator Calculation
  const pointsPerInr = formData.pointsPerInr || 4;
  const tierCommissionRate = simTier === 'platinum' ? 15 : simTier === 'gold' ? 12 : 10;
  const enrollmentPointsPerCase = simTier === 'platinum' ? 150 : simTier === 'gold' ? 125 : 100;
  const profBoost = formData.professionMultipliers[simProfession] || 1.0;

  // Case fee amounts
  const perCaseFee = simCaseAmount || 10000;
  const totalReceivedFromClient = perCaseFee * simCases;

  // Partner commission in INR
  const baseCommissionPerCase = (perCaseFee * tierCommissionRate) / 100;
  const boostedCommissionPerCase = Math.round(baseCommissionPerCase * profBoost);
  const totalCommissionInr = boostedCommissionPerCase * simCases;

  // PrimePoints (1 INR = pointsPerInr PrimePoints)
  const pointsPerCase = Math.round(boostedCommissionPerCase * pointsPerInr);
  const totalCommissionPoints = pointsPerCase * simCases;
  const totalEnrollmentPoints = enrollmentPointsPerCase * simCases;
  const grandTotalPoints = totalCommissionPoints + totalEnrollmentPoints;
  const grandTotalInr = grandTotalPoints / pointsPerInr;

  // Team Leader Override (10% override on commission points)
  const simLeaderOverride = Math.round(totalCommissionPoints * (formData.teamLeaderOverridePercent / 100));
  const simLeaderOverrideInr = simLeaderOverride / pointsPerInr;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins size={28} className="text-[#F5C518]" weight="fill" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--navy-deep)]">
              Reward Points & Rates Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Set point rewards per lead stage, point-to-rupee conversion rates, team leader bonuses, and tier multipliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink-2)] text-xs font-semibold rounded-xl border border-[var(--border)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowClockwise size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white text-xs font-bold font-display rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <FloppyDisk size={18} weight="bold" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-shake">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" weight="fill" />
          <span>Success! Reward settings and point conversion rates have been updated live across the portal.</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-amber-400 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Points Value</span>
            <CurrencyInr size={18} className="text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono-num text-[var(--navy-deep)]">
            {formData.pointsPerInr} Pts = ₹1.00 INR
          </p>
          <p className="text-[11px] text-slate-500 mt-1">1 Point = ₹{(1 / formData.pointsPerInr).toFixed(2)} Cash</p>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Completed Lead Points</span>
            <Trophy size={18} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono-num text-emerald-700">
            +{formData.conversionPoints} Pts
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Equivalent to ₹{formData.conversionPoints / formData.pointsPerInr} INR</p>
        </Card>

        <Card className="p-4 border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Team Leader Bonus</span>
            <UsersThree size={18} className="text-indigo-600" />
          </div>
          <p className="text-xl font-bold font-mono-num text-indigo-700">
            {formData.teamLeaderOverridePercent}% Cut
          </p>
          <p className="text-[11px] text-slate-500 mt-1">+{Math.round(formData.conversionPoints * (formData.teamLeaderOverridePercent / 100))} Pts per completed lead by team</p>
        </Card>

        <Card className="p-4 border-l-4 border-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Payout Option</span>
            <SlidersHorizontal size={18} className="text-blue-600" />
          </div>
          <p className="text-lg font-bold font-display text-[var(--navy-deep)] capitalize">
            {formData.payoutMode === 'points' ? '🎁 Gift Vouchers' : formData.payoutMode === 'cash' ? '💵 Direct Bank Transfer' : '⚡ Both Options'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Min threshold: {formData.minRedemptionPoints} Pts (₹{formData.minRedemptionPoints / formData.pointsPerInr})</p>
        </Card>
      </div>

      {/* Main Grid: Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules & Multipliers (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: STAGE-WISE POINT BOUNTIES */}
          <Card className="p-6 space-y-5 border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Trophy size={22} className="text-[#1B2A72]" weight="fill" />
              <h2 className="font-display font-bold text-lg text-[var(--navy-deep)]">
                Points Earned Per Lead Stage
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  1. Lead Submitted
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.submissionPoints}
                    onChange={(e) => handleChange('submissionPoints', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cash Value: ₹{formData.submissionPoints / formData.pointsPerInr}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  2. Customer Enrolled
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.enrollmentPoints}
                    onChange={(e) => handleChange('enrollmentPoints', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cash Value: ₹{formData.enrollmentPoints / formData.pointsPerInr}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  3. Lead Completed
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={formData.conversionPoints}
                    onChange={(e) => handleChange('conversionPoints', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cash Value: ₹{formData.conversionPoints / formData.pointsPerInr}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                Team Leader Bonus (%)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative max-w-xs flex-1">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.teamLeaderOverridePercent}
                    onChange={(e) => handleChange('teamLeaderOverridePercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">%</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  =&nbsp;
                  <span className="font-bold font-mono-num text-indigo-700">
                    +{Math.round(formData.conversionPoints * (formData.teamLeaderOverridePercent / 100))} Pts
                  </span>
                  &nbsp;(₹{Math.round(formData.conversionPoints * (formData.teamLeaderOverridePercent / 100)) / formData.pointsPerInr}) paid to Team Leader for each lead completed by their team.
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION B: CURRENCY & SETTLEMENT PARAMETERS */}
          <Card className="p-6 space-y-5 border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <CurrencyInr size={22} className="text-emerald-600" weight="bold" />
              <h2 className="font-display font-bold text-lg text-[var(--navy-deep)]">
                Points Value & Claim Limits
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Points per ₹1
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={formData.pointsPerInr}
                    onChange={(e) => handleChange('pointsPerInr', Math.max(1, parseInt(e.target.value) || 4))}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts / ₹1</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Higher number means more points needed for ₹1.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Payout Type
                </label>
                <select
                  value={formData.payoutMode}
                  onChange={(e) => handleChange('payoutMode', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                >
                  <option value="points">🎁 Gift Vouchers</option>
                  <option value="cash">💵 Direct Bank Transfer</option>
                  <option value="hybrid">⚡ Both Options (Partner Choice)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Payout options shown to partners.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Minimum Claim Amount (Points)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={formData.minRedemptionPoints}
                    onChange={(e) => handleChange('minRedemptionPoints', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Minimum balance to request voucher (₹{formData.minRedemptionPoints / formData.pointsPerInr})</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1">
                  Maximum Daily Claim Limit (Points)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formData.maxDailyRedemptionPoints}
                    onChange={(e) => handleChange('maxDailyRedemptionPoints', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono-num font-bold bg-white border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[#1B2A72] outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">Pts / Day</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Maximum daily claim per partner (₹{formData.maxDailyRedemptionPoints / formData.pointsPerInr})</p>
              </div>
            </div>
          </Card>

          {/* SECTION C: TIER & PROFESSION BOOST MULTIPLIERS */}
          <Card className="p-6 space-y-5 border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Percent size={22} className="text-amber-500" weight="bold" />
              <h2 className="font-display font-bold text-lg text-[var(--navy-deep)]">
                Tier & Profession Bonus Rates
              </h2>
            </div>

            {/* Tier Rates & Thresholds */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Partner Reward Tiers & Commission Rates
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Commissions credited in PrimePoints
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Silver Tier */}
                <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                      Silver Tier
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      0 – 19,999 Pts
                    </span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Case Completion
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-extrabold text-2xl text-[#1B2A72]">10%</span>
                      <span className="text-[11px] text-slate-500 font-medium">of Case Amount</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-slate-500 font-medium">User Enrollment:</span>
                    <span className="font-mono-num font-bold text-slate-900">+100 Pts</span>
                  </div>
                </div>

                {/* Gold Tier */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Gold Tier
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-white/90 border border-amber-200 px-2 py-0.5 rounded-md">
                      20,000 – 49,999 Pts
                    </span>
                  </div>

                  <div className="p-2.5 bg-white/90 border border-amber-200/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                      Case Completion
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-extrabold text-2xl text-amber-700">12%</span>
                      <span className="text-[11px] text-amber-800 font-medium">of Case Amount</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-amber-800 font-medium">User Enrollment:</span>
                    <span className="font-mono-num font-bold text-amber-950">+125 Pts</span>
                  </div>
                </div>

                {/* Platinum Tier */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                      Platinum Tier
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-800 bg-white/90 border border-indigo-200 px-2 py-0.5 rounded-md">
                      50,000+ Pts
                    </span>
                  </div>

                  <div className="p-2.5 bg-white/90 border border-indigo-200/80 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Case Completion
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-extrabold text-2xl text-indigo-700">15%</span>
                      <span className="text-[11px] text-indigo-800 font-medium">of Case Amount</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="text-indigo-800 font-medium">User Enrollment:</span>
                    <span className="font-mono-num font-bold text-indigo-950">+150 Pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profession Multipliers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profession Commission Boosters
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Applied as bonus multiplier on commission
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">DSA Agent</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      formData.professionMultipliers.dsa > 1.0 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
                    }`}>
                      {formData.professionMultipliers.dsa > 1.0
                        ? `+${Math.round((formData.professionMultipliers.dsa - 1) * 100)}%`
                        : `${formData.professionMultipliers.dsa}x`}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.05}
                      min={1.0}
                      max={2.5}
                      value={formData.professionMultipliers.dsa}
                      onChange={(e) => handleNestedChange('professionMultipliers', 'dsa', parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1B2A72]"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">x</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">CA</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      formData.professionMultipliers.ca > 1.0 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
                    }`}>
                      {formData.professionMultipliers.ca > 1.0
                        ? `+${Math.round((formData.professionMultipliers.ca - 1) * 100)}%`
                        : `${formData.professionMultipliers.ca}x`}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.05}
                      min={1.0}
                      max={2.5}
                      value={formData.professionMultipliers.ca}
                      onChange={(e) => handleNestedChange('professionMultipliers', 'ca', parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1B2A72]"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">x</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Loan Consultant</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      formData.professionMultipliers.loan_consultant > 1.0 ? 'text-indigo-700 bg-indigo-50' : 'text-slate-400'
                    }`}>
                      {formData.professionMultipliers.loan_consultant > 1.0
                        ? `+${Math.round((formData.professionMultipliers.loan_consultant - 1) * 100)}%`
                        : `${formData.professionMultipliers.loan_consultant}x`}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.05}
                      min={1.0}
                      max={2.5}
                      value={formData.professionMultipliers.loan_consultant}
                      onChange={(e) => handleNestedChange('professionMultipliers', 'loan_consultant', parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1B2A72]"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">x</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">General Partner</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      formData.professionMultipliers.other > 1.0 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
                    }`}>
                      {formData.professionMultipliers.other > 1.0
                        ? `+${Math.round((formData.professionMultipliers.other - 1) * 100)}%`
                        : `${formData.professionMultipliers.other}x`}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.05}
                      min={1.0}
                      max={2.5}
                      value={formData.professionMultipliers.other}
                      onChange={(e) => handleNestedChange('professionMultipliers', 'other', parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1B2A72]"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400">x</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION D: SERVICE PRICING & TIER COMMISSION MATRIX */}
          <Card className="p-6 space-y-4 border border-[var(--border)] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#1B2A72] flex items-center justify-center shrink-0">
                  <Wrench size={18} weight="fill" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-[var(--navy-deep)] leading-tight">
                    Service Pricing & Commission Structure
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Partners receive PrimePoints based on the actual Case Amount received upon case completion.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {services.length} Active Services
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Service Offering</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Standard Fee</th>
                    <th className="p-3 text-right">Silver (10%)</th>
                    <th className="p-3 text-right">Gold (12%)</th>
                    <th className="p-3 text-right">Platinum (15%)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {services.map((srv) => {
                    const fee = srv.typicalFee || 5000;
                    const silverInr = fee * 0.1;
                    const goldInr = fee * 0.12;
                    const platInr = fee * 0.15;
                    const silverPts = Math.round(silverInr * pointsPerInr);
                    const goldPts = Math.round(goldInr * pointsPerInr);
                    const platPts = Math.round(platInr * pointsPerInr);

                    return (
                      <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{srv.title}</td>
                        <td className="p-3 text-slate-500">{srv.category}</td>
                        <td className="p-3 text-right font-mono-num font-bold text-slate-900">
                          ₹{fee.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono-num">
                          <span className="text-slate-900 font-bold">₹{silverInr.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-slate-500 block">+{silverPts.toLocaleString()} Pts</span>
                        </td>
                        <td className="p-3 text-right font-mono-num">
                          <span className="text-amber-900 font-bold">₹{goldInr.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-amber-700 block">+{goldPts.toLocaleString()} Pts</span>
                        </td>
                        <td className="p-3 text-right font-mono-num">
                          <span className="text-indigo-900 font-bold">₹{platInr.toLocaleString('en-IN')}</span>
                          <span className="text-[11px] text-indigo-700 block">+{platPts.toLocaleString()} Pts</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={srv.isActive ? 'green' : 'gray'}>
                            {srv.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEditService(srv.id, fee)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PencilSimple size={14} />
                            <span>Edit Fee</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Earnings Simulator Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-5 border-2 border-[#1B2A72]/20 bg-gradient-to-b from-[#0F1A4E] to-[#121F5E] text-white shadow-xl sticky top-20 rounded-2xl">
            <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#F5C518]">
                <Calculator size={20} weight="fill" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white leading-tight">
                  Earnings Calculator
                </h2>
                <p className="text-[11px] text-slate-300">
                  Simulate partner earnings based on client case fees received.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Partner Tier */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Partner Tier & Commission
                </label>
                <select
                  value={simTier}
                  onChange={(e: any) => setSimTier(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="silver">Silver Tier (10% Case Commission • 100 Pts Enrollment)</option>
                  <option value="gold">Gold Tier (12% Case Commission • 125 Pts Enrollment)</option>
                  <option value="platinum">Platinum Tier (15% Case Commission • 150 Pts Enrollment)</option>
                </select>
              </div>

              {/* Partner Profession */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Partner Profession
                </label>
                <select
                  value={simProfession}
                  onChange={(e: any) => setSimProfession(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="ca">Chartered Accountant (CA) ({formData.professionMultipliers.ca}x)</option>
                  <option value="dsa">Direct Selling Agent (DSA) ({formData.professionMultipliers.dsa}x)</option>
                  <option value="loan_consultant">Loan Consultant ({formData.professionMultipliers.loan_consultant}x)</option>
                  <option value="other">General Referral Partner ({formData.professionMultipliers.other}x)</option>
                </select>
              </div>

              {/* Service Offering */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Service Offering
                </label>
                <select
                  value={simSelectedServiceId}
                  onChange={(e) => handleSelectSimService(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} (₹{(s.typicalFee || 5000).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Amount Received per Case */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Amount Received per Case (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={simCaseAmount}
                    onChange={(e) => setSimCaseAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-7 pr-3 py-2 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-mono-num font-bold text-sm outline-none focus:border-[#F5C518]"
                  />
                </div>
              </div>

              {/* Number of Cases */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    Completed Cases
                  </label>
                  <span className="font-mono-num font-bold text-[#F5C518] text-sm">{simCases} Cases</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={simCases}
                  onChange={(e) => setSimCases(parseInt(e.target.value) || 1)}
                  className="w-full accent-[#F5C518] cursor-pointer"
                />
              </div>

              {/* Simulation Output Breakdown */}
              <div className="p-4 bg-white/10 border border-white/15 rounded-xl space-y-2.5 pt-3.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Total Fees Received:</span>
                  <span className="font-mono-num font-bold text-white">
                    ₹{totalReceivedFromClient.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Case Commission ({tierCommissionRate}%):</span>
                  <span className="font-mono-num font-bold text-emerald-400">
                    ₹{totalCommissionInr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Enrollment Bounty ({enrollmentPointsPerCase} Pts/case):</span>
                  <span className="font-mono-num font-bold text-indigo-300">
                    +{totalEnrollmentPoints.toLocaleString()} Pts
                  </span>
                </div>

                <div className="border-t border-white/15 pt-3 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-200 font-bold">Total PrimePoints:</span>
                    <span className="text-xl font-bold font-mono-num text-[#F5C518]">
                      {grandTotalPoints.toLocaleString()} Pts
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-200 font-bold">Total Cash Value:</span>
                    <span className="text-lg font-bold font-mono-num text-emerald-400">
                      ₹{grandTotalInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[11px] text-slate-300">
                    <span>TL Override Cut ({formData.teamLeaderOverridePercent}%):</span>
                    <span className="font-mono-num font-bold text-indigo-300">
                      +{simLeaderOverride.toLocaleString()} Pts (₹{simLeaderOverrideInr.toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Standard Service Fee Modal */}
      <Modal
        isOpen={Boolean(editingServiceId)}
        onClose={() => setEditingServiceId(null)}
        title="Edit Standard Service Fee"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Set the typical fee charged for this service. Partner PrimePoints commission will automatically calculate as 10% (Silver), 12% (Gold), or 15% (Platinum) of this fee.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Standard Service Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={500}
                step={500}
                value={editServiceFee}
                onChange={(e) => setEditServiceFee(parseInt(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2.5 text-sm font-mono-num font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B2A72] outline-none"
              />
            </div>

            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <p className="font-bold text-slate-700">Commission Payout Preview:</p>
              <div className="flex justify-between text-slate-600">
                <span>Silver Tier (10%):</span>
                <strong className="text-slate-900">₹{(editServiceFee * 0.1).toLocaleString('en-IN')} ({(editServiceFee * 0.1 * pointsPerInr).toLocaleString()} Pts)</strong>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Gold Tier (12%):</span>
                <strong className="text-amber-950">₹{(editServiceFee * 0.12).toLocaleString('en-IN')} ({(editServiceFee * 0.12 * pointsPerInr).toLocaleString()} Pts)</strong>
              </div>
              <div className="flex justify-between text-indigo-800">
                <span>Platinum Tier (15%):</span>
                <strong className="text-indigo-950">₹{(editServiceFee * 0.15).toLocaleString('en-IN')} ({(editServiceFee * 0.15 * pointsPerInr).toLocaleString()} Pts)</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setEditingServiceId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveServiceFee}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1B2A72] hover:bg-[#0F1A4E] rounded-xl shadow-sm cursor-pointer"
            >
              Update Service Fee
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
