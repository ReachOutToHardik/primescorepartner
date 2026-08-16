import React from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium font-body whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)] focus-visible:ring-offset-2';

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[var(--navy)] text-white hover:bg-[var(--navy-mid)] active:bg-[var(--navy-deep)] disabled:bg-[var(--navy)]/50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs',
      secondary:
        'bg-[var(--surface-2)] text-[var(--ink)] border border-transparent hover:bg-[var(--surface-3)] active:bg-[var(--border)] disabled:bg-[var(--surface-2)]/50 disabled:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:active:scale-100',
      outline:
        'bg-transparent text-[var(--ink)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:border-[var(--ink)] active:bg-[var(--surface-3)] disabled:border-[var(--border)] disabled:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:active:scale-100',
      ghost:
        'bg-transparent text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] active:bg-[var(--surface-3)] disabled:text-[var(--ink-subtle)] disabled:cursor-not-allowed disabled:active:scale-100',
      danger:
        'bg-[var(--red)] text-white hover:bg-[#D02B22] active:bg-[#B91C1C] focus-visible:ring-[var(--red)] disabled:bg-[var(--red)]/50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm rounded-lg gap-2 min-h-[40px]',
      lg: 'px-6 py-3 text-base rounded-lg gap-2.5 min-h-[48px]',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          isDisabled ? 'pointer-events-none opacity-65' : '',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="relative flex items-center justify-center shrink-0">
            <CircleNotch className="animate-spin text-current" size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
            <img src="/qr-logo.png" alt="" className="absolute w-2.5 h-2.5 object-contain" />
          </div>
        ) : leftIcon ? (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        ) : null}
        
        {children && <span className="whitespace-nowrap inline-block">{children}</span>}

        {!isLoading && rightIcon ? (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
