import React from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

export const LogoLight: React.FC<LogoProps> = ({ className = 'h-9', height = 36 }) => {
  return (
    <svg
      viewBox="0 0 280 90"
      className={className}
      style={{ height: `${height}px`, width: 'auto' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Speedometer Gauge Arcs */}
      <path
        d="M 22 58 A 42 42 0 0 1 45 16"
        stroke="#E63329"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 52 11 A 42 42 0 0 1 95 11"
        stroke="#F5C518"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 102 16 A 42 42 0 0 1 125 58"
        stroke="#3DAA4B"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* P Loop Outer */}
      <path
        d="M 25 54 L 25 102 M 25 54 A 38 38 0 0 1 123 54 A 38 38 0 0 1 25 92"
        stroke="#1B2A72"
        strokeWidth="16"
        strokeLinecap="square"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Needle */}
      <path
        d="M 68 44 L 92 32"
        stroke="#1B2A72"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="68" cy="44" r="5" fill="#1B2A72" />

      {/* Brand Text */}
      <text
        x="138"
        y="42"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="800"
        fontSize="38"
        fill="#1B2A72"
      >
        Prime
      </text>
      <text
        x="138"
        y="80"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="800"
        fontSize="38"
        fill="#1B2A72"
      >
        Score
      </text>
    </svg>
  );
};
