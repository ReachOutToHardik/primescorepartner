import React, { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  overlayClassName?: string;
}

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-b border-[var(--border)] shrink-0', className)}>
    {children}
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-5 overflow-y-auto flex-1 text-sm text-[var(--ink-2)]', className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'px-6 py-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-end gap-3 shrink-0',
      className
    )}
  >
    {children}
  </div>
);

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className,
  overlayClassName,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-[calc(100vw-2rem)]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with High-Grade Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnBackdropClick && onClose()}
            className={cn(
              'fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity',
              overlayClassName
            )}
            aria-hidden="true"
          />

          {/* Modal Container with smooth slide-up animation */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            className={cn(
              'relative w-full bg-[var(--white)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]',
              maxWidthClasses[maxWidth],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
                <div>
                  {title && (
                    <h3
                      id="modal-title"
                      className="text-lg font-bold text-[var(--ink)] font-display"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="text-xs text-[var(--ink-muted)] mt-0.5"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="rounded-lg p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)] transition-all ml-auto cursor-pointer"
                  >
                    <X size={20} weight="bold" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            {children && (
              <div className="px-6 py-5 overflow-y-auto flex-1 text-sm text-[var(--ink-2)]">
                {children}
              </div>
            )}

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
