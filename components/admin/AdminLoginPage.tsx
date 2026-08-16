'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { ShieldCheck, EnvelopeSimple, Key, ArrowRight, WarningCircle } from '@phosphor-icons/react';

export default function AdminLoginPage() {
  const { adminLogin } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = adminLogin(email, password);
    if (!success) {
      setError('🔒 Access Denied: Incorrect administrator email or password. Please verify your staff credentials (e.g. admin@primescore.in).');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1A4E] via-[#121F5E] to-[#0A1238] flex items-center justify-center p-4">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <h1 className="font-display font-extrabold text-xl sm:text-2xl md:text-3xl text-white tracking-tight whitespace-nowrap">
            Primescore Partner Portal Admin
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Admin Login
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your email and password to sign in.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-shake">
              <WarningCircle size={18} className="shrink-0 text-rose-600" weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-display font-bold text-slate-700 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@primescore.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B2A72] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-display font-bold text-slate-700 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  suppressHydrationWarning
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B2A72] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B2A72] hover:bg-[#0F1A4E] text-white font-display font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Authenticate & Access HQ</span>
              <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
