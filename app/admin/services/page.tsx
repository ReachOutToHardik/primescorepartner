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
  const [pointsReward, setPointsReward] = useState(500);
  const [description, setDescription] = useState('');

  // Editing Service State
  const [editingService, setEditingService] = useState<PlatformService | null>(null);

  const handleAddService = () => {
    if (title.trim()) {
      addService({
        title: title.trim(),
        category,
        pointsReward,
        description: description.trim(),
        isActive: true,
      });
      setTitle('');
      setDescription('');
      setModalOpen(false);
    }
  };

  const handleSaveEditService = () => {
    if (editingService && editingService.title.trim()) {
      updateService(editingService.id, {
        title: editingService.title.trim(),
        category: editingService.category,
        pointsReward: editingService.pointsReward,
        description: editingService.description,
      });
      setEditingService(null);
    }
  };

  const pointsPerInr = rewardConfig?.pointsPerInr || 10;

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
          const cashValue = srv.pointsReward / pointsPerInr;
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

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                    +{srv.pointsReward} Points
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 ml-2 font-mono-num">
                    (₹{cashValue.toFixed(2)} INR Cash)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingService({ ...srv })}
                    className="p-2 text-slate-500 hover:text-[var(--navy)] hover:bg-slate-100 rounded-lg transition-colors"
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
              <label className="text-xs font-semibold text-slate-700">Points Reward Payout</label>
              <input
                type="number"
                value={pointsReward}
                onChange={(e) => setPointsReward(parseInt(e.target.value) || 500)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Cash: ₹{(pointsReward / pointsPerInr).toFixed(2)} INR</p>
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
                <label className="text-xs font-semibold text-slate-700">Points Reward Payout</label>
                <input
                  type="number"
                  value={editingService.pointsReward}
                  onChange={(e) => setEditingService({ ...editingService, pointsReward: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none mt-1 font-mono font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">Cash: ₹{(editingService.pointsReward / pointsPerInr).toFixed(2)} INR</p>
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
