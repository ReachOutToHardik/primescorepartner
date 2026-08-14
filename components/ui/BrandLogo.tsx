import React from 'react';

interface BrandLogoProps {
  id: string;
  brand: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ id, brand, className = 'h-8' }) => {
  switch (id) {
    case 'amazon':
      return (
        <svg viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Amazon text */}
          <text x="0" y="38" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="36" fill="#000000">amazon</text>
          {/* Pay badge */}
          <rect x="135" y="10" width="60" height="32" rx="6" fill="#FF9900" />
          <text x="145" y="32" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="18" fill="#FFFFFF">pay</text>
          {/* Smile Arrow */}
          <path d="M 15 44 Q 60 58 115 42" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 110 38 L 118 43 L 110 48" fill="#FF9900" />
        </svg>
      );

    case 'flipkart':
      return (
        <svg viewBox="0 0 180 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Yellow bag icon */}
          <rect x="2" y="10" width="30" height="30" rx="4" fill="#FFE500" />
          <path d="M 10 10 C 10 2, 24 2, 24 10" stroke="#2874F0" strokeWidth="3" fill="none" />
          <text x="12" y="32" fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="22" fill="#2874F0">f</text>
          {/* Flipkart text */}
          <text x="40" y="34" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="26" fontStyle="italic" fill="#2874F0">Flipkart</text>
        </svg>
      );

    case 'swiggy':
      return (
        <svg viewBox="0 0 170 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Swiggy S logo pin */}
          <rect x="0" y="5" width="40" height="40" rx="20" fill="#FC8019" />
          <path d="M 20 12 C 14 12, 14 20, 20 22 C 26 24, 26 32, 20 32 C 14 32, 14 28, 14 28" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Swiggy text */}
          <text x="48" y="34" fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="24" fill="#FC8019" letterSpacing="1">SWIGGY</text>
        </svg>
      );

    case 'phonepay':
      return (
        <svg viewBox="0 0 170 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* PhonePe Pe container */}
          <rect x="0" y="5" width="40" height="40" rx="10" fill="#5F259F" />
          <text x="11" y="33" fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="24" fill="#FFFFFF">पे</text>
          {/* PhonePe text */}
          <text x="48" y="34" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="24" fill="#5F259F">PhonePe</text>
        </svg>
      );

    case 'myntra':
      return (
        <svg viewBox="0 0 160 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Myntra M Icon */}
          <path d="M 5 38 L 15 12 L 25 38 L 35 12 L 45 38" stroke="url(#myntraGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <defs>
            <linearGradient id="myntraGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF3F6C" />
              <stop offset="50%" stopColor="#FF9900" />
              <stop offset="100%" stopColor="#FF3F6C" />
            </linearGradient>
          </defs>
          <text x="54" y="34" fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="22" fill="#FF3F6C" letterSpacing="2">MYNTRA</text>
        </svg>
      );

    case 'irctc':
      return (
        <svg viewBox="0 0 150 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="6" width="38" height="38" rx="8" fill="#003580" />
          {/* Train icon */}
          <rect x="8" y="14" width="22" height="18" rx="3" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <circle cx="13" cy="26" r="2" fill="#FFE500" />
          <circle cx="25" cy="26" r="2" fill="#FFE500" />
          <text x="46" y="34" fontFamily="Space Grotesk, sans-serif" fontWeight="900" fontSize="24" fill="#003580" letterSpacing="1.5">IRCTC</text>
        </svg>
      );

    default:
      return (
        <div className="font-display font-bold text-slate-800 text-sm">{brand}</div>
      );
  }
};
