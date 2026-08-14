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

export default function RedeemPage() {
  const { totalPoints, redemptions, addRedemption } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');

  // Selected Card for Redemption Modal
  const [selectedBrand, setSelectedBrand] = useState<typeof GIFT_CARDS[0] | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<number>(500);

  // OTP Modal Flow State
  const [otpStep, setOtpStep] = useState<'confirm' | 'otp' | 'success'>('confirm');
  const [otpValue, setOtpValue] = useState('');
  const [generatedVoucherCode, setGeneratedVoucherCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenRedeemModal = (card: typeof GIFT_CARDS[0], denom: number) => {
    const pointsRequired = denom * 10;
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
    setOtpStep('otp');
    setOtpValue('1234'); // Pre-fill mock OTP for seamless testing
  };

  const handleVerifyAndRedeem = () => {
    if (!selectedBrand) return;
    if (otpValue !== '1234' && otpValue.length < 4) {
      setErrorMsg('Please enter valid 4-digit OTP (Try 1234)');
      return;
    }

    const pointsCost = selectedDenom * 10;
    const code = `${selectedBrand.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: RedemptionRecord = {
      id: `RDM-${Date.now().toString().slice(-6)}`,
      brand: selectedBrand.brand,
      denomination: selectedDenom,
      points: pointsCost,
      redeemedAt: new Date().toISOString(),
      voucherCode: code,
    };

    addRedemption(record, pointsCost);
    setGeneratedVoucherCode(code);
    setOtpStep('success');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={26} className="text-[#E63329]" weight="fill" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)]">
              Redeem Gift Cards & Vouchers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Convert your PrimePoints instantly into e-gift vouchers from India&apos;s top shopping & travel brands.
          </p>
        </div>

        {/* Available Points Pill */}
        <div className="bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] text-white px-5 py-2.5 rounded-full border border-white/10 shrink-0 flex items-center gap-3 shadow-md">
          <Coins size={22} className="text-[#F5C518]" weight="fill" />
          <div>
            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono-num">
              Points Available
            </div>
            <div className="font-mono-num font-bold text-base text-white leading-none">
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
                      Select Value (₹1 = 10 Pts)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {card.denominations.map((denom) => {
                        const ptsCost = denom * 10;
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
                    <span className="font-mono-num font-bold text-xs text-[#1B2A72] tracking-wider px-2">
                      {rdm.voucherCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(rdm.voucherCode)}
                      className="px-2.5 py-1 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-[11px] rounded-xs transition-colors flex items-center gap-1"
                    >
                      <Copy size={12} />
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OTP SIMULATION REDEMPTION MODAL */}
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
                      -{selectedDenom * 10} Pts
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2">
                    <span className="text-[var(--ink-muted)]">Remaining Points Balance:</span>
                    <span className="font-mono-num font-bold text-[#3DAA4B]">
                      {(totalPoints - selectedDenom * 10).toLocaleString()} Pts
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
                  <p className="font-display font-bold text-sm text-[var(--ink)]">Enter 4-Digit Security OTP</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Simulated OTP sent to your registered mobile ending in ****3210.
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
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-full py-3 text-center font-mono-num font-bold text-2xl tracking-widest bg-[var(--surface)] border border-[var(--border)] rounded-xs focus:border-[#1B2A72] focus:bg-white text-[var(--ink)]"
                  />
                  <p className="text-[11px] text-[var(--ink-subtle)] text-center">
                    Demo OTP: <strong className="text-[var(--ink)]">1234</strong> (auto-filled)
                  </p>
                </div>

                <button
                  onClick={handleVerifyAndRedeem}
                  className="w-full py-3 bg-[#3DAA4B] hover:bg-[#2e883a] text-white font-display font-bold text-xs rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} weight="fill" />
                  <span>Verify OTP & Claim ₹{selectedDenom} Voucher</span>
                </button>
              </div>
            )}

            {/* STEP 3: SUCCESS & VOUCHER CODE */}
            {otpStep === 'success' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-[#EBF7ED] text-[#3DAA4B] rounded-full flex items-center justify-center mx-auto border border-[#3DAA4B]">
                  <CheckCircle size={28} weight="fill" />
                </div>

                <div>
                  <h4 className="font-display font-bold text-lg text-[var(--ink)]">
                    Redemption Successful!
                  </h4>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Your {selectedBrand.brand} ₹{selectedDenom} voucher code is active below.
                  </p>
                </div>

                <div className="bg-[var(--surface)] p-4 border border-[var(--border)] rounded-xs space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-[var(--ink-subtle)] block">
                    Voucher Code
                  </span>
                  <div className="font-mono-num font-bold text-lg text-[#1B2A72] tracking-wider select-all">
                    {generatedVoucherCode}
                  </div>
                  <button
                    onClick={() => handleCopyCode(generatedVoucherCode)}
                    className="mt-2 w-full py-2 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-semibold text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy size={14} />
                    <span>{copiedCode ? 'Voucher Code Copied!' : 'Copy Voucher Code'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedBrand(null)}
                  className="w-full py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink)] font-display font-semibold text-xs rounded-xs transition-colors border border-[var(--border)]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
