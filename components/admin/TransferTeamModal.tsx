'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Partner } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import { UsersThree, UserPlus, X } from '@phosphor-icons/react';

interface TransferTeamModalProps {
  partner: Partner | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferTeamModal({ partner, isOpen, onClose }: TransferTeamModalProps) {
  const { partners } = useAdminStore();
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available team leaders excluding current partner
  const teamLeaders = partners.filter(
    (p) => p.role === 'team_leader' && p.id !== partner?.id
  );

  useEffect(() => {
    if (partner) {
      setSelectedLeaderId(partner.referredByLeaderId || '');
    }
  }, [partner, isOpen]);

  if (!partner) return null;

  const handleSaveTransfer = async () => {
    setIsSubmitting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const targetLeaderId = selectedLeaderId || null;
      const targetLeader = teamLeaders.find((tl) => tl.id === targetLeaderId);

      const { error } = await supabase
        .from('profiles')
        .update({
          referred_by_leader_id: targetLeaderId,
        })
        .eq('id', partner.id);

      if (error) {
        console.error('Transfer team leader error:', error.message);
      }

      // Update Zustand store
      const updatedPartners = useAdminStore.getState().partners.map((p) => {
        if (p.id === partner.id) {
          return {
            ...p,
            referredByLeaderId: targetLeaderId || undefined,
            referredByLeaderName: targetLeader ? targetLeader.name : undefined,
          };
        }
        return p;
      });

      useAdminStore.setState({ partners: updatedPartners });

      const msg = targetLeader
        ? `Successfully assigned "${partner.name}" under Team Leader "${targetLeader.name}".`
        : `Removed Team Leader assignment for "${partner.name}".`;

      alert(msg);
      onClose();
    } catch (err) {
      console.error('Save transfer error:', err);
      alert('Could not update team leader assignment. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign or Transfer Team Leader">
      <div className="space-y-5 py-1">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Target Partner
          </span>
          <div className="font-display font-bold text-base text-slate-900">
            {partner.name}
          </div>
          <p className="text-xs text-slate-500 font-mono-num">
            {partner.email} &bull; {partner.phone} &bull; {partner.role === 'team_leader' ? 'Team Leader' : 'Individual DSA'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Assigned Team Leader
          </label>
          <select
            value={selectedLeaderId}
            onChange={(e) => setSelectedLeaderId(e.target.value)}
            className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#1B2A72] outline-none text-slate-900 font-medium"
          >
            <option value="">No Team Leader (Standalone Partner)</option>
            {teamLeaders.map((tl) => (
              <option key={tl.id} value={tl.id}>
                {tl.name} ({tl.teamCode || 'TL-ACTIVE'}) &bull; {tl.city}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Assigning a Team Leader will place this partner under that Team Leader's network roster.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveTransfer}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <UsersThree size={16} weight="bold" />
            <span>{isSubmitting ? 'Saving...' : 'Save Team Assignment'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
