import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius,
  circle = false,
  className,
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = { ...style };

  if (width !== undefined) {
    customStyle.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    customStyle.height = typeof height === 'number' ? `${height}px` : height;
  }
  if (circle) {
    customStyle.borderRadius = '9999px';
  } else if (radius !== undefined) {
    customStyle.borderRadius = typeof radius === 'number' ? `${radius}px` : radius;
  }

  return (
    <div
      aria-hidden="true"
      style={customStyle}
      className={cn('skeleton inline-block shrink-0', className)}
      {...props}
    />
  );
};
