'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, Sparkle } from '@phosphor-icons/react';
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

  // Repeat text item component for seamless infinite marquee loop
  const MarqueeItem = () => (
    <span className="inline-flex items-center gap-2.5 px-6">
      <Sparkle size={13} weight="fill" className="text-amber-400 shrink-0" />
      <span className="font-bold text-amber-300 font-display tracking-tight text-xs">
        {activeBroadcast.title}
      </span>
      <span className="text-amber-200/50">&mdash;</span>
      <span className="text-slate-100 font-medium text-xs tracking-wide">
        {activeBroadcast.message}
      </span>
    </span>
  );

  return (
    <div className="bg-gradient-to-r from-[#091136] via-[#121E5C] to-[#0A1238] text-white py-2 px-3 border-b border-amber-400/30 shadow-md relative z-40 overflow-hidden flex items-center justify-between gap-3 text-xs select-none">
      {/* Background Subtle Shimmer Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />

      {/* Left Static Announcement Pill Badge */}
      <div className="flex items-center gap-2 shrink-0 z-10 pl-1">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider shadow-sm border border-amber-300/40">
          <Megaphone size={13} weight="fill" className="animate-bounce text-slate-950" />
          <span>Announcement</span>
        </span>
      </div>

      {/* Center Seamless Infinite Scrolling Marquee Container */}
      <div className="overflow-hidden whitespace-nowrap min-w-0 flex-1 relative flex items-center">
        <div className="inline-flex animate-marquee hover:[animation-play-state:paused] cursor-pointer py-0.5">
          {/* Repeat 4 times for seamless unbroken looping */}
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
        </div>
      </div>

      {/* Right Dismiss X Button */}
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 hover:bg-white/15 rounded-full text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer z-10"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X size={15} weight="bold" />
      </button>
    </div>
  );
}
