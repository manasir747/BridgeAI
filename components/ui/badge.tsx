import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { UrgencyLevel } from '@/types/analysis';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-emerald-600 text-white shadow-xs',
        secondary: 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        destructive: 'border-transparent bg-rose-600 text-white shadow-xs',
        outline: 'border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs',
        critical: 'border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300 font-bold',
        high: 'border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300 font-semibold',
        medium: 'border-yellow-500/30 bg-yellow-500/12 text-yellow-800 dark:text-yellow-300',
        low: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  urgency?: UrgencyLevel;
}

export function Badge({ className, variant, urgency, ...props }: BadgeProps) {
  const resolvedVariant = urgency ? urgency : variant;
  return (
    <div
      className={cn(badgeVariants({ variant: resolvedVariant, className }))}
      {...props}
    />
  );
}
