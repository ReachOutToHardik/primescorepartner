'use client';

import React, { useState } from 'react';
import { usePartnerStore, RedemptionRecord } from '@/lib/store';
import { GIFT_CARDS } from '@/lib/mock-data';
import {
  Gift,
  Coins,
  CheckCircle,
  X,
  Copy,
  Clock,
  ShieldCheck,
  Sparkle,
  LockKey,
  ShoppingBag,
  ArrowRight,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/Card';
import { BrandLogo } from '@/components/ui/BrandLogo';

import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

export default function RedeemPage() {
  const { partner, totalPoints, redemptions, redeemGiftCard } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);

  // Selected Card for Redemption Modal
  const [selectedBrand, setSelectedBrand] = useState<typeof GIFT_CARDS[0] | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<number>(500);

  // OTP Modal Flow State
  const [otpStep, setOtpStep] = useState<'confirm' | 'otp' | 'success'>('confirm');
  const [otpValue, setOtpValue] = useState('');
  const [internalOtp, setInternalOtp] = useState('');
  const [generatedVoucherCode, setGeneratedVoucherCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Redemptions from DB
  const [liveRedemptions, setLiveRedemptions] = useState<{
    id: string;
    brand_name: string;
    denomination_inr: number;
    points_burned: number;
    voucher_code: string;
    status: 'pending' | 'fulfilled' | 'rejected';
    created_at: string;
  }[]>([]);

  const fetchLiveRedemptions = async () => {
    if (!partner?.id) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('redemptions')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });
      if (data) setLiveRedemptions(data);
    } catch (err) {
      console.error('Fetch live redemptions error:', err);
    }
  };

  React.useEffect(() => {
    fetchLiveRedemptions();
  }, [partner?.id, activeTab]);

  const handleOpenRedeemModal = (card: typeof GIFT_CARDS[0], denom: number) => {
    if (partner?.status !== 'kyc_approved') {
      setKycModalOpen(true);
      return;
    }
    const pointsRequired = denom * 4;
    if (totalPoints < pointsRequired) {
      alert(`Insufficient PrimePoints! You need ${pointsRequired} points for ₹${denom} voucher.`);
      return;
    }
    setSelectedBrand(card);
    setSelectedDenom(denom);
    setOtpStep('confirm');
    setOtpValue('');
    setErrorMsg('');
  };

  const handleRequestOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setInternalOtp(otp);
    setOtpStep('otp');
    console.info(`[DEV] OTP for redemption: ${otp}`);
  };

  const handleVerifyAndRedeem = async () => {
    if (!selectedBrand || !partner?.id) return;
    if (otpValue.trim() !== internalOtp) {
      setErrorMsg('Invalid OTP. Please check and try again.');
      return;
    }

    setIsRedeeming(true);
    setErrorMsg('');

    const pointsCost = selectedDenom * 4;

    try {
      const { supabase } = await import('@/lib/supabase');

      // Insert redemption record with status 'pending' and NO voucher code yet
      const insertPayload: Record<string, any> = {
        partner_id: partner.id,
        brand_name: selectedBrand.brand,
        denomination_inr: selectedDenom,
        points_burned: pointsCost,
        points_deducted: pointsCost,
        voucher_code: '', // Left empty until Admin HQ approves/fulfills
        status: 'pending',
      };

      const { error: insertError } = await supabase.from('redemptions').insert([insertPayload]);

      if (insertError && insertError.code === 'PGRST204') {
        delete insertPayload.points_deducted;
        await supabase.from('redemptions').insert([insertPayload]);
      }

      // Deduct points from profile in Supabase
      const newBal = Math.max(0, totalPoints - pointsCost);
      await supabase
        .from('profiles')
        .update({ prime_points: newBal })
        .eq('id', partner.id);

      // Record point_transactions entry for Instant Activity Ledger
      try {
        await supabase.from('point_transactions').insert([
          {
            partner_id: partner.id,
            transaction_type: 'voucher_redeemed',
            points_change: -pointsCost,
            balance_after: newBal,
            title: `Voucher Request Submitted: ${selectedBrand.brand} (₹${selectedDenom})`,
            reference_id: `RDM-PENDING-${Date.now()}`,
          },
        ]);
      } catch (txErr) {
        console.warn('Voucher transaction log warning:', txErr);
      }

      // Update local state instantly
      redeemGiftCard(selectedBrand.brand, selectedDenom, pointsCost);
      setGeneratedVoucherCode('');
      setOtpStep('success');
      fetchLiveRedemptions();
    } catch (err) {
      console.error('Redemption error:', err);
      setErrorMsg('Redemption failed. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero Header Banner */}
      <div className="bg-[#0F1A4E] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
            <Gift size={16} className="text-[#F5C518]" weight="fill" />
            <span>Instant E-Voucher Exchange</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Redeem Gift Cards & Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Convert your PrimePoints instantly into e-gift vouchers from India&apos;s top shopping & travel brands.
          </p>
        </div>

        {/* Available Points Pill */}
        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shadow-lg">
          <Coins size={24} className="text-[#F5C518]" weight="fill" />
          <div>
            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono-num">
              Points Available
            </div>
            <div className="font-mono-num font-bold text-lg text-white leading-none">
              {totalPoints.toLocaleString()} Pts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Catalog vs History */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 font-display font-bold text-xs rounded-full transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#1B2A72] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 font-semibold'
          }`}
        >
          Gift Card Catalog
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-display font-bold text-xs rounded-full transition-all ${
            activeTab === 'history'
              ? 'bg-[#1B2A72] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 font-semibold'
          }`}
        >
          My Voucher History ({redemptions.length})
        </button>
      </div>

      {/* CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GIFT_CARDS.map((card) => {
            return (
              <Card
                key={card.id}
                variant="elevated"
                className="p-6 flex flex-col justify-between space-y-4 hover:border-[#1B2A72] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-12 flex items-center justify-start">
                      <BrandLogo id={card.id} brand={card.brand} className="h-11 max-w-[160px] w-auto" />
                    </div>
                    <span className="text-[10px] font-mono-num uppercase font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      Instant Delivery
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      {card.brand} E-Gift Card
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Valid for all online & app purchases across India.
                    </p>
                  </div>

                  {/* Denomination Buttons Grid */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono-num">
                      Select Value (₹1 = 4 Pts)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {card.denominations.map((denom) => {
                        const ptsCost = denom * 4;
                        const canAfford = totalPoints >= ptsCost;

                        return (
                          <button
                            key={denom}
                            onClick={() => handleOpenRedeemModal(card, denom)}
                            disabled={!canAfford}
                            className={`p-2.5 rounded-xl text-xs font-mono-num font-bold transition-all text-center border ${
                              canAfford
                                ? 'border-slate-200 bg-slate-50 hover:bg-[#1B2A72] hover:text-white hover:border-[#1B2A72] text-slate-900 shadow-2xs'
                                : 'border-slate-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div>₹{denom}</div>
                            <div className="text-[10px] font-normal opacity-80">
                              {ptsCost.toLocaleString()} Pts
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>0% Convenience Fee</span>
                  <span className="text-emerald-600 font-bold">&bull; Stock Available</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* VOUCHER HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Redeemed Voucher History
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Voucher codes are securely generated & revealed once approved by Admin.
              </p>
            </div>
            <span className="self-start sm:self-center px-3 py-1 bg-slate-100 text-slate-700 font-mono-num text-xs font-bold rounded-full shrink-0">
              {liveRedemptions.length > 0 ? liveRedemptions.length : redemptions.length} Claims
            </span>
          </div>

          {(liveRedemptions.length > 0 ? liveRedemptions : redemptions).length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Gift size={36} className="mx-auto text-slate-400" />
              <p className="font-semibold text-slate-800">No gift cards redeemed yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a gift card from the catalog above to claim e-vouchers with your PrimePoints!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(liveRedemptions.length > 0 ? liveRedemptions : redemptions).map((rdmItem: any) => {
                const brand = rdmItem.brand_name || rdmItem.brand;
                const denom = rdmItem.denomination_inr || rdmItem.denomination;
                const pts = rdmItem.points_burned || rdmItem.points || (denom * 4);
                const dateStr = rdmItem.created_at || rdmItem.redeemedAt;
                const status = rdmItem.status || 'pending';
                const vCode = rdmItem.voucher_code || rdmItem.voucherCode || '';

                const isFulfilled = status === 'fulfilled' && Boolean(vCode);
                const isRejected = status === 'rejected';
                const isPending = !isFulfilled && !isRejected;

                return (
                  <div key={rdmItem.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center font-display font-bold text-xl text-amber-700 shrink-0 shadow-2xs">
                        🎁
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display font-bold text-sm text-slate-900">
                            {brand} E-Voucher (₹{denom})
                          </p>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="px-2 sm:px-2.5 py-0.5 bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0" title="Processing">
                              <Clock size={13} className="animate-spin text-amber-700 shrink-0" />
                              <span className="hidden sm:inline">PROCESSING</span>
                            </span>
                          )}
                          {isFulfilled && (
                            <span className="px-2 sm:px-2.5 py-0.5 bg-emerald-100/80 text-emerald-900 border border-emerald-300/80 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0" title="Processed">
                              <CheckCircle size={13} className="text-emerald-700 shrink-0" weight="fill" />
                              <span className="hidden sm:inline">PROCESSED</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 sm:px-2.5 py-0.5 bg-rose-100/80 text-rose-900 border border-rose-300/80 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0" title="Declined & Refunded">
                              <X size={13} className="text-rose-700 shrink-0" weight="bold" />
                              <span className="hidden sm:inline">DECLINED & REFUNDED</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-mono-num text-slate-500">
                          Redeemed for <span className="font-semibold text-slate-700">{pts.toLocaleString()} Pts</span> on {new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Right Action / Code Area (Fully Responsive) */}
                    <div className="w-full md:w-auto shrink-0">
                      {isPending && (
                        <div className="w-full md:w-auto bg-amber-50/80 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                          <Clock size={15} className="text-amber-700 shrink-0" />
                          <span className="leading-snug">Admin verification in progress. Code will be revealed upon approval.</span>
                        </div>
                      )}

                      {isFulfilled && (
                        <div className="w-full md:w-auto flex items-center justify-between gap-3 bg-emerald-50/80 px-3.5 py-2 border border-emerald-200 rounded-xl">
                          <code className="text-xs sm:text-sm font-mono font-bold text-emerald-950 tracking-wider select-all truncate">
                            {vCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(vCode)}
                            className="p-1 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-950 rounded transition-colors shrink-0 cursor-pointer"
                            title="Copy Voucher Code"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <div className="w-full md:w-auto bg-rose-50/80 border border-rose-200/80 px-3.5 py-2 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                          <X size={15} className="text-rose-700 shrink-0" weight="bold" />
                          <span>Request rejected by Admin. +{pts.toLocaleString()} Pts refunded to balance.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REDEMPTION CONFIRMATION & OTP MODAL */}
      {selectedBrand && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedBrand(null)}
        >
          <div
            className="bg-white border border-[var(--border)] rounded-xs shadow-2xl max-w-md w-full p-6 space-y-6 animate-slide-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo id={selectedBrand.id} brand={selectedBrand.brand} className="h-7 w-auto" />
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Redeem {selectedBrand.brand} Voucher
                </h3>
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* STEP 1: CONFIRM SUMMARY */}
            {otpStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-[var(--surface)] p-4 border border-[var(--border)] rounded-xs space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--ink-muted)]">Voucher Denomination:</span>
                    <span className="font-mono-num font-bold text-[var(--ink)]">₹{selectedDenom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--ink-muted)]">PrimePoints Cost:</span>
                    <span className="font-mono-num font-bold text-[#E63329]">
                      -{selectedDenom * 4} Pts
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-[var(--ink-muted)]">Remaining Points Balance:</span>
                    <span className="font-mono-num font-bold text-[#3DAA4B]">
                      {(totalPoints - selectedDenom * 4).toLocaleString()} Pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRequestOTP}
                  className="w-full py-3 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-xs rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LockKey size={16} />
                  <span>Send OTP & Confirm Claim</span>
                </button>
              </div>
            )}

            {/* STEP 2: ENTER OTP */}
            {otpStep === 'otp' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <ShieldCheck size={28} className="mx-auto text-[#1B2A72]" />
                  <p className="font-display font-bold text-sm text-[var(--ink)]">Enter 6-Digit Security OTP</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    A one-time code has been generated for this redemption. Check the browser console (DevTools) for the OTP until SMS is integrated.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-2.5 text-xs bg-[#FDECEA] text-[#E63329] border border-[#E63329] font-semibold rounded-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 text-center font-mono-num font-bold text-2xl tracking-widest bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <p className="text-[11px] text-[var(--ink-subtle)] text-center">
                    Enter the 6-digit code shown in your browser console (F12 → Console)
                  </p>
                </div>

                <button
                  onClick={handleVerifyAndRedeem}
                  disabled={isRedeeming || otpValue.length < 6}
                  className="w-full py-3 bg-[#3DAA4B] hover:bg-[#2e883a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-bold text-xs rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isRedeeming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} weight="fill" />
                      <span>Verify OTP & Claim ₹{selectedDenom} Voucher</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 3: SUCCESS & MANUAL SMS DISPATCH NOTICE */}
            {otpStep === 'success' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle size={32} weight="fill" />
                </div>

                <div>
                  <h4 className="font-display font-bold text-lg text-slate-900">
                    Redemption Request Submitted!
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Your OTP verification is confirmed. Your official {selectedBrand.brand} ₹{selectedDenom} voucher code will be dispatched to your registered mobile number <span className="font-mono text-slate-900 font-bold">({partner?.phone || '****3210'})</span> via SMS.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-left">
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Our team verifies and dispatches manual voucher codes to your phone number within 15 to 30 minutes.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBrand(null)}
                  className="w-full py-3 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC Under Review Alert Modal */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.joinedAt}
      />
    </div>
  );
}
