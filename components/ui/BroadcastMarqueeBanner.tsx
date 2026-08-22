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

  // Single announcement item snippet
  const MarqueeSnippet = () => (
    <div className="flex items-center gap-3 px-8 shrink-0">
      <Sparkle size={13} weight="fill" className="text-amber-400 shrink-0" />
      <span className="font-bold text-amber-300 font-display tracking-tight text-xs">
        {activeBroadcast.title}
      </span>
      <span className="text-slate-400 font-mono">&mdash;</span>
      <span className="text-slate-100 font-medium text-xs tracking-wide">
        {activeBroadcast.message}
      </span>
    </div>
  );

  return (
    <div className="bg-[#0B1338] text-white py-2 px-4 border-b border-white/10 shadow-sm relative z-40 flex items-center justify-between gap-4 text-xs select-none">
      {/* Left Static Sleek Badge with Divider */}
      <div className="flex items-center gap-2.5 shrink-0 border-r border-white/15 pr-4 py-0.5">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/10 text-amber-400 font-bold text-[10px] uppercase rounded-md tracking-wider border border-amber-400/30">
          <Megaphone size={13} weight="fill" /> Announcement
        </span>
      </div>

      {/* Center Infinite Ticker Container with Smooth Fade Masking */}
      <div className="relative flex-1 overflow-hidden h-6 flex items-center [mask-image:linear-gradient(to_right,transparent_0%,black_24px,black_calc(100%-24px),transparent_100%)]">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {/* Track Copy 1 */}
          <div className="flex shrink-0 items-center">
            <MarqueeSnippet />
            <MarqueeSnippet />
          </div>
          {/* Track Copy 2 (Identical duplicate for seamless infinite -50% loop) */}
          <div className="flex shrink-0 items-center">
            <MarqueeSnippet />
            <MarqueeSnippet />
          </div>
        </div>
      </div>

      {/* Right Dismiss Button */}
      <div className="pl-2 border-l border-white/15 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X size={15} weight="bold" />
        </button>
      </div>
    </div>
  );
}
