'use client';

import React, { useState } from 'react';
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
  ListChecks, 
  Sparkle,
  ShoppingBag,
  Coins,
  ArrowRight
} from '@phosphor-icons/react';

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
  { id: 'v-101', cardBrand: 'Amazon Pay', denomination: 500, code: 'AMZN-500-9988-7766', pin: '4321', expiryDate: '2025-12-31', isRedeemed: false },
  { id: 'v-102', cardBrand: 'Amazon Pay', denomination: 500, code: 'AMZN-500-1122-3344', pin: '8765', expiryDate: '2025-12-31', isRedeemed: false },
  { id: 'v-103', cardBrand: 'Amazon Pay', denomination: 1000, code: 'AMZN-1000-5566-7788', pin: '1234', expiryDate: '2025-12-31', isRedeemed: false },
  { id: 'v-104', cardBrand: 'Flipkart', denomination: 500, code: 'FLIP-500-8899-0011', pin: '9900', expiryDate: '2025-11-30', isRedeemed: false },
  { id: 'v-105', cardBrand: 'Swiggy', denomination: 250, code: 'SWIG-250-4455-6677', pin: '5566', expiryDate: '2025-10-31', isRedeemed: false },
];

export default function AdminGiftCardsPage() {
  const { giftCards, toggleGiftCard, addGiftCard } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'vouchers'>('inventory');
  
  // Stock State
  const [voucherStock, setVoucherStock] = useState<VoucherCodeStock[]>(INITIAL_VOUCHER_STOCK);

  // Add Card Modal State
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('#1B2A72');
  const [denominationsStr, setDenominationsStr] = useState('100, 250, 500, 1000');

  // Add Voucher Codes Modal State
  const [addVoucherModalOpen, setAddVoucherModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Amazon Pay');
  const [selectedDenomination, setSelectedDenomination] = useState(500);
  const [rawCodesText, setRawCodesText] = useState('');
  const [expiryDate, setExpiryDate] = useState('2025-12-31');

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

  const handleDeleteVoucher = (id: string) => {
    setVoucherStock(voucherStock.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)] flex items-center gap-2">
            <Gift className="w-7 h-7 text-[var(--navy)]" weight="fill" />
            Gift Card Inventory & Digital Voucher Codes Management
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Manage available brand cards, configure denomination pools, and upload digital voucher codes for automated instant redemptions.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl font-medium text-xs border border-[var(--border)]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <ShoppingBag size={16} /> Brand Gift Cards ({giftCards.length})
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'vouchers'
                ? 'bg-white text-[var(--navy)] font-bold shadow-xs'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Barcode size={16} /> Voucher Code Stock ({voucherStock.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Brand Gift Cards */}
      {activeTab === 'inventory' && (
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
                  onClick={() => window.location.href = `/admin/gift-cards/${card.id}`}
                  className="p-6 space-y-4 relative border-t-4 hover:shadow-md transition-all cursor-pointer group" 
                  style={{ borderColor: card.color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[var(--ink)] group-hover:text-[var(--navy)] transition-colors flex items-center gap-1.5">
                        <span>{card.brand}</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--navy)]" />
                      </h3>
                      <span className="text-xs text-[var(--ink-muted)] font-mono">10 Pts = ₹1 INR</span>
                    </div>
                    <Badge variant={card.isActive ? 'green' : 'gray'}>
                      {card.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-[var(--ink-muted)] font-semibold uppercase">Supported Denominations:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.denominations.map((d) => (
                        <span key={d} className="px-2.5 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-md text-xs font-mono font-bold text-[var(--ink)]">
                          ₹{d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs font-mono-num">
                    <span className="text-[var(--ink-muted)]">Stock In Vault:</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">{availableVouchers} Unused Codes</span>
                  </div>

                  <div className="pt-1 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-bold text-[var(--navy)] hover:underline">
                      View Expense & Burn Analytics &rarr;
                    </span>
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

      {/* TAB 2: Voucher Code Stock Management */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-base text-[var(--navy-deep)]">Digital Voucher Codes Inventory Vault</h2>
              <p className="text-xs text-[var(--ink-muted)]">Upload voucher codes & PINs to automate instant reward delivery to partners.</p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setAddVoucherModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Upload Voucher Stock
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--ink-muted)] uppercase tracking-wider font-display">
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
                <tbody className="divide-y divide-[var(--border)] font-mono-num">
                  {voucherStock.map((v) => (
                    <tr key={v.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--navy)] font-mono text-xs">{v.id}</td>
                      <td className="px-6 py-4 font-sans font-bold text-[var(--ink)]">{v.cardBrand}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 font-mono">₹{v.denomination}</td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <div className="font-bold text-[var(--navy)]">{v.code}</div>
                        {v.pin && <div className="text-[11px] text-[var(--ink-muted)]">PIN: {v.pin}</div>}
                      </td>
                      <td className="px-6 py-4 font-sans text-xs text-[var(--ink-muted)]">{v.expiryDate}</td>
                      <td className="px-6 py-4">
                        <Badge variant={v.isRedeemed ? 'gray' : 'green'}>
                          {v.isRedeemed ? 'Redeemed' : 'In Stock (Available)'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="danger" size="sm" onClick={() => handleDeleteVoucher(v.id)}>
                          <Trash size={14} className="mr-1" /> Delete Code
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

      {/* Modal 1: Add New Brand Card */}
      <Modal isOpen={addCardModalOpen} onClose={() => setAddCardModalOpen(false)} title="Add New Brand Gift Card">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Brand Name</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Starbucks, Uber, Zomato"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-body"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Brand Theme Accent Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-11 p-1 border border-gray-300 rounded-xl outline-none mt-1 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Denominations (Comma Separated)</label>
            <input
              type="text"
              value={denominationsStr}
              onChange={(e) => setDenominationsStr(e.target.value)}
              placeholder="100, 250, 500, 1000"
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-mono"
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
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Select Gift Card Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white font-body"
              >
                {giftCards.map((c) => (
                  <option key={c.id} value={c.brand}>{c.brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--ink)] uppercase">Denomination (₹)</label>
              <select
                value={selectedDenomination}
                onChange={(e) => setSelectedDenomination(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 bg-white font-mono"
              >
                <option value={100}>₹100</option>
                <option value={250}>₹250</option>
                <option value={500}>₹500</option>
                <option value={1000}>₹1000</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">
              Voucher Codes & PINs (One Per Line: CODE, PIN)
            </label>
            <textarea
              value={rawCodesText}
              onChange={(e) => setRawCodesText(e.target.value)}
              placeholder={`AMZN-500-9988-7766, 4321\nAMZN-500-1122-3344, 8765\nAMZN-500-5566-7788, 1234`}
              className="w-full h-32 p-3 border border-gray-300 rounded-xl text-sm font-mono outline-none mt-1"
            />
            <p className="text-[11px] text-[var(--ink-muted)] mt-1">Format: <code>VOUCHER_CODE, PIN</code> on each line.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--ink)] uppercase">Voucher Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none mt-1 font-mono"
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
