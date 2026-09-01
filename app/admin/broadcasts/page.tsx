'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Megaphone,
  Plus,
  Sparkle,
  Gift,
  Warning,
  CheckCircle,
  Bell,
  Trash
} from '@phosphor-icons/react';

export default function AdminBroadcastsPage() {
  const { broadcasts, createBroadcast, toggleBroadcast, deleteBroadcast } = useAdminStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<'megaphone' | 'sparkle' | 'gift' | 'warning' | 'check' | 'bell'>('megaphone');
  const [color, setColor] = useState<'yellow' | 'red' | 'green' | 'white'>('yellow');

  const handlePublishBanner = () => {
    if (title.trim() && message.trim()) {
      createBroadcast({
        title: title.trim(),
        message: message.trim(),
        type: 'promotion',
        icon,
        color,
        isActive: true,
      });
      setTitle('');
      setMessage('');
      setIcon('megaphone');
      setColor('yellow');
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-[#0F1A4E]">
            Partner Dashboard Announcement Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live announcement banners and alert marquees displayed to all partners.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#1B2A72] hover:bg-[#152059] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} weight="bold" />
          <span>Create Announcement Banner</span>
        </Button>
      </div>

      {/* List of Announcement Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {broadcasts.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <Megaphone size={40} className="mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-semibold text-sm text-slate-600">No announcement banners published yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Create Announcement Banner&quot; to publish your first banner.</p>
          </div>
        ) : (
          broadcasts.map((b) => (
            <div
              key={b.id}
              className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                  PUBLISHED {new Date(b.publishedAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                    b.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {b.isActive ? 'Live' : 'Deactivated'}
                </span>
              </div>

              <h3 className="font-display font-bold text-base md:text-lg text-[#0F1A4E]">
                {b.title}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {b.message}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => deleteBroadcast(b.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash size={16} weight="bold" />
                </button>

                <button
                  onClick={() => toggleBroadcast(b.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer ${
                    b.isActive
                      ? 'bg-[#E63329] hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {b.isActive ? 'Deactivate Banner' : 'Activate Banner'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Banner Modal — Pixel-Matched to Specification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Announcement Banner"
      >
        <div className="space-y-4 pt-1">
          {/* TITLE */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
              TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Special Commission Bonus Active!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1B2A72] text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* SELECT ICON */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              SELECT ICON
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIcon('megaphone')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'megaphone'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Megaphone size={16} weight="fill" className={icon === 'megaphone' ? 'text-amber-400' : 'text-amber-500'} />
                <span>Megaphone</span>
              </button>

              <button
                type="button"
                onClick={() => setIcon('sparkle')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'sparkle'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Sparkle size={16} weight="fill" className={icon === 'sparkle' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Sparkle</span>
              </button>

              <button
                type="button"
                onClick={() => setIcon('gift')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'gift'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Gift size={16} weight="fill" className={icon === 'gift' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Gift Box</span>
              </button>

              <button
                type="button"
                onClick={() => setIcon('warning')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'warning'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Warning size={16} weight="fill" className={icon === 'warning' ? 'text-amber-400' : 'text-slate-500'} />
                <span>Warning</span>
              </button>

              <button
                type="button"
                onClick={() => setIcon('check')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'check'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle size={16} weight="fill" className={icon === 'check' ? 'text-emerald-300' : 'text-slate-500'} />
                <span>Success</span>
              </button>

              <button
                type="button"
                onClick={() => setIcon('bell')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  icon === 'bell'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bell size={16} weight="fill" className={icon === 'bell' ? 'text-sky-300' : 'text-slate-500'} />
                <span>Bell</span>
              </button>
            </div>
          </div>

          {/* TITLE COLOR */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              TITLE COLOR
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setColor('yellow')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  color === 'yellow'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 shrink-0" />
                <span>Yellow</span>
              </button>

              <button
                type="button"
                onClick={() => setColor('red')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  color === 'red'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-600 shrink-0" />
                <span>Red</span>
              </button>

              <button
                type="button"
                onClick={() => setColor('green')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  color === 'green'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600 shrink-0" />
                <span>Green</span>
              </button>

              <button
                type="button"
                onClick={() => setColor('white')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  color === 'white'
                    ? 'bg-[#1B2A72] text-white border-[#1B2A72] shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shrink-0" />
                <span>White</span>
              </button>
            </div>
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
              MESSAGE
            </label>
            <textarea
              rows={3}
              placeholder="Type announcement details visible to all partners..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1B2A72] text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 bg-[#ECECEC] hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublishBanner}
              disabled={!title.trim() || !message.trim()}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer ${
                title.trim() && message.trim()
                  ? 'bg-[#1B2A72] hover:bg-[#152059] shadow-xs'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Publish Banner
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
