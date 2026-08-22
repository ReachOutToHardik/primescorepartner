'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X } from '@phosphor-icons/react';
import { useAdminStore } from '@/lib/admin-store';

export function BroadcastMarqueeBanner() {
  const broadcasts = useAdminStore((state) => state.broadcasts);
  const [dismissed, setDismissed] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<{
    id: string;
    title: string;
    message: string;
    type: string;
  } | null>(null);

  // Fetch active broadcast live from Supabase or admin-store
  useEffect(() => {
    const fetchActiveBroadcast = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data } = await supabase
          .from('broadcasts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setActiveBroadcast({
            id: data.id,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
          });
        } else if (broadcasts.length > 0) {
          const activeLocal = broadcasts.find((b) => b.isActive);
          if (activeLocal) {
            setActiveBroadcast({
              id: activeLocal.id,
              title: activeLocal.title,
              message: activeLocal.message,
              type: activeLocal.type || 'info',
            });
          } else {
            setActiveBroadcast(null);
          }
        } else {
          setActiveBroadcast(null);
        }
      } catch (err) {
        console.warn('Broadcast marquee fetch note:', err);
      }
    };

    fetchActiveBroadcast();
  }, [broadcasts]);

  // If dismissed by user or no active broadcast exists, return NOTHING (null)
  if (dismissed || !activeBroadcast) return null;

  return (
    <div className="bg-gradient-to-r from-[#0F1A4E] via-[#1B2A72] to-[#0A1238] text-white px-4 py-2 border-b border-amber-400/30 shadow-md relative z-40 overflow-hidden flex items-center justify-between gap-3 text-xs">
      {/* Background Subtle Sparkle Pulse */}
      <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />

      {/* Marquee Content */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 text-amber-950 font-bold text-[10px] uppercase rounded-full tracking-wider shrink-0 shadow-xs">
          <Megaphone size={13} weight="fill" /> Announcement
        </span>

        <div className="overflow-hidden whitespace-nowrap min-w-0 flex-1">
          <div className="inline-block animate-marquee font-medium tracking-wide">
            <span className="font-bold text-amber-300 font-display">{activeBroadcast.title}</span>
            <span className="mx-2 text-slate-300">&bull;</span>
            <span className="text-slate-100">{activeBroadcast.message}</span>
          </div>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X size={15} weight="bold" />
      </button>
    </div>
  );
}
