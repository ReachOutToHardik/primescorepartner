'use client';

import React, { useState } from 'react';
import { X, UserPlus, Coins, CheckCircle, Warning } from '@phosphor-icons/react';
import { useAdminStore } from '@/lib/admin-store';
import { calculateTier, getReferredUserEnrollmentPoints, getCaseCommissionRate } from '@/lib/store';
import { Button } from '@/components/ui/Button';

interface ManualAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPartnerId?: string;
}

export const SERVICE_OPTIONS = [
  'Bureau Report Rectification',
  'Credit Score Repair',
  'Inquiry Deletion & Dispute',
  'Late Payment Removal',
  'Loan Settlement & NOC',
  'Credit Card Account Closure',
];

export const ManualAddLeadModal: React.FC<ManualAddLeadModalProps> = ({
  isOpen,
  onClose,
  preselectedPartnerId,
}) => {
  const partners = useAdminStore((state) => state.partners);

  const [selectedPartnerId, setSelectedPartnerId] = useState(preselectedPartnerId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [serviceAmount, setServiceAmount] = useState<number | ''>(5000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Selected partner details
  const targetPartner = partners.find((p) => p.id === selectedPartnerId);
  const partnerTier = calculateTier(targetPartner?.primePoints || 0);
  const enrollmentPoints = getReferredUserEnrollmentPoints(partnerTier);
  const commissionPct = getCaseCommissionRate(partnerTier);

  const numAmount = typeof serviceAmount === 'number' ? serviceAmount : 0;
  const projectedCompletionPoints = Math.round(numAmount * (commissionPct / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartnerId) {
      setErrorMsg('Please select a partner to assign this client.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Please enter customer full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit customer phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { supabase } = await import('@/lib/supabase');

      const partnerCode = targetPartner?.userReferralCode || targetPartner?.teamCode || 'PRIMESCORE';
      const now = new Date().toISOString();

      // 1. Insert lead into Supabase referrals table
      const { data: newRef, error: refErr } = await supabase
        .from('referrals')
        .insert({
          partner_id: selectedPartnerId,
          user_referral_code: partnerCode,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim().toLowerCase(),
          city: city.trim() || targetPartner?.city || 'India',
          service,
          service_name: service,
          service_amount: numAmount,
          status: 'enrolled',
          current_stage: 'enrolled',
          points_earned: enrollmentPoints,
          partner_points_earned: enrollmentPoints,
          created_at: now,
          updated_at: now,
          status_history: [
            { status: 'submitted', date: now, note: 'Lead manually registered by Admin' },
            { status: 'enrolled', date: now, note: `Enrolled on platform. Awarded ${enrollmentPoints} enrollment pts to partner.` },
          ],
        })
        .select('id')
        .single();

      if (refErr) {
        throw new Error(refErr.message || 'Failed to save referral in database.');
      }

      // 2. Update partner's prime_points in profiles table
      const newPointsBalance = (targetPartner?.primePoints || 0) + enrollmentPoints;
      await supabase
        .from('profiles')
        .update({ prime_points: newPointsBalance })
        .eq('id', selectedPartnerId);

      // 3. Log point transaction
      try {
        await supabase.from('point_transactions').insert({
          partner_id: selectedPartnerId,
          referral_id: newRef?.id,
          points_change: enrollmentPoints,
          amount: enrollmentPoints,
          transaction_type: 'enrolled_earned',
          title: `Referred Client Enrolled: ${customerName.trim()} (+${enrollmentPoints} Pts)`,
          description: `Awarded ${enrollmentPoints} Pts for client ${customerName.trim()} platform enrollment`,
          balance_after: newPointsBalance,
          created_at: now,
        });
      } catch (txErr) {
        console.warn('Point transaction logging note:', txErr);
      }

      // 4. Trigger Welcome HTML email to customer
      try {
        await fetch('/api/send-lead-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            service,
            partnerName: targetPartner?.name || 'Financial Partner',
          }),
        });
      } catch (emailErr) {
        console.warn('Welcome email trigger note:', emailErr);
      }

      // 5. Update Admin Store local state
      useAdminStore.setState((state) => ({
        partners: state.partners.map((p) =>
          p.id === selectedPartnerId ? { ...p, primePoints: newPointsBalance } : p
        ),
        referrals: [
          {
            id: newRef?.id || `REF-${Date.now()}`,
            partnerId: selectedPartnerId,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            city: city.trim() || targetPartner?.city || 'India',
            service,
            status: 'enrolled',
            createdAt: now,
            updatedAt: now,
            pointsEarned: enrollmentPoints,
            statusHistory: [
              { status: 'submitted', date: now, note: 'Lead manually registered by Admin' },
              { status: 'enrolled', date: now, note: `Enrolled on platform. Awarded ${enrollmentPoints} enrollment pts to partner.` },
            ],
          },
          ...state.referrals,
        ],
      }));

      setSuccessMsg(`Client ${customerName.trim()} registered successfully! Awarded ${enrollmentPoints} PrimePoints to ${targetPartner?.name}.`);
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to manually register lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B2A72] text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus size={20} weight="bold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Manual Client Lead Registration
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Enroll a referred client under a partner and award enrollment points.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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

          {/* Partner Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Partner
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium text-slate-800"
              required
            >
              <option value="">-- Choose Partner --</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email}) — {calculateTier(p.primePoints || 0)} Tier
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Mobile Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Client Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ramesh@gmail.com"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service Type
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Service Amount (₹)
              </label>
              <input
                type="number"
                value={serviceAmount}
                onChange={(e) => setServiceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="5000"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#1B2A72] focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Tier Points Live Summary Card */}
          {targetPartner && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Coins size={16} className="text-amber-600" /> Reward Tier Calculation:
                </span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md font-mono text-[11px]">
                  {partnerTier} Tier
                </span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Immediate Enrollment Points:</span>
                <span className="font-mono font-bold text-emerald-700">+{enrollmentPoints} PrimePoints</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Case Completion Commission Rate ({commissionPct}%):</span>
                <span className="font-mono font-bold text-slate-900">~{projectedCompletionPoints} Pts on Case Completion</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Registering Client...' : 'Register Client & Award Points'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
