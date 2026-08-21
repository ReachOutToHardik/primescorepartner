'use client';

import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Gift, 
  Plus, 
  Barcode, 
  Trash, 
  CheckCircle, 
  Clock,
  XCircle,
  ShoppingBag,
  Coins,
  ArrowRight,
  MagnifyingGlass,
  Funnel,
  PaperPlaneRight,
  Copy,
  Check,
  Vault,
  Warning
} from '@phosphor-icons/react';

export interface DbRedemptionRequest {
  id: string;
  partner_id: string;
  partner_name?: string;
  partner_email?: string;
  partner_phone?: string;
  brand_name: string;
  denomination_inr: number;
  points_deducted: number;
  voucher_code?: string;
  status: 'pending' | 'fulfilled' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  fulfilled_at?: string;
}

interface VoucherCodeStock {
  id: string;
  cardBrand: string;
  denomination: number;
  code: string;
  pin?: string;
  expiryDate: string;
  isRedeemed: boolean;
}

const INITIAL_VOUCHER_STOCK: VoucherCodeStock[] = [
  { id: 'v-101', cardBrand: 'Amazon Pay', denomination: 100, code: 'AMAZ-G61R-TUCJ', pin: '4321', expiryDate: '2026-12-31', isRedeemed: false },
  { id: 'v-102', cardBrand: 'Amazon Pay', denomination: 500, code: 'AMZN-500-9988-7766', pin: '4321', expiryDate: '2026-12-31', isRedeemed: false },
  { id: 'v-103', cardBrand: 'Amazon Pay', denomination: 1000, code: 'AMZN-1000-5566-7788', pin: '1234', expiryDate: '2026-12-31', isRedeemed: false },
  { id: 'v-104', cardBrand: 'Flipkart', denomination: 500, code: 'FLIP-500-8899-0011', pin: '9900', expiryDate: '2026-11-30', isRedeemed: false },
  { id: 'v-105', cardBrand: 'Swiggy', denomination: 250, code: 'SWIG-250-4455-6677', pin: '5566', expiryDate: '2026-10-31', isRedeemed: false },
];

export default function AdminGiftCardsPage() {
  const { giftCards, partners, toggleGiftCard, addGiftCard } = useAdminStore();
  const [mainTab, setMainTab] = useState<'redemptions' | 'inventory' | 'vouchers'>('redemptions');
  const [statusTab, setStatusTab] = useState<'pending' | 'fulfilled' | 'rejected'>('pending');

  // Redemptions DB state
  const [redemptions, setRedemptions] = useState<DbRedemptionRequest[]>([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');

  // Per-redemption voucher code inputs
  const [editingCodes, setEditingCodes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Stock State
  const [voucherStock, setVoucherStock] = useState<VoucherCodeStock[]>(INITIAL_VOUCHER_STOCK);

  // Add Card Modal
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('#1B2A72');
  const [denominationsStr, setDenominationsStr] = useState('100, 250, 500, 1000');

  // Add Voucher Codes Modal
  const [addVoucherModalOpen, setAddVoucherModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Amazon Pay');
  const [selectedDenomination, setSelectedDenomination] = useState(500);
  const [rawCodesText, setRawCodesText] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Fetch redemptions live from Supabase
  const fetchRedemptions = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      let { data: dbRedemptions, error: redemptionsErr } = await supabase
        .from('redemptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (redemptionsErr && redemptionsErr.code === '42703') {
        const fallback = await supabase.from('redemptions').select('*');
        dbRedemptions = fallback.data;
      }

      if (dbRedemptions) {
        // Fetch profiles to attach partner name & email
        const { data: dbProfiles } = await supabase.from('profiles').select('id, name, email, phone');
        const profileMap = new Map((dbProfiles || []).map((p) => [p.id, p]));

        const mapped: DbRedemptionRequest[] = dbRedemptions.map((r) => {
          const prof = profileMap.get(r.partner_id);
          return {
            id: r.id,
            partner_id: r.partner_id,
            partner_name: prof?.name || 'Partner',
            partner_email: prof?.email || 'N/A',
            partner_phone: prof?.phone || 'N/A',
            brand_name: r.brand_name,
            denomination_inr: r.denomination_inr,
            points_deducted: r.points_burned || r.points_deducted || r.points_required || 0,
            voucher_code: r.voucher_code || '',
            status: (r.status || 'fulfilled') as 'pending' | 'fulfilled' | 'rejected',
            rejection_reason: r.rejection_reason || '',
            created_at: r.created_at,
            fulfilled_at: r.fulfilled_at || r.created_at,
          };
        });

        setRedemptions(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch redemptions:', err);
    } finally {
      setIsLoadingRedemptions(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  // Action: Fulfill & Approve Redemption
  const handleFulfillRedemption = async (redemptionId: string) => {
    const customCode = editingCodes[redemptionId]?.trim() || `AMAZ-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setIsProcessingAction(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('redemptions')
        .update({
          status: 'fulfilled',
          voucher_code: customCode,
          fulfilled_at: now,
        })
        .eq('id', redemptionId);

      if (!error) {
        const target = redemptions.find((r) => r.id === redemptionId);
        // Create notification for partner
        if (target) {
          await supabase.from('notifications').insert([
            {
              partner_id: target.partner_id,
              title: `🎉 Gift Voucher Dispatched!`,
              message: `Your ₹${target.denomination_inr} ${target.brand_name} e-voucher code (${customCode}) is ready to redeem!`,
              type: 'reward',
              points_badge: `₹${target.denomination_inr} Voucher`,
              is_read: false,
            },
          ]);
        }
        fetchRedemptions();
      }
    } catch (err) {
      console.error('Fulfillment error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Action: Reject & Refund Points
  const handleRejectRedemption = async () => {
    if (!rejectTargetId) return;
    setIsProcessingAction(true);

    try {
      const target = redemptions.find((r) => r.id === rejectTargetId);
      if (target) {
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('redemptions')
          .update({
            status: 'rejected',
            rejection_reason: rejectReason.trim() || 'Verification issue',
          })
          .eq('id', rejectTargetId);

        // Refund points to partner profile
        const { data: partnerProf } = await supabase
          .from('profiles')
          .select('prime_points')
          .eq('id', target.partner_id)
          .single();

        if (partnerProf) {
          const ptsToRefund = target.points_deducted || (target.denomination_inr * 4);
          const updatedPoints = (partnerProf.prime_points || 0) + ptsToRefund;

          await supabase
            .from('profiles')
            .update({ prime_points: updatedPoints })
            .eq('id', target.partner_id);

          // Log refund in point_transactions table
          try {
            await supabase.from('point_transactions').insert([
              {
                partner_id: target.partner_id,
                transaction_type: 'admin_grant',
                points_change: ptsToRefund,
                balance_after: updatedPoints,
                title: `🎁 Voucher Request Rejected & Refunded: ${target.brand_name} (₹${target.denomination_inr})`,
                reference_id: target.id,
              },
            ]);
          } catch (txErr) {
            console.warn('Voucher refund point_transactions log warning:', txErr);
          }
        }

        // Notify partner of refund
        await supabase.from('notifications').insert([
          {
            partner_id: target.partner_id,
            title: `🎉 Voucher Refunded (+${target.points_deducted || target.denomination_inr * 4} Pts)`,
            message: `Your ₹${target.denomination_inr} ${target.brand_name} redemption request was declined and +${target.points_deducted || target.denomination_inr * 4} PrimePoints have been refunded back to your account balance. Reason: ${rejectReason.trim() || 'Administrative review'}`,
            type: 'warning',
            points_badge: `+${target.points_deducted || target.denomination_inr * 4} Pts Refunded`,
            is_read: false,
          },
        ]);

        setRejectModalOpen(false);
        setRejectTargetId(null);
        setRejectReason('');
        fetchRedemptions();
      }
    } catch (err) {
      console.error('Rejection error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCard = () => {
    if (brand.trim()) {
      const denominations = denominationsStr
        .split(',')
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d));

      addGiftCard({
        brand,
        logo: '',
        color,
        denominations: denominations.length ? denominations : [500],
        isActive: true,
      });

      setBrand('');
      setAddCardModalOpen(false);
    }
  };

  const handleBatchAddVouchers = () => {
    if (rawCodesText.trim()) {
      const lines = rawCodesText.split('\n').filter((line) => line.trim() !== '');
      const newItems: VoucherCodeStock[] = lines.map((line, idx) => {
        const parts = line.split(',');
        const code = parts[0]?.trim() || line.trim();
        const pin = parts[1]?.trim() || '';
        return {
          id: `v-${Date.now()}-${idx}`,
          cardBrand: selectedBrand,
          denomination: selectedDenomination,
          code,
          pin,
          expiryDate,
          isRedeemed: false,
        };
      });

      setVoucherStock([...newItems, ...voucherStock]);
      setRawCodesText('');
      setAddVoucherModalOpen(false);
    }
  };

  // Analytics Computation
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending');
  const fulfilledRedemptions = redemptions.filter((r) => r.status === 'fulfilled');
  const rejectedRedemptions = redemptions.filter((r) => r.status === 'rejected');

  const pendingCashInr = pendingRedemptions.reduce((acc, r) => acc + r.denomination_inr, 0);
  const fulfilledCashInr = fulfilledRedemptions.reduce((acc, r) => acc + r.denomination_inr, 0);
  const totalPointsRedeemed = redemptions.reduce((acc, r) => acc + r.points_deducted, 0);

  // Filtered Redemptions for the Active Status Tab
  const activeStatusList = redemptions.filter((r) => {
    const matchesStatus = r.status === statusTab;
    const matchesBrand = brandFilter === 'all' || r.brand_name.toLowerCase().includes(brandFilter.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      (r.partner_name && r.partner_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.partner_email && r.partner_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.voucher_code && r.voucher_code.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesBrand && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Title & Top View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <Gift className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            Gift Voucher Redemptions & Fulfillment Desk
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Review partner voucher redemption requests, input custom e-voucher codes, and dispatch instant payouts.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl font-medium text-xs border border-slate-200">
          <button
            onClick={() => setMainTab('redemptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              mainTab === 'redemptions'
                ? 'bg-[#1B2A72] text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PaperPlaneRight size={16} /> Requested Redemptions ({redemptions.length})
          </button>
          <button
            onClick={() => setMainTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              mainTab === 'inventory'
                ? 'bg-[#1B2A72] text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={16} /> Brand Gift Cards ({giftCards.length})
          </button>
          <button
            onClick={() => setMainTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              mainTab === 'vouchers'
                ? 'bg-[#1B2A72] text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode size={16} /> Code Stock ({voucherStock.length})
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: REQUESTED VOUCHER REDEMPTIONS (WITH 4 METRIC CARDS & 3 SUB TABS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {mainTab === 'redemptions' && (
        <div className="space-y-6">
          {/* 4 Analytics Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-blue-600 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Gift size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Requested Claims</p>
                  <h3 className="text-2xl font-bold font-mono-num text-slate-900">{redemptions.length} Vouchers</h3>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">Partner Network Claims</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-amber-500 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <Clock size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pending Fulfillment</p>
                  <h3 className="text-2xl font-bold font-mono-num text-amber-700">{pendingRedemptions.length} (₹{pendingCashInr.toLocaleString()})</h3>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">⚠️ Requires Code Dispatch</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-emerald-600 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Approved & Dispatched</p>
                  <h3 className="text-2xl font-bold font-mono-num text-emerald-600">{fulfilledRedemptions.length} (₹{fulfilledCashInr.toLocaleString()})</h3>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">Voucher Codes Sent</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-purple-600 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                  <Coins size={24} weight="fill" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">PrimePoints Burnt</p>
                  <h3 className="text-2xl font-bold font-mono-num text-purple-700">{totalPointsRedeemed.toLocaleString()} Pts</h3>
                  <p className="text-xs text-purple-800 font-medium mt-0.5">Total Redeemed Points</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search Bar & Status Sub-Tabs */}
          <Card className="p-4 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* 3 Status Sub-Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                <button
                  onClick={() => setStatusTab('pending')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusTab === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={16} /> Pending ({pendingRedemptions.length})
                </button>
                <button
                  onClick={() => setStatusTab('fulfilled')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusTab === 'fulfilled'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle size={16} /> Approved & Dispatched ({fulfilledRedemptions.length})
                </button>
                <button
                  onClick={() => setStatusTab('rejected')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusTab === 'rejected'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <XCircle size={16} /> Rejected / Refunded ({rejectedRedemptions.length})
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search partner name, email, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72] w-64"
                  />
                  <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>

                {/* Brand Filter */}
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1B2A72]"
                >
                  <option value="all">All Brands</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Swiggy">Swiggy</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Myntra">Myntra</option>
                </select>
              </div>
            </div>

            {/* Redemptions Directory Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-display">
                  <tr>
                    <th className="px-5 py-3.5">Partner Details</th>
                    <th className="px-5 py-3.5">Voucher Brand & Value</th>
                    <th className="px-5 py-3.5">Points Burnt</th>
                    <th className="px-5 py-3.5">Voucher Code / Dispatch Action</th>
                    <th className="px-5 py-3.5">Requested Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono-num text-xs">
                  {isLoadingRedemptions ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#1B2A72] rounded-full animate-spin mx-auto mb-2" />
                        <p className="font-semibold">Loading requested redemptions...</p>
                      </td>
                    </tr>
                  ) : activeStatusList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No redemptions found in <strong className="uppercase">{statusTab}</strong> queue matching your search filters.
                      </td>
                    </tr>
                  ) : (
                    activeStatusList.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Partner Details */}
                        <td className="px-5 py-4 font-sans">
                          <p className="font-bold text-slate-900 text-sm">{r.partner_name}</p>
                          <p className="text-slate-500 text-[11px]">{r.partner_email}</p>
                          <p className="text-slate-400 text-[10px] font-mono">ID: {r.partner_id.substring(0, 8)}...</p>
                        </td>

                        {/* Voucher Brand & Value */}
                        <td className="px-5 py-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-display text-sm">{r.brand_name}</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-md">
                              ₹{r.denomination_inr}
                            </span>
                          </div>
                        </td>

                        {/* Points Burnt */}
                        <td className="px-5 py-4 font-mono font-bold text-purple-700">
                          {r.points_deducted.toLocaleString()} Pts
                        </td>

                        {/* Voucher Code / Dispatch Action */}
                        <td className="px-5 py-4 font-mono">
                          {r.status === 'pending' ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                placeholder="Enter or auto-generate code..."
                                value={editingCodes[r.id] ?? ''}
                                onChange={(e) => setEditingCodes({ ...editingCodes, [r.id]: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-[#1B2A72] uppercase font-bold text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingCodes({
                                    ...editingCodes,
                                    [r.id]: `${r.brand_name.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                                  })
                                }
                                className="text-[10px] text-indigo-600 font-bold hover:underline"
                              >
                                ⚡ Auto-Generate Code
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1B2A72] bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                                {r.voucher_code || 'CODE-DISPATCHED'}
                              </span>
                              {r.voucher_code && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(r.voucher_code!, r.id)}
                                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                                  title="Copy Code"
                                >
                                  {copiedId === r.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Requested Date */}
                        <td className="px-5 py-4 font-sans text-xs text-slate-500">
                          {new Date(r.created_at).toLocaleDateString()}<br />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleFulfillRedemption(r.id)}
                                isLoading={isProcessingAction}
                              >
                                <CheckCircle size={14} className="mr-1" /> Approve & Dispatch
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setRejectTargetId(r.id);
                                  setRejectModalOpen(true);
                                }}
                              >
                                <XCircle size={14} className="mr-1" /> Reject & Refund
                              </Button>
                            </div>
                          ) : r.status === 'fulfilled' ? (
                            <Badge variant="green">Dispatched & Complete</Badge>
                          ) : (
                            <Badge variant="red">Rejected & Refunded</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: BRAND GIFT CARDS INVENTORY
      ───────────────────────────────────────────────────────────────────────────── */}
      {mainTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">Available Brand Catalog</h2>
            <Button variant="primary" size="sm" onClick={() => setAddCardModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Add Brand Gift Card
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((card) => {
              const availableVouchers = voucherStock.filter(
                (v) => v.cardBrand === card.brand && !v.isRedeemed
              ).length;

              return (
                <Card 
                  key={card.id} 
                  className="p-6 space-y-4 relative border-t-4 hover:shadow-md transition-all group" 
                  style={{ borderColor: card.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900">
                        {card.brand}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">10 Pts = ₹1 INR</span>
                    </div>
                    <Badge variant={card.isActive ? 'green' : 'gray'}>
                      {card.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Supported Denominations:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.denominations.map((d) => (
                        <span key={d} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-900">
                          ₹{d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs font-mono-num">
                    <span className="text-slate-500">Stock In Vault:</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">{availableVouchers} Unused Codes</span>
                  </div>

                  <div className="pt-1 flex justify-between items-center">
                    <Button
                      variant={card.isActive ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => toggleGiftCard(card.id)}
                    >
                      {card.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: VOUCHER STOCK VAULT
      ───────────────────────────────────────────────────────────────────────────── */}
      {mainTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">Digital Voucher Codes Inventory Vault</h2>
              <p className="text-xs text-slate-500">Upload voucher codes & PINs to automate instant reward delivery to partners.</p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setAddVoucherModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Upload Voucher Stock
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-display">
                  <tr>
                    <th className="px-6 py-3.5">Voucher ID</th>
                    <th className="px-6 py-3.5">Brand</th>
                    <th className="px-6 py-3.5">Denomination</th>
                    <th className="px-6 py-3.5">Voucher Code & PIN</th>
                    <th className="px-6 py-3.5">Expiry Date</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono-num text-xs">
                  {voucherStock.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#1B2A72] font-mono">{v.id}</td>
                      <td className="px-6 py-4 font-sans font-bold text-slate-900">{v.cardBrand}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 font-mono">₹{v.denomination}</td>
                      <td className="px-6 py-4 font-mono">
                        <div className="font-bold text-slate-900">{v.code}</div>
                        {v.pin && <div className="text-[11px] text-slate-500">PIN: {v.pin}</div>}
                      </td>
                      <td className="px-6 py-4 font-sans text-slate-500">{v.expiryDate}</td>
                      <td className="px-6 py-4">
                        <Badge variant={v.isRedeemed ? 'gray' : 'green'}>
                          {v.isRedeemed ? 'Redeemed' : 'In Stock (Available)'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => setVoucherStock(voucherStock.filter((s) => s.id !== v.id))}>
                          <Trash size={14} className="mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Voucher Request & Refund Points">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Rejecting this redemption will decline the voucher request and automatically refund the partner's PrimePoints balance back to their profile.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Rejection *</label>
            <textarea
              placeholder="e.g. Account verification required / Duplicate request"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none font-body"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleRejectRedemption} isLoading={isProcessingAction}>
              Confirm Rejection & Refund Points
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 1: Add New Brand Card */}
      <Modal isOpen={addCardModalOpen} onClose={() => setAddCardModalOpen(false)} title="Add New Brand Gift Card">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Brand Name</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Starbucks, Uber, Zomato"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-body"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Brand Theme Accent Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-11 p-1 border border-slate-300 rounded-xl outline-none mt-1 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Denominations (Comma Separated)</label>
            <input
              type="text"
              value={denominationsStr}
              onChange={(e) => setDenominationsStr(e.target.value)}
              placeholder="100, 250, 500, 1000"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddCardModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCard} disabled={!brand.trim()}>Add Brand Card</Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Batch Upload Voucher Stock */}
      <Modal isOpen={addVoucherModalOpen} onClose={() => setAddVoucherModalOpen(false)} title="Batch Upload Digital Voucher Codes">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Select Gift Card Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 bg-white font-body"
              >
                {giftCards.map((c) => (
                  <option key={c.id} value={c.brand}>{c.brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">Denomination (₹)</label>
              <select
                value={selectedDenomination}
                onChange={(e) => setSelectedDenomination(Number(e.target.value))}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 bg-white font-mono"
              >
                <option value={100}>₹100</option>
                <option value={250}>₹250</option>
                <option value={500}>₹500</option>
                <option value={1000}>₹1000</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">
              Voucher Codes & PINs (One Per Line: CODE, PIN)
            </label>
            <textarea
              value={rawCodesText}
              onChange={(e) => setRawCodesText(e.target.value)}
              placeholder={`AMAZ-G61R-TUCJ, 4321\nAMZN-500-1122-3344, 8765\nAMZN-500-5566-7788, 1234`}
              className="w-full h-32 p-3 border border-slate-300 rounded-xl text-sm font-mono outline-none mt-1"
            />
            <p className="text-[11px] text-slate-500 mt-1">Format: <code>VOUCHER_CODE, PIN</code> on each line.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Voucher Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddVoucherModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleBatchAddVouchers} disabled={!rawCodesText.trim()}>Upload Codes Stock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
