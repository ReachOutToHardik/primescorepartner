'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Coins, Warning, Calculator } from '@phosphor-icons/react';
import { useAdminStore } from '@/lib/admin-store';
import { calculateTier, getCaseCommissionRate } from '@/lib/store';
import { Button } from '@/components/ui/Button';

interface CompleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralId: string;
  customerName: string;
  partnerId: string;
  initialServiceAmount?: number;
}

export const CompleteCaseModal: React.FC<CompleteCaseModalProps> = ({
  isOpen,
  onClose,
  referralId,
  customerName,
  partnerId,
  initialServiceAmount = 5000,
}) => {
  const partners = useAdminStore((state) => state.partners);
  const rewardConfig = useAdminStore((state) => state.rewardConfig);

  const targetPartner = partners.find((p) => p.id === partnerId);
  const partnerTier = calculateTier(targetPartner?.primePoints || 0);
  const commissionRatePct = getCaseCommissionRate(partnerTier);

  // Map partner profession to multiplier key
  const getProfKey = (prof?: string): 'dsa' | 'ca' | 'loan_consultant' | 'other' => {
    if (!prof) return 'other';
    const p = prof.toLowerCase();
    if (p.includes('dsa') || p.includes('direct selling')) return 'dsa';
    if (p.includes('ca') || p.includes('chartered')) return 'ca';
    if (p.includes('loan')) return 'loan_consultant';
    return 'other';
  };

  const profKey = getProfKey(targetPartner?.profession);
  const profMultiplier = rewardConfig?.professionMultipliers?.[profKey] ?? 1.0;
  const effectiveCommissionRatePct = Number((commissionRatePct * profMultiplier).toFixed(2));

  const [serviceAmount, setServiceAmount] = useState<number | ''>(initialServiceAmount || 5000);
  const [manualOverridePoints, setManualOverridePoints] = useState<number | ''>('');
  const [note, setNote] = useState('Case completed successfully. Commission credited.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Computed calculated points: 1 INR commission = 4 PrimePoints (scaled by profession booster)
  const numAmount = typeof serviceAmount === 'number' ? serviceAmount : 0;
  const commissionInr = Math.round(numAmount * (effectiveCommissionRatePct / 100));
  const pointsPerInr = rewardConfig?.pointsPerInr ?? 4;
  const autoCalculatedPoints = commissionInr * pointsPerInr;
  const finalPointsToCredit = typeof manualOverridePoints === 'number' ? manualOverridePoints : autoCalculatedPoints;

  useEffect(() => {
    if (initialServiceAmount) {
      setServiceAmount(initialServiceAmount);
    }
  }, [initialServiceAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (finalPointsToCredit < 0) {
      setErrorMsg('Points cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { supabase } = await import('@/lib/supabase');
      const now = new Date().toISOString();

      // 1. Update referral status to completed with service_amount & points_earned
      const { error: refErr } = await supabase
        .from('referrals')
        .update({
          status: 'completed',
          current_stage: 'completed',
          service_amount: numAmount,
          points_earned: finalPointsToCredit,
          partner_points_earned: finalPointsToCredit,
          updated_at: now,
        })
        .eq('id', referralId);

      if (refErr) {
        throw new Error(refErr.message || 'Failed to update referral in database.');
      }

      // 2. Credit partner prime_points in profiles table (fetch fresh balance to avoid stale state)
      if (targetPartner) {
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('prime_points, lifetime_points_earned')
          .eq('id', partnerId)
          .single();
        const currentPts = freshProfile?.prime_points ?? (targetPartner.primePoints || 0);
        const currentLifetime = freshProfile?.lifetime_points_earned ?? 0;
        const updatedPoints = currentPts + finalPointsToCredit;
        await supabase
          .from('profiles')
          .update({
            prime_points: updatedPoints,
            lifetime_points_earned: currentLifetime + finalPointsToCredit,
          })
          .eq('id', partnerId);

        // Log point transaction for partner
        try {
          await supabase.from('point_transactions').insert({
            partner_id: partnerId,
            referral_id: referralId,
            points_change: finalPointsToCredit,
            amount: finalPointsToCredit,
            transaction_type: 'referral_earned',
            title: `Earned ${finalPointsToCredit} Pts (${commissionRatePct}% of ₹${numAmount.toLocaleString('en-IN')}) for completed case (${customerName})`,
            description: `Earned ${finalPointsToCredit} Pts (${commissionRatePct}% of ₹${numAmount.toLocaleString('en-IN')}) for completed case (${customerName})`,
            balance_after: updatedPoints,
            created_at: now,
          });
        } catch (tErr) {
          console.warn('Transaction log note:', tErr);
        }

        // 3. Team Leader Override (10% override if partner belongs to a team)
        if (targetPartner.referredByLeaderId) {
          const leader = partners.find(
            (p) => p.id === targetPartner.referredByLeaderId || (p.teamCode && p.teamCode === targetPartner.referredByLeaderId)
          );

          if (leader) {
            const overridePts = Math.round(finalPointsToCredit * 0.1); // 10% override
            if (overridePts > 0) {
              // Fetch leader's fresh balance from DB (avoid stale Zustand state) — Fix #7
              const { data: leaderProfile } = await supabase
                .from('profiles')
                .select('prime_points, lifetime_points_earned')
                .eq('id', leader.id)
                .single();
              const leaderCurrentPts = leaderProfile?.prime_points ?? (leader.primePoints || 0);
              const leaderCurrentLifetime = leaderProfile?.lifetime_points_earned ?? 0;
              const updatedLeaderPts = leaderCurrentPts + overridePts;

              await supabase
                .from('profiles')
                .update({
                  prime_points: updatedLeaderPts,
                  lifetime_points_earned: leaderCurrentLifetime + overridePts,
                })
                .eq('id', leader.id);

              try {
                await supabase.from('point_transactions').insert({
                  partner_id: leader.id,
                  referral_id: referralId,
                  points_change: overridePts,
                  amount: overridePts,
                  transaction_type: 'team_override',
                  title: `Team Leader 10% override (+${overridePts} Pts) on ${targetPartner.name}'s completed case`,
                  description: `Team Leader 10% override (+${overridePts} Pts) on ${targetPartner.name}'s completed case`,
                  balance_after: updatedLeaderPts,
                  created_at: now,
                });
              } catch (oErr) {
                console.warn('Leader override log note:', oErr);
              }
            }
          }
        }
      }

      // 4. Update Admin Store local state
      useAdminStore.setState((state) => ({
        partners: state.partners.map((p) =>
          p.id === partnerId
            ? { ...p, primePoints: (p.primePoints || 0) + finalPointsToCredit }
            : p
        ),
        referrals: state.referrals.map((r) =>
          r.id === referralId
            ? { ...r, status: 'completed', pointsEarned: finalPointsToCredit }
            : r
        ),
      }));

      setSuccessMsg(`Case marked Completed! Credited ${finalPointsToCredit} PrimePoints to partner.`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-emerald-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Mark Case Completed
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Closing referral for <strong className="text-slate-800">{customerName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <Warning size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Service Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Service / Case Amount (₹)
            </label>
            <input
              type="number"
              value={serviceAmount}
              onChange={(e) => setServiceAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:bg-white font-medium"
              required
            />
          </div>

          {/* Live Calculation Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calculator size={16} className="text-emerald-600" /> Base Tier Commission:
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-mono text-[11px]">
                {partnerTier} ({commissionRatePct}%)
              </span>
            </div>

            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="text-slate-700">
                Profession Booster ({targetPartner?.profession || 'General Partner'}):
              </span>
              <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] ${
                profMultiplier > 1.0 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-200 text-slate-700'
              }`}>
                {profMultiplier}x {profMultiplier > 1.0 ? `(+${Math.round((profMultiplier - 1) * 100)}%)` : ''}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-slate-700">
              <span>Effective Commission:</span>
              <span className="font-mono font-bold text-slate-900">
                {effectiveCommissionRatePct}% = ₹{commissionInr.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-slate-700">
              <span>PrimePoints Credited (₹1 = {pointsPerInr} Pts):</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                +{autoCalculatedPoints.toLocaleString('en-IN')} Pts
              </span>
            </div>
          </div>

          {/* Manual Points Override Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Manual Points Override (Optional)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Leave blank for auto-calc</span>
            </div>
            <div className="relative">
              <Coins size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                value={manualOverridePoints}
                onChange={(e) => setManualOverridePoints(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`Default: ${autoCalculatedPoints} Pts`}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:border-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle size={16} weight="bold" />
              <span>{isSubmitting ? 'Completing Case...' : `Complete Case & Award ${finalPointsToCredit} Pts`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
