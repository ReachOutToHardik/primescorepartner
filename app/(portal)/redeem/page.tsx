'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePartnerStore } from '@/lib/store';
import { GIFT_CARDS, HOW_TO_REDEEM_STEPS, GiftCardDefinition } from '@/lib/constants';
import {
  Gift,
  Coins,
  CheckCircle,
  X,
  Copy,
  ShieldCheck,
  MagnifyingGlass,
  Check,
  Receipt,
  ArrowRight,
  Funnel,
  Lock,
} from '@phosphor-icons/react';
import { KycUnderReviewModal } from '@/components/ui/KycUnderReviewModal';

function RedeemContent() {
  const { partner, totalPoints, redemptions, redeemGiftCard } = usePartnerStore();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);

  // Selected Brand for Drawer (Mobile) & Modal (Desktop)
  const [selectedCard, setSelectedCard] = useState<GiftCardDefinition | null>(null);
  const [selectedDenom, setSelectedDenom] = useState<number>(1000);

  // OTP Modal Flow State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<'otp' | 'success'>('otp');
  const [otpValue, setOtpValue] = useState('');
  const [internalOtp, setInternalOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
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

  // Sync with URL query param ?brand=xxx
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      const matched = GIFT_CARDS.find(
        (c) =>
          c.id.toLowerCase() === brandParam.toLowerCase() ||
          c.brand.toLowerCase().replace(/[^a-z0-9]/g, '') === brandParam.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (matched) {
        setSelectedCard(matched);
        setSelectedDenom(matched.denominations[0] || 1000);
      }
    }
  }, [searchParams]);

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

  useEffect(() => {
    fetchLiveRedemptions();
  }, [partner?.id, activeTab]);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    GIFT_CARDS.forEach((c) => cats.add(c.category));
    return Array.from(cats);
  }, []);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return GIFT_CARDS.filter((card) => {
      const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        card.brand.toLowerCase().includes(query) ||
        card.category.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenCard = (card: GiftCardDefinition, initialDenom?: number) => {
    setSelectedCard(card);
    if (initialDenom) {
      setSelectedDenom(initialDenom);
    } else {
      const affordable = card.denominations.find((d) => totalPoints >= d * 4);
      setSelectedDenom(affordable || card.denominations[0] || 1000);
    }
  };

  const handleCloseCard = () => {
    setSelectedCard(null);
  };

  const handleInitiateRedemption = async () => {
    if (!selectedCard) return;

    if (partner?.status !== 'kyc_approved') {
      setKycModalOpen(true);
      return;
    }

    const pointsCost = selectedDenom * 4;
    if (totalPoints < pointsCost) {
      alert(`Insufficient PrimePoints! You have ${totalPoints.toLocaleString()} Pts but need ${pointsCost.toLocaleString()} Pts for ₹${selectedDenom.toLocaleString('en-IN')} voucher.`);
      return;
    }

    // Generate and dispatch SMS OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setInternalOtp(otp);
    setOtpExpiresAt(Date.now() + 10 * 60 * 1000);
    setIsSendingOtp(true);
    setOtpValue('');
    setErrorMsg('');
    setOtpStep('otp');
    setOtpModalOpen(true);

    if (partner?.phone) {
      try {
        await fetch('/api/send-sms-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: partner.phone,
            otpCode: otp,
          }),
        });
      } catch (err) {
        console.error('Redemption SMS dispatch error:', err);
      }
    }

    setIsSendingOtp(false);
  };

  const handleVerifyAndRedeem = async () => {
    if (!selectedCard || !partner?.id) return;

    if (otpExpiresAt && Date.now() > otpExpiresAt) {
      setErrorMsg('This OTP code has expired. Please request a new OTP code.');
      return;
    }

    if (otpValue.trim() !== internalOtp) {
      setErrorMsg('Invalid OTP code. Please check and enter the 6-digit code received on SMS.');
      return;
    }

    setIsRedeeming(true);
    setErrorMsg('');

    const pointsCost = selectedDenom * 4;

    try {
      const { supabase } = await import('@/lib/supabase');

      const insertPayload: Record<string, any> = {
        partner_id: partner.id,
        brand_name: selectedCard.brand,
        denomination_inr: selectedDenom,
        points_burned: pointsCost,
        points_deducted: pointsCost,
        voucher_code: '',
        status: 'pending',
      };

      const { error: insertError } = await supabase.from('redemptions').insert([insertPayload]);

      if (insertError && insertError.code === 'PGRST204') {
        delete insertPayload.points_deducted;
        await supabase.from('redemptions').insert([insertPayload]);
      }

      const newBal = Math.max(0, totalPoints - pointsCost);
      await supabase.from('profiles').update({ prime_points: newBal }).eq('id', partner.id);

      try {
        await supabase.from('point_transactions').insert([
          {
            partner_id: partner.id,
            transaction_type: 'voucher_redeemed',
            points_change: -pointsCost,
            balance_after: newBal,
            title: `Voucher Request: ${selectedCard.brand} (₹${selectedDenom})`,
            reference_id: `RDM-${Date.now().toString().slice(-6)}`,
          },
        ]);
      } catch (txErr) {
        console.warn('Voucher transaction log warning:', txErr);
      }

      redeemGiftCard(selectedCard.brand, selectedDenom, pointsCost);
      setOtpStep('success');
      fetchLiveRedemptions();
    } catch (err) {
      console.error('Redemption error:', err);
      setErrorMsg('Redemption processing failed. Please try again.');
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
    <div className="space-y-6 animate-fade-up font-sans">
      {/* 1. Header Banner */}
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

        {/* Points Available Counter */}
        <div className="relative z-10 shrink-0">
          <div className="bg-[#1B2A72]/60 border border-white/15 px-5 py-3.5 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Coins size={24} weight="fill" className="text-[#F5C518] shrink-0" />
            <div>
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">
                POINTS AVAILABLE
              </div>
              <div className="font-mono font-bold text-xl text-white leading-tight">
                {totalPoints.toLocaleString()} Pts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs, Search & Dropdown Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Catalog / History Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Gift size={15} weight={activeTab === 'catalog' ? 'fill' : 'regular'} />
              <span>Catalog (12)</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt size={15} weight={activeTab === 'history' ? 'fill' : 'regular'} />
              <span>My Vouchers ({liveRedemptions.length > 0 ? liveRedemptions.length : redemptions.length})</span>
            </button>
          </div>

          {/* Search + Category Dropdown Toolbar */}
          {activeTab === 'catalog' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search brand (AJIO, Croma...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Side Category Filter Button */}
              <div className="relative shrink-0">
                <div
                  className={`flex items-center justify-center gap-1.5 bg-white border rounded-lg px-2.5 sm:px-3 py-2 text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                    selectedCategory !== 'All'
                      ? 'border-[#1B2A72] text-[#1B2A72] bg-blue-50/60'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Funnel
                    size={15}
                    className={`shrink-0 ${selectedCategory !== 'All' ? 'text-[#1B2A72]' : 'text-slate-500'}`}
                    weight={selectedCategory !== 'All' ? 'fill' : 'regular'}
                  />
                  <span className="hidden sm:inline text-xs font-medium truncate max-w-[130px]">
                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                  </span>
                  {selectedCategory !== 'All' && (
                    <span className="sm:hidden w-2 h-2 rounded-full bg-[#1B2A72]" />
                  )}

                  {/* Invisible native select overlaid over button for click/tap trigger */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                    aria-label="Filter by category"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. CATALOG GRID (Consistent info across desktop & mobile) */}
      {activeTab === 'catalog' && (
        <div>
          {filteredCards.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
              <p className="font-semibold text-slate-800 text-sm">No gift cards match your filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredCards.map((card) => {
                const minDenom = Math.min(...card.denominations);
                const minPts = minDenom * 4;
                const hasEnough = totalPoints >= minPts;

                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (hasEnough) handleOpenCard(card);
                    }}
                    className={`border rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all select-none ${
                      !hasEnough
                        ? 'bg-slate-50/70 border-slate-200/90 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md cursor-pointer group'
                    }`}
                  >
                    <div className="space-y-2 sm:space-y-2.5">
                      {/* Card Artwork */}
                      <div className="relative w-full aspect-[16/10] flex items-center justify-center overflow-hidden rounded-md sm:rounded-lg">
                        <img
                          src={card.image}
                          alt={card.brand}
                          className={`w-full h-full object-contain transition-all duration-200 ${
                            hasEnough ? 'group-hover:scale-[1.02]' : 'grayscale opacity-75'
                          }`}
                          loading="lazy"
                        />
                        {!hasEnough && (
                          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 bg-white/95 px-1.5 py-0.5 rounded shadow-xs border border-slate-200/90">
                            <Lock size={10} weight="bold" className="text-slate-500" />
                            <span>Locked</span>
                          </span>
                        )}
                        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[9px] sm:text-[10px] font-mono font-medium text-slate-700 bg-white/95 px-1 sm:px-1.5 py-0.5 rounded shadow-xs border border-slate-200/80">
                          {card.expiryMonths}M
                        </span>
                      </div>

                      {/* Info Header */}
                      <div>
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                          <span className="truncate max-w-[95px] sm:max-w-none">{card.category}</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono text-[8px] sm:text-[9px] shrink-0">
                            0% Fee
                          </span>
                        </div>
                        <h3 className={`font-semibold text-xs sm:text-sm leading-snug truncate ${hasEnough ? 'text-slate-900' : 'text-slate-600'}`}>
                          {card.brand}
                        </h3>
                      </div>

                      {/* Denominations */}
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase font-mono">
                          Values
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {card.denominations.map((denom) => {
                            const canAfford = totalPoints >= denom * 4;
                            return (
                              <span
                                key={denom}
                                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-medium border ${
                                  canAfford
                                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                                    : 'bg-slate-100/80 border-slate-200/60 text-slate-400'
                                }`}
                              >
                                ₹{denom.toLocaleString('en-IN')}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 sm:pt-2.5 mt-2 sm:mt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div>
                        <div className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase font-mono">
                          Starts At
                        </div>
                        <div className={`font-mono font-bold text-[11px] sm:text-xs ${hasEnough ? 'text-slate-900' : 'text-slate-400'}`}>
                          {minPts.toLocaleString()} <span className="text-[9px] sm:text-[10px] font-normal text-slate-400">Pts</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!hasEnough}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasEnough) handleOpenCard(card);
                        }}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shrink-0 ${
                          hasEnough
                            ? 'bg-[#1B2A72] hover:bg-[#0F1A4E] text-white cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        {!hasEnough ? (
                          <>
                            <Lock size={11} weight="bold" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <span>Redeem</span>
                            <ArrowRight size={11} weight="bold" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. VOUCHER HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Redeemed Voucher History
              </h2>
              <p className="text-xs text-slate-500">
                Voucher codes and PINs are issued via SMS and stored securely below once processed.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-semibold rounded-md">
              {liveRedemptions.length > 0 ? liveRedemptions.length : redemptions.length} Claimed
            </span>
          </div>

          {(liveRedemptions.length > 0 ? liveRedemptions : redemptions).length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Gift size={32} className="mx-auto text-slate-400" />
              <p className="font-semibold text-slate-800 text-sm">No vouchers claimed yet.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
              >
                View Catalog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(liveRedemptions.length > 0 ? liveRedemptions : redemptions).map((rdmItem: any) => {
                const brand = rdmItem.brand_name || rdmItem.brand;
                const denom = rdmItem.denomination_inr || rdmItem.denomination;
                const pts = rdmItem.points_burned || rdmItem.points || denom * 4;
                const dateStr = rdmItem.created_at || rdmItem.redeemedAt;
                const status = rdmItem.status || 'pending';
                const vCode = rdmItem.voucher_code || rdmItem.voucherCode || '';

                const isFulfilled = status === 'fulfilled' && Boolean(vCode);
                const isRejected = status === 'rejected';
                const isPending = !isFulfilled && !isRejected;

                const matchedDef = GIFT_CARDS.find(
                  (c) => c.brand.toLowerCase() === brand.toLowerCase() || c.id.toLowerCase() === brand.toLowerCase()
                );

                return (
                  <div key={rdmItem.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        {matchedDef?.image ? (
                          <img src={matchedDef.image} alt={brand} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-lg">🎁</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-900">
                            {brand} (₹{denom.toLocaleString('en-IN')})
                          </p>
                          {isPending && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold uppercase">
                              Verification Pending
                            </span>
                          )}
                          {isFulfilled && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold uppercase">
                              Processed
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-semibold uppercase">
                              Declined & Refunded
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-500">
                          {pts.toLocaleString()} Pts • {new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPending && (
                        <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                          Code will arrive via SMS upon admin approval
                        </div>
                      )}
                      {isFulfilled && (
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded">
                          <code className="text-xs font-mono font-bold text-emerald-950 select-all">
                            {vCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(vCode)}
                            className="p-1 hover:bg-emerald-100 text-emerald-700 rounded cursor-pointer"
                            title="Copy code"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      )}
                      {isRejected && (
                        <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded border border-rose-200">
                          +{pts.toLocaleString()} Pts refunded
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

      {/* ========================================================================= */}
      {/* 5. MOBILE BOTTOM DRAWER (< 768px) */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="md:hidden fixed inset-0 z-[100000] bg-black/70 flex flex-col justify-end">
          <div className="flex-1 w-full" onClick={handleCloseCard} />
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden">
            <div className="pt-2.5 pb-2 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-700 uppercase font-mono">{selectedCard.brand}</span>
              <button onClick={handleCloseCard} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              <div className="w-full aspect-[16/10] flex items-center justify-center overflow-hidden rounded-lg">
                <img src={selectedCard.image} alt={selectedCard.brand} className="w-full h-full object-contain" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedCard.brand} Gift Voucher</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{selectedCard.category}</span>
                  <span>•</span>
                  <span>{selectedCard.expiryMonths}M Validity</span>
                </div>
              </div>

              {/* Denomination Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase font-mono block">
                  Choose Gift Card Plan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCard.denominations.map((denom) => {
                    const pts = denom * 4;
                    const isSelected = selectedDenom === denom;
                    const hasEnough = totalPoints >= pts;

                    return (
                      <button
                        key={denom}
                        type="button"
                        disabled={!hasEnough}
                        onClick={() => hasEnough && setSelectedDenom(denom)}
                        className={`p-2.5 rounded-lg text-left border transition-all relative ${
                          !hasEnough
                            ? 'border-slate-200 bg-slate-50/90 text-slate-400 opacity-50 cursor-not-allowed select-none'
                            : isSelected
                            ? 'border-[#1B2A72] bg-blue-50/80 text-[#1B2A72] ring-1 ring-[#1B2A72] cursor-pointer'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-mono font-bold text-sm ${!hasEnough ? 'text-slate-400' : ''}`}>
                            ₹{denom.toLocaleString('en-IN')}
                          </span>
                          {!hasEnough && (
                            <Lock size={12} weight="bold" className="text-slate-400 shrink-0" />
                          )}
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${
                            !hasEnough
                              ? 'text-slate-400'
                              : isSelected
                              ? 'text-[#1B2A72] font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          {pts.toLocaleString()} Pts
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Balance Summary Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Available Balance:</span>
                  <span className="font-mono font-semibold text-slate-900">{totalPoints.toLocaleString()} Pts</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Voucher Cost:</span>
                  <span className="font-mono font-semibold text-slate-900">-{(selectedDenom * 4).toLocaleString()} Pts</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                  {totalPoints >= selectedDenom * 4 ? (
                    <>
                      <span>Remaining Balance:</span>
                      <span className="font-mono text-emerald-700">
                        {(totalPoints - selectedDenom * 4).toLocaleString()} Pts
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-700">Points Shortage:</span>
                      <span className="font-mono text-rose-700">
                        Need {(selectedDenom * 4 - totalPoints).toLocaleString()} more Pts
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedCard.description}
                </p>
              </div>

              {/* Terms */}
              {selectedCard.terms && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-900">Terms & Conditions</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {selectedCard.terms.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to redeem */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">How to Redeem</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {HOW_TO_REDEEM_STEPS.map((step) => (
                    <div key={step.step} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                        {step.step}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800 text-[11px]">{step.title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-3 pb-8 sm:pb-4 border-t border-slate-200 bg-white shrink-0">
              <button
                type="button"
                disabled={totalPoints < selectedDenom * 4 || isRedeeming}
                onClick={handleInitiateRedemption}
                className={`w-full py-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  totalPoints < selectedDenom * 4
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1B2A72] hover:bg-[#0F1A4E] text-white cursor-pointer shadow-sm'
                }`}
              >
                {totalPoints < selectedDenom * 4 ? (
                  <span>Insufficient Points (Need {(selectedDenom * 4 - totalPoints).toLocaleString()} more)</span>
                ) : (
                  <>
                    <span>Redeem Voucher</span>
                    <span className="font-mono font-normal opacity-90">({(selectedDenom * 4).toLocaleString()} Pts)</span>
                    <ArrowRight size={13} weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DESKTOP RICH MODAL (>= 768px) */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="hidden md:flex fixed inset-0 z-[9999] items-center justify-center bg-black/60 p-4">
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase font-mono text-slate-800">
                  {selectedCard.brand}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedCard.expiryMonths}M Validity
                </span>
              </div>
              <button
                onClick={handleCloseCard}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2-Column Body */}
            <div className="overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
              {/* Left Column: Image & Description (5/12) */}
              <div className="md:col-span-5 space-y-4">
                <div className="w-full aspect-[16/10] flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={selectedCard.image}
                    alt={selectedCard.brand}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-900">Description</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedCard.description}
                  </p>
                </div>

                {selectedCard.terms && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase font-mono text-slate-900">Terms</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {selectedCard.terms.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Values & Action (7/12) */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedCard.brand} Gift Voucher
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your gift card plan to redeem using your PrimePoints wallet.
                  </p>
                </div>

                {/* Denominations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono block">
                    Choose Gift Card Plan (₹1 = 4 Pts)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedCard.denominations.map((denom) => {
                      const pts = denom * 4;
                      const isSelected = selectedDenom === denom;
                      const hasEnough = totalPoints >= pts;

                      return (
                        <button
                          key={denom}
                          type="button"
                          disabled={!hasEnough}
                          onClick={() => hasEnough && setSelectedDenom(denom)}
                          className={`p-3 rounded-lg text-left border transition-all relative ${
                            !hasEnough
                              ? 'border-slate-200 bg-slate-50/90 text-slate-400 opacity-50 cursor-not-allowed select-none'
                              : isSelected
                              ? 'border-[#1B2A72] bg-blue-50/80 text-[#1B2A72] ring-1 ring-[#1B2A72] cursor-pointer'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-mono font-bold text-sm ${!hasEnough ? 'text-slate-400' : ''}`}>
                              ₹{denom.toLocaleString('en-IN')}
                            </span>
                            {!hasEnough && (
                              <Lock size={12} weight="bold" className="text-slate-400 shrink-0" />
                            )}
                          </div>
                          <div
                            className={`text-xs font-mono mt-0.5 ${
                              !hasEnough
                                ? 'text-slate-400'
                                : isSelected
                                ? 'text-[#1B2A72] font-semibold'
                                : 'text-slate-500'
                            }`}
                          >
                            {pts.toLocaleString()} Pts
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Balance Impact */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Available Balance:</span>
                    <span className="font-mono font-semibold text-slate-900">{totalPoints.toLocaleString()} Pts</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Voucher Cost (₹{selectedDenom.toLocaleString('en-IN')}):</span>
                    <span className="font-mono font-semibold text-slate-900">-{(selectedDenom * 4).toLocaleString()} Pts</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                    {totalPoints >= selectedDenom * 4 ? (
                      <>
                        <span>Remaining Balance:</span>
                        <span className="font-mono text-emerald-700">
                          {(totalPoints - selectedDenom * 4).toLocaleString()} Pts
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-rose-700">Points Shortage:</span>
                        <span className="font-mono text-rose-700">
                          Need {(selectedDenom * 4 - totalPoints).toLocaleString()} more Pts
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* How to Redeem */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-900">How to Redeem</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {HOW_TO_REDEEM_STEPS.map((step) => (
                      <div key={step.step} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                          {step.step}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">{step.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  disabled={totalPoints < selectedDenom * 4 || isRedeeming}
                  onClick={handleInitiateRedemption}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    totalPoints < selectedDenom * 4
                      ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#1B2A72] hover:bg-[#0F1A4E] text-white cursor-pointer'
                  }`}
                >
                  {totalPoints < selectedDenom * 4 ? (
                    <span>Insufficient Points Balance</span>
                  ) : (
                    <>
                      <span>Redeem ₹{selectedDenom.toLocaleString('en-IN')} Voucher ({(selectedDenom * 4).toLocaleString()} Pts)</span>
                      <ArrowRight size={14} weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. OTP CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {otpModalOpen && selectedCard && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOtpModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900">
                Confirm Voucher Claim
              </h3>
              <button onClick={() => setOtpModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {otpStep === 'otp' && (
              <div className="space-y-3.5">
                <div className="text-center space-y-1">
                  <ShieldCheck size={28} className="mx-auto text-slate-900" />
                  <p className="font-bold text-xs text-slate-900">Enter 6-Digit SMS Security OTP</p>
                  <p className="text-[11px] text-slate-500">
                    Dispatched to <span className="font-mono font-semibold text-slate-800">{partner?.phone || 'registered number'}</span>
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-2.5 text-center font-mono font-bold text-xl tracking-widest bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-400 text-slate-900 outline-hidden"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
                    <span>Valid for 10 minutes</span>
                    <button
                      type="button"
                      onClick={handleInitiateRedemption}
                      className="text-slate-900 font-semibold hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-600">Cost:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(selectedDenom * 4).toLocaleString()} Pts (₹{selectedDenom.toLocaleString('en-IN')})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyAndRedeem}
                  disabled={isRedeeming || otpValue.length < 6}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isRedeeming ? 'Verifying...' : 'Verify OTP & Confirm'}
                </button>
              </div>
            )}

            {otpStep === 'success' && (
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} weight="fill" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Claim Request Submitted
                  </h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    Your request for <strong className="text-slate-900">{selectedCard.brand} (₹{selectedDenom.toLocaleString('en-IN')})</strong> voucher is in queue for review.
                  </p>
                </div>

                <div className="bg-amber-50 p-2.5 border border-amber-200 rounded text-left text-xs text-amber-900">
                  <div className="font-semibold">Review Time: 15–30 Mins</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Your voucher code and PIN will arrive on your mobile via SMS.
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpModalOpen(false);
                      setSelectedCard(null);
                      setActiveTab('history');
                    }}
                    className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    View History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpModalOpen(false);
                      setSelectedCard(null);
                    }}
                    className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC Alert Modal */}
      <KycUnderReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        joinedAt={partner?.joinedAt}
      />
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-semibold text-slate-500">Loading gift cards...</div>}>
      <RedeemContent />
    </Suspense>
  );
}
