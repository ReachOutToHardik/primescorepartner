'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { PROFESSION_OPTIONS, INDIAN_STATES } from '@/lib/constants';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { UserPlus, User, Envelope, Phone, LockKey, MapPin, Cardholder, ShieldCheck } from '@phosphor-icons/react';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPartnerModal({ isOpen, onClose, onSuccess }: AddPartnerModalProps) {
  const { addPartnerUser } = useAdminStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Partner@2026');
  const [profession, setProfession] = useState(PROFESSION_OPTIONS[0]);
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pan, setPan] = useState('');
  const [role, setRole] = useState<'individual' | 'team_leader'>('individual');
  const [status, setStatus] = useState<'kyc_approved' | 'kyc_submitted'>('kyc_approved');
  const [teamCode, setTeamCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email address are required fields.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const res = await addPartnerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim() || 'Partner@2026',
      profession,
      city: city.trim(),
      state: stateName.trim(),
      pan: pan.trim().toUpperCase(),
      role,
      status,
      teamCode: teamCode.trim().toUpperCase(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`✓ Partner "${name}" onboarded successfully! Welcome bonus +100 Pts credited.`);
      setTimeout(() => {
        setSuccessMsg('');
        setName('');
        setEmail('');
        setPhone('');
        setPassword('Partner@2026');
        setPan('');
        setTeamCode('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setError(res.error || 'Failed to onboard partner account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Partner / Team Leader"
      description="Directly register partner accounts into Primescore DB & Supabase Auth with custom role and instant sign-up bonus."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <ShieldCheck size={18} weight="fill" className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Partner Personal Info */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1B2A72] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <User size={14} weight="bold" /> Personal & Contact Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (as per PAN) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/15 text-slate-900 font-semibold transition-all"
                />
                <User size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Primary Login) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="rohan@primescore.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/15 text-slate-900 font-mono transition-all"
                />
                <Envelope size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (WhatsApp)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/15 text-slate-900 font-mono-num transition-all"
                />
                <Phone size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Account Password
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Partner@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/15 text-slate-900 font-mono transition-all"
                />
                <LockKey size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Account Role & Operations */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1B2A72] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <UserPlus size={14} weight="bold" /> Account Configuration & Category
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Role
              </label>
              <CustomSelect
                options={[
                  { label: 'Individual Partner / DSA', value: 'individual' },
                  { label: 'Team Leader (10% Override Active)', value: 'team_leader' },
                ]}
                value={role}
                onChange={(val) => setRole(val as any)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial KYC Status
              </label>
              <CustomSelect
                options={[
                  { label: '✓ KYC Approved (Instant Active)', value: 'kyc_approved' },
                  { label: '⏳ KYC Submitted (Under Review)', value: 'kyc_submitted' },
                ]}
                value={status}
                onChange={(val) => setStatus(val as any)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profession / Category
              </label>
              <CustomSelect
                options={PROFESSION_OPTIONS}
                value={profession}
                onChange={setProfession}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location / City
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1B2A72] focus:ring-2 focus:ring-[#1B2A72]/15 text-slate-900 font-semibold transition-all"
                />
                <MapPin size={16} className="absolute right-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all text-xs"
          >
            {isSubmitting ? 'Onboarding Partner...' : 'Create & Onboard Account ✓'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
