'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Trash, WarningCircle } from '@phosphor-icons/react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  description?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  itemName,
  description = 'This action is permanent and cannot be undone.',
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [confirmInput, setConfirmInput] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
    }
  }, [isOpen]);

  const isConfirmed = confirmInput.trim().toUpperCase() === 'DELETE';

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isLoading) return;
    await onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5 bg-red-50 border border-red-200 p-4 rounded-xl text-red-950">
          <WarningCircle size={28} className="text-red-600 shrink-0 mt-0.5" weight="fill" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-sm text-red-900">
              Are you sure you want to delete {itemName ? <span className="underline font-mono">{itemName}</span> : 'this record'}?
            </h4>
            <p className="text-xs text-red-800 leading-relaxed font-medium">
              {description} All associated records and data will be permanently removed.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            To confirm deletion, type <span className="text-red-600 font-mono font-bold">DELETE</span> below:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Type DELETE to confirm"
            autoFocus
            className="w-full p-3 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-900 placeholder:font-sans placeholder:font-normal uppercase"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isConfirmed || isLoading}
            className={`px-5 py-2.5 font-display font-bold text-xs rounded-xl text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isConfirmed && !isLoading
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-slate-300 opacity-50 cursor-not-allowed'
            }`}
          >
            <Trash size={16} weight="bold" />
            <span>{isLoading ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
