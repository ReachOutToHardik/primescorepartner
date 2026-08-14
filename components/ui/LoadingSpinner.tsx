'use client';

import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = true,
  message = 'Loading Primescore Portal...',
}) => {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-50 bg-[#0F1A4E]/90 backdrop-blur-md' : 'w-full py-16'
      } flex flex-col items-center justify-center gap-4 animate-fade-in`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute w-24 h-24 rounded-full bg-[#1B2A72]/40 animate-ping opacity-75" />

        {/* Outer Spinning Ring */}
        <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-[#F5C518] animate-spin" />

        {/* Centered Primescore Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/qr-logo.png"
            alt="Primescore"
            className="w-10 h-10 object-contain drop-shadow-md animate-pulse"
          />
        </div>
      </div>

      {message && (
        <p className="text-xs font-display font-bold text-slate-200 tracking-wider uppercase font-mono-num">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
