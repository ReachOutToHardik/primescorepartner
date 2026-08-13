import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixIcon,
      suffixIcon,
      containerClassName,
      className,
      id: customId,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const id = customId || autoId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const startIcon = leftIcon || prefixIcon;
    const endIcon = rightIcon || suffixIcon;

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-[var(--red)] ml-1">*</span>}
            </span>
          </label>
        )}
        <div className="relative flex items-center w-full">
          {startIcon && (
            <div className="absolute left-3 text-[var(--ink-muted)] pointer-events-none flex items-center justify-center shrink-0">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full bg-[var(--white)] text-[var(--ink)] text-sm rounded-lg border transition-all duration-150 ease-in-out font-body',
              'placeholder:text-[var(--ink-subtle)]',
              'py-2 px-3',
              startIcon ? 'pl-9' : '',
              endIcon ? 'pr-9' : '',
              // Hover state
              'hover:border-[var(--ink-subtle)]',
              // Focus-visible ring with --navy color
              'focus:outline-none focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)] focus-visible:ring-offset-1',
              // Active state
              'active:border-[var(--navy-mid)]',
              // Disabled state
              'disabled:bg-[var(--surface-2)] disabled:text-[var(--ink-muted)] disabled:border-[var(--border)] disabled:cursor-not-allowed disabled:hover:border-[var(--border)]',
              // Error state overriding border & ring
              error
                ? 'border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/20'
                : 'border-[var(--border-strong)]',
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 text-[var(--ink-muted)] flex items-center justify-center shrink-0">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-[var(--red)] font-medium flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[var(--ink-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
