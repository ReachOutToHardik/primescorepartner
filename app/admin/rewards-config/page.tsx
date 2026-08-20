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
  const [editServicePoints, setEditServicePoints] = useState<number>(500);

  // Simulator State
  const [simProfession, setSimProfession] = useState<'ca' | 'dsa' | 'loan_consultant' | 'other'>('ca');
  const [simTier, setSimTier] = useState<'silver' | 'gold' | 'platinum'>('gold');
  const [simCases, setSimCases] = useState<number>(10);
  const [simSelectedServiceId, setSimSelectedServiceId] = useState<string>(services[0]?.id || '');

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

  const handleOpenEditService = (serviceId: string, currentPts: number) => {
    setEditingServiceId(serviceId);
    setEditServicePoints(currentPts);
  };

  const handleSaveServicePoints = () => {
    if (editingServiceId) {
      updateService(editingServiceId, { pointsReward: editServicePoints });
      setEditingServiceId(null);
    }
  };

  // Simulator calculation
  const targetService = services.find((s) => s.id === simSelectedServiceId) || services[0];
  const baseServicePts = targetService ? targetService.pointsReward : formData.conversionPoints;

  const tierMult = formData.tierMultipliers[simTier] || 1.0;
  const profMult = formData.professionMultipliers[simProfession] || 1.0;

  const perCasePts = Math.round(baseServicePts * tierMult * profMult);
  const totalSimPts = perCasePts * simCases;
  const totalSimInr = totalSimPts / (formData.pointsPerInr || 10);
  const simLeaderOverride = Math.round(totalSimPts * (formData.teamLeaderOverridePercent / 100));
  const simLeaderOverrideInr = simLeaderOverride / (formData.pointsPerInr || 10);

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
                    onChange={(e) => handleChange('pointsPerInr', Math.max(1, parseInt(e.target.value) || 10))}
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

            {/* Tier Multipliers */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tier Multipliers</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-slate-700">Silver Tier</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={3.0}
                      value={formData.tierMultipliers.silver}
                      onChange={(e) => handleNestedChange('tierMultipliers', 'silver', parseFloat(e.target.value) || 1.0)}
                      className="w-full p-1.5 text-xs font-bold bg-white border border-slate-300 rounded-md"
                    />
                    <span className="text-xs font-bold text-slate-500">x</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-900">Gold Tier</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={3.0}
                      value={formData.tierMultipliers.gold}
                      onChange={(e) => handleNestedChange('tierMultipliers', 'gold', parseFloat(e.target.value) || 1.2)}
                      className="w-full p-1.5 text-xs font-bold bg-white border border-amber-300 rounded-md text-amber-900"
                    />
                    <span className="text-xs font-bold text-amber-700">x</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-indigo-900">Platinum Tier</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={3.0}
                      value={formData.tierMultipliers.platinum}
                      onChange={(e) => handleNestedChange('tierMultipliers', 'platinum', parseFloat(e.target.value) || 1.5)}
                      className="w-full p-1.5 text-xs font-bold bg-white border border-indigo-300 rounded-md text-indigo-900"
                    />
                    <span className="text-xs font-bold text-indigo-700">x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profession Multipliers */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Profession Multipliers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">DSA Agent</span>
                  <input
                    type="number"
                    step={0.05}
                    min={1.0}
                    max={2.5}
                    value={formData.professionMultipliers.dsa}
                    onChange={(e) => handleNestedChange('professionMultipliers', 'dsa', parseFloat(e.target.value) || 1.0)}
                    className="w-full p-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Chartered Accountant</span>
                  <input
                    type="number"
                    step={0.05}
                    min={1.0}
                    max={2.5}
                    value={formData.professionMultipliers.ca}
                    onChange={(e) => handleNestedChange('professionMultipliers', 'ca', parseFloat(e.target.value) || 1.15)}
                    className="w-full p-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Loan Consultant</span>
                  <input
                    type="number"
                    step={0.05}
                    min={1.0}
                    max={2.5}
                    value={formData.professionMultipliers.loan_consultant}
                    onChange={(e) => handleNestedChange('professionMultipliers', 'loan_consultant', parseFloat(e.target.value) || 1.1)}
                    className="w-full p-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-600">Other / General</span>
                  <input
                    type="number"
                    step={0.05}
                    min={1.0}
                    max={2.5}
                    value={formData.professionMultipliers.other}
                    onChange={(e) => handleNestedChange('professionMultipliers', 'other', parseFloat(e.target.value) || 1.0)}
                    className="w-full p-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION D: SERVICE REWARD MATRIX */}
          <Card className="p-6 space-y-4 border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Wrench size={22} className="text-indigo-600" weight="fill" />
                <h2 className="font-display font-bold text-lg text-[var(--navy-deep)]">
                  Points Earned By Service
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{services.length} Active Services</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Points Earned</th>
                    <th className="p-3 text-right">Rupee Value</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {services.map((srv) => {
                    const cashVal = srv.pointsReward / (formData.pointsPerInr || 10);
                    return (
                      <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{srv.title}</td>
                        <td className="p-3 text-slate-500">{srv.category}</td>
                        <td className="p-3 text-right font-mono-num font-bold text-emerald-700">
                          +{srv.pointsReward} Pts
                        </td>
                        <td className="p-3 text-right font-mono-num font-bold text-slate-900">
                          ₹{cashVal.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={srv.isActive ? 'green' : 'gray'}>
                            {srv.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenEditService(srv.id, srv.pointsReward)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PencilSimple size={14} />
                            <span>Edit Pts</span>
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
          <Card className="p-6 space-y-5 border-2 border-[#1B2A72]/20 bg-gradient-to-b from-[#0F1A4E] to-[#121F5E] text-white shadow-xl sticky top-20">
            <div className="flex items-center gap-2 border-b border-white/15 pb-3">
              <Calculator size={24} className="text-[#F5C518]" weight="fill" />
              <h2 className="font-display font-bold text-lg text-white">
                Earnings Calculator
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Calculate how much a partner earns based on current reward rules.
            </p>

            <div className="space-y-4 text-xs">
              {/* Partner Profession */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Partner Profession
                </label>
                <select
                  value={simProfession}
                  onChange={(e: any) => setSimProfession(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none"
                >
                  <option value="ca">Chartered Accountant (CA) (1.15x)</option>
                  <option value="dsa">DSA Agent (1.0x)</option>
                  <option value="loan_consultant">Loan Consultant (1.1x)</option>
                  <option value="other">General Referral Partner (1.0x)</option>
                </select>
              </div>

              {/* Partner Tier */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Partner Tier
                </label>
                <select
                  value={simTier}
                  onChange={(e: any) => setSimTier(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none"
                >
                  <option value="silver">Silver Tier ({formData.tierMultipliers.silver}x)</option>
                  <option value="gold">Gold Tier ({formData.tierMultipliers.gold}x)</option>
                  <option value="platinum">Platinum Tier ({formData.tierMultipliers.platinum}x)</option>
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Service Type
                </label>
                <select
                  value={simSelectedServiceId}
                  onChange={(e) => setSimSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 bg-[#1B2A72] border border-white/20 rounded-lg text-white font-semibold outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.pointsReward} Pts)
                    </option>
                  ))}
                </select>
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
                  max={100}
                  value={simCases}
                  onChange={(e) => setSimCases(parseInt(e.target.value) || 1)}
                  className="w-full accent-[#F5C518] cursor-pointer"
                />
              </div>

              {/* Simulation Output Card */}
              <div className="p-4 bg-white/10 border border-white/15 rounded-xl space-y-3 pt-4 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Base Points per Case:</span>
                  <span className="font-mono-num font-bold text-white">+{baseServicePts} Pts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Boosted Pts per Case:</span>
                  <span className="font-mono-num font-bold text-emerald-400">+{perCasePts} Pts</span>
                </div>

                <div className="border-t border-white/15 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-200 font-semibold">Total Points Earned:</span>
                    <span className="text-lg font-bold font-mono-num text-[#F5C518]">
                      {totalSimPts.toLocaleString()} Pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-200 font-semibold">Total Cash Value:</span>
                    <span className="text-xl font-bold font-mono-num text-emerald-400">
                      ₹{totalSimInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[11px] text-slate-300">
                    <span>TL Override Cut ({formData.teamLeaderOverridePercent}%):</span>
                    <span className="font-mono-num font-bold text-indigo-300">
                      +{simLeaderOverride} Pts (₹{simLeaderOverrideInr})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Service Points Modal */}
      <Modal
        isOpen={Boolean(editingServiceId)}
        onClose={() => setEditingServiceId(null)}
        title="Edit Service Point Reward"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Set the base PrimePoints rewarded to partners for successfully completing this service.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Base Points Reward
            </label>
            <div className="relative">
              <input
                type="number"
                min={50}
                step={50}
                value={editServicePoints}
                onChange={(e) => setEditServicePoints(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 text-sm font-mono-num font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1B2A72] outline-none"
              />
              <span className="absolute right-3 top-3 text-xs font-semibold text-slate-400">Pts</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cash Value Equivalent: <strong className="text-emerald-700">₹{(editServicePoints / (formData.pointsPerInr || 10)).toFixed(2)} INR</strong>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setEditingServiceId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveServicePoints}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1B2A72] hover:bg-[#0F1A4E] rounded-xl shadow-sm"
            >
              Update Service Payout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
