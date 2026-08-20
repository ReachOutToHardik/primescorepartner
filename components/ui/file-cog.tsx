'use client';

import type { Variants } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

export interface FileCogIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const G_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: 360 },
};

const FileCogIcon = forwardRef<
  FileCogIconHandle,
  HTMLAttributes<HTMLDivElement> & { isLooping?: boolean }
>(({ onMouseEnter, onMouseLeave, className, isLooping = true, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    };
  });

  useEffect(() => {
    if (isLooping) {
      controls.start({
        rotate: [0, 360],
        transition: { repeat: Infinity, duration: 4, ease: 'linear' },
      });
    }
  }, [isLooping, controls]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else if (!isLooping) {
        controls.start('animate');
      }
    },
    [controls, onMouseEnter, isLooping]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else if (!isLooping) {
        controls.start('normal');
      }
    },
    [controls, onMouseLeave, isLooping]
  );

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        fill="none"
        height="28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="28"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5" />
        <motion.g
          animate={controls}
          variants={G_VARIANTS}
          style={{ transformOrigin: '6px 14px' }}
        >
          <path d="m3.2 12.9-.9-.4" />
          <path d="m3.2 15.1-.9.4" />
          <path d="m4.9 11.2-.4-.9" />
          <path d="m4.9 16.8-.4.9" />
          <path d="m7.5 10.3-.4.9" />
          <path d="m7.5 17.7-.4-.9" />
          <path d="m9.7 12.5-.9.4" />
          <path d="m9.7 15.5-.9-.4" />
          <circle cx="6" cy="14" r="3" />
        </motion.g>
      </svg>
    </div>
  );
});

FileCogIcon.displayName = 'FileCogIcon';

export { FileCogIcon };
