import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  percentage: number;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 'md',
  showLabel = false,
  className
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const isOver = percentage > 100;

  let colorClass = 'bg-emerald-500 dark:bg-emerald-400';
  if (percentage >= 100) {
    colorClass = 'bg-rose-500 dark:bg-rose-400';
  } else if (percentage >= 75) {
    colorClass = 'bg-amber-500 dark:bg-amber-400';
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className={isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', heights[height], className)}>
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', colorClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
