import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'kyc_approved' | 'pending';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Partner',
  size = 'md',
  status,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold font-mono-num text-white bg-gradient-to-br from-[#1B2A72] to-[#0F1A4E] shadow-sm border-2 border-white overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            status === 'kyc_approved' || status === 'online'
              ? 'bg-emerald-500'
              : 'bg-amber-400'
          }`}
        />
      )}
    </div>
  );
};
