'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/lib/admin-store';
import { 
  Key, 
  Eye, 
  EyeSlash, 
  Copy, 
  CheckCircle, 
  Sparkle, 
  ShieldCheck,
  User
} from '@phosphor-icons/react';

interface ResetPartnerPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export function ResetPartnerPasswordModal({
  isOpen,
  onClose,
  partner,
}: ResetPartnerPasswordModalProps) {
  const { updatePartnerPassword } = useAdminStore();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!partner) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'PS-';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setErrorMsg('');
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const targetIdentifier = partner.email ? partner.email.trim().toLowerCase() : partner.id;
      const res = await updatePartnerPassword(targetIdentifier, newPassword);
      if (res.success) {
        setSuccessMsg(`Password for ${partner.name} updated successfully!`);
        setTimeout(() => {
          setSuccessMsg('');
          setNewPassword('');
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setNewPassword('');
        setErrorMsg('');
        setSuccessMsg('');
        onClose();
      }}
      title="Reset Partner Password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Partner Detail Card Header */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F1A4E] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            {partner.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <h4 className="font-display font-bold text-sm text-slate-900 truncate">
              {partner.name}
            </h4>
            <p className="text-xs text-slate-500 font-mono truncate">
              {partner.email} {partner.phone ? `• ${partner.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium flex items-start gap-2">
          <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" weight="fill" />
          <span>
            Setting a new password will immediately update the login credential for <strong>{partner.name}</strong>. Share the new password securely.
          </span>
        </div>

        {/* Input & Helper Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              New Account Password
            </label>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-xs font-bold text-[#1B2A72] hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Sparkle size={13} className="text-amber-500" weight="fill" />
              <span>Auto-Generate</span>
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter new password (min. 6 chars)"
              className="w-full pl-3.5 pr-20 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#1B2A72] font-mono font-bold text-slate-950 outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {newPassword && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Copy Password"
                >
                  {copied ? <CheckCircle size={16} className="text-emerald-600" weight="fill" /> : <Copy size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" weight="fill" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || !newPassword}
            className="bg-[#0F1A4E] hover:bg-[#1B2A72] text-white font-bold"
          >
            {isSubmitting ? 'Updating...' : 'Save New Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
