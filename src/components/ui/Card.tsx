import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm transition-all duration-200',
        hoverable && 'card-hover cursor-pointer',
        glass && 'glass-panel',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
