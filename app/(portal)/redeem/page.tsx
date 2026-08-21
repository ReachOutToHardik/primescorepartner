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
    // Generate a 6-digit OTP for this session
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setInternalOtp(otp);
    setOtpStep('otp');
    // In production this would be sent via SMS/WhatsApp to partner.phone
    // For now show it in the UI as a dev indicator
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
    const voucherCode = `${selectedBrand.brand.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const { supabase } = await import('@/lib/supabase');

      // Insert redemption record with points_burned & points_deducted fail-safe schema matching
      const insertPayload: Record<string, any> = {
        partner_id: partner.id,
        brand_name: selectedBrand.brand,
        denomination_inr: selectedDenom,
        points_burned: pointsCost,
        points_deducted: pointsCost,
        voucher_code: voucherCode,
        status: 'pending',
      };

      const { error: insertError } = await supabase.from('redemptions').insert([insertPayload]);

      if (insertError && insertError.code === 'PGRST204') {
        // If points_deducted column doesn't exist in Supabase schema cache, retry with points_burned
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
            title: `Voucher Claimed: ${selectedBrand.brand} (₹${selectedDenom})`,
            reference_id: voucherCode,
          },
        ]);
      } catch (txErr) {
        console.warn('Voucher transaction log warning:', txErr);
      }

      // Update local state instantly
      redeemGiftCard(selectedBrand.brand, selectedDenom, pointsCost);
      setGeneratedVoucherCode(voucherCode);
      setOtpStep('success');
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
        <div className="bg-white border border-[var(--border)] rounded-xs shadow-xs p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            Redeemed Voucher Codes
          </h2>

          {redemptions.length === 0 ? (
            <div className="p-8 text-center text-[var(--ink-muted)] space-y-2">
              <Gift size={32} className="mx-auto text-[var(--ink-subtle)]" />
              <p className="font-semibold">No gift cards redeemed yet.</p>
              <p className="text-xs">
                Select a gift card from the catalog above to instantly claim e-vouchers with your PrimePoints!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {redemptions.map((rdm) => (
                <div key={rdm.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xs bg-[var(--surface)] flex items-center justify-center font-display font-bold text-lg text-[#1B2A72] border border-[var(--border)] shrink-0">
                      🎁
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-[var(--ink)]">
                        {rdm.brand} E-Voucher (₹{rdm.denomination})
                      </p>
                      <p className="text-xs font-mono-num text-[var(--ink-muted)]">
                        Redeemed for {rdm.points.toLocaleString()} PrimePoints on {new Date(rdm.redeemedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[var(--surface)] p-2 border border-[var(--border)] rounded-xs">
                    <code className="text-xs font-mono-num font-bold text-[#1B2A72] tracking-wider select-all">
                      {rdm.voucherCode}
                    </code>
                    <button
                      onClick={() => handleCopyCode(rdm.voucherCode)}
                      className="p-1.5 hover:bg-white text-[var(--ink-muted)] hover:text-[var(--ink)] rounded transition-colors"
                      title="Copy Code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REDEMPTION CONFIRMATION & OTP MODAL */}
      {selectedBrand && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in"
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
