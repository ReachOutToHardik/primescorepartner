import React from 'react';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  // Color aliases used by admin pages
  | 'amber'
  | 'green'
  | 'gray'
  | 'blue'
  | 'red';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  showDot,
  dotColor,
  icon,
  children,
  className,
  onClick,
  ...props
}) => {
  let style: React.CSSProperties = {};
  let labelText = children;
  let computedDotColor = dotColor;

  if (status) {
    const colors = getStatusColor(status);
    style = {
      backgroundColor: colors.bg,
      color: colors.text,
    };
    computedDotColor = dotColor || colors.dot;
    if (!children) {
      labelText = getStatusLabel(status);
    }
  }

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--border)]',
    primary: 'bg-[var(--navy)]/10 text-[var(--navy)] border-[var(--navy)]/20',
    success: 'bg-[var(--green-light)] text-[#1E7B30] border-[var(--green)]/20',
    warning: 'bg-[var(--amber-light)] text-[#92610A] border-[var(--amber)]/30',
    danger: 'bg-[var(--red-light)] text-[var(--red)] border-[var(--red)]/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-[var(--surface-3)] text-[var(--ink-muted)] border-[var(--border-strong)]',
    // Color aliases
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-medium gap-1.5 rounded',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5 rounded-full',
    lg: 'px-3.5 py-1.5 text-sm font-semibold gap-2 rounded-full',
  };

  const isInteractive = Boolean(onClick);
  const displayDot = showDot !== undefined ? showDot : Boolean(status);

  return (
    <span
      onClick={onClick}
      style={style}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      className={cn(
        'inline-flex items-center justify-center font-body border border-transparent tracking-tight shrink-0 transition-all duration-150 select-none',
        !status && variantClasses[variant],
        sizeClasses[size],
        isInteractive &&
          'cursor-pointer hover:opacity-80 hover:shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)] focus-visible:ring-offset-1',
        className
      )}
      {...props}
    >
      {displayDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{
            backgroundColor: computedDotColor || 'currentColor',
          }}
        />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="truncate">{labelText}</span>
    </span>
  );
};
