'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore, PlatformService } from '@/lib/admin-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Wrench, Plus, Sparkle, PencilSimple, Coins, CurrencyInr } from '@phosphor-icons/react';

export default function AdminServicesPage() {
  const { services, rewardConfig, toggleService, addService, updateService } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);

  // New Service Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Credit Counseling');
  const [typicalFee, setTypicalFee] = useState<number>(5000);
  const [pointsReward, setPointsReward] = useState(500);
  const [description, setDescription] = useState('');

  // Editing Service State
  const [editingService, setEditingService] = useState<PlatformService | null>(null);

  const handleAddService = () => {
    if (title.trim()) {
      addService({
        title: title.trim(),
        category,
        typicalFee,
        pointsReward: Math.round(typicalFee * 0.1 * pointsPerInr),
        description: description.trim(),
        isActive: true,
      });
      setTitle('');
      setDescription('');
      setTypicalFee(5000);
      setModalOpen(false);
    }
  };

  const handleSaveEditService = () => {
    if (editingService && editingService.title.trim()) {
      const fee = editingService.typicalFee || 5000;
      updateService(editingService.id, {
        title: editingService.title.trim(),
        category: editingService.category,
        typicalFee: fee,
        pointsReward: Math.round(fee * 0.1 * pointsPerInr),
        description: editingService.description,
      });
      setEditingService(null);
    }
  };

  const pointsPerInr = rewardConfig?.pointsPerInr || 4;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={28} className="text-[var(--navy)]" weight="fill" />
            <h1 className="text-2xl font-display font-bold text-[var(--navy-deep)]">
              Primescore Services Catalog & Payout Rules
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Configure partner credit services (Rectification, Bureau Reports, Loan Advisory) and their custom point rewards & cash payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/rewards-config"
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Coins size={18} className="text-amber-600" weight="fill" />
            <span>Reward Engine Rates &rarr;</span>
          </Link>

          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        </div>
      </div>

      {/* Conversion Banner */}
      <div className="p-4 bg-gradient-to-r from-[#0F1A4E] to-[#1B2A72] text-white rounded-xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#F5C518]">
            <CurrencyInr size={22} weight="bold" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Payout Conversion</p>
            <p className="text-sm font-bold font-mono-num">
              {pointsPerInr} PrimePoints = ₹1.00 INR Cash Settlement
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-300">Default Completion Bounty</p>
          <p className="text-sm font-bold font-mono-num text-emerald-400">+{rewardConfig?.conversionPoints || 500} Pts (₹{(rewardConfig?.conversionPoints || 500) / pointsPerInr})</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => {
          const fee = srv.typicalFee || 5000;
          const silverInr = fee * 0.1;
          const goldInr = fee * 0.12;
          const platInr = fee * 0.15;
          const silverPts = Math.round(silverInr * pointsPerInr);
          const goldPts = Math.round(goldInr * pointsPerInr);
          const platPts = Math.round(platInr * pointsPerInr);

          return (
            <Card key={srv.id} className="p-6 space-y-4 relative border-l-4 border-[var(--navy)] hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{srv.category}</span>
                  <h3 className="font-display font-bold text-lg text-slate-900">{srv.title}</h3>
                </div>
                <Badge variant={srv.isActive ? 'green' : 'gray'}>
                  {srv.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>

              {/* Pricing & Commission Breakdown */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
                  <span className="font-bold text-slate-500">Standard Service Fee:</span>
                  <span className="font-mono-num font-extrabold text-sm text-slate-900">
                    ₹{fee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-1.5 bg-white border border-slate-200/80 rounded-lg">
                    <span className="text-slate-400 block font-bold text-[9px] uppercase">Silver (10%)</span>
                    <strong className="text-slate-900 font-mono-num">₹{silverInr.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-slate-500 block font-mono">+{silverPts.toLocaleString()} Pts</span>
                  </div>
                  <div className="p-1.5 bg-amber-50/60 border border-amber-200/70 rounded-lg">
                    <span className="text-amber-700 block font-bold text-[9px] uppercase">Gold (12%)</span>
                    <strong className="text-amber-950 font-mono-num">₹{goldInr.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-amber-700 block font-mono">+{goldPts.toLocaleString()} Pts</span>
                  </div>
                  <div className="p-1.5 bg-indigo-50/60 border border-indigo-200/70 rounded-lg">
                    <span className="text-indigo-700 block font-bold text-[9px] uppercase">Plat (15%)</span>
                    <strong className="text-indigo-950 font-mono-num">₹{platInr.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-indigo-700 block font-mono">+{platPts.toLocaleString()} Pts</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Commission credited directly as PrimePoints
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService({ ...srv })}
                    className="p-2 text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Service"
                  >
                    <PencilSimple size={18} />
                  </button>

                  <Button
                    variant={srv.isActive ? 'danger' : 'secondary'}
                    size="sm"
                    onClick={() => toggleService(srv.id)}
                  >
                    {srv.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add New Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Primescore Service Offering"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Service Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High-Risk CIBIL Rectification"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[var(--navy)] outline-none mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 bg-white"
              >
                <option value="Credit Counseling">Credit Counseling</option>
                <option value="Bureau Analysis">Bureau Analysis</option>
                <option value="Legal Dispute">Legal Dispute</option>
                <option value="Loan Advisory">Loan Advisory</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Standard Service Fee (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-4 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={typicalFee}
                  onChange={(e) => setTypicalFee(parseInt(e.target.value) || 5000)}
                  className="w-full pl-7 pr-3 py-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Silver (10%): ₹{(typicalFee * 0.1).toFixed(0)} • Gold (12%): ₹{(typicalFee * 0.12).toFixed(0)}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of service and bureau rectification process..."
              className="w-full h-20 p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddService} disabled={!title.trim()}>
              Create Service
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          title="Edit Primescore Service Offering"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Service Title</label>
              <input
                type="text"
                value={editingService.title}
                onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[var(--navy)] outline-none mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 bg-white"
                >
                  <option value="Credit Counseling">Credit Counseling</option>
                  <option value="Bureau Analysis">Bureau Analysis</option>
                  <option value="Legal Dispute">Legal Dispute</option>
                  <option value="Loan Advisory">Loan Advisory</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Standard Service Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-4 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={editingService.typicalFee || 5000}
                    onChange={(e) => setEditingService({ ...editingService, typicalFee: parseInt(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Silver 10%: ₹{((editingService.typicalFee || 5000) * 0.1).toFixed(0)} • Gold 12%: ₹{((editingService.typicalFee || 5000) * 0.12).toFixed(0)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full h-20 p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditService} disabled={!editingService.title.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
