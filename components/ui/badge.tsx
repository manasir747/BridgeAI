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
        secondary: 'border-slate-700 bg-slate-800 text-slate-200',
        destructive: 'border-transparent bg-rose-600 text-white shadow-xs',
        outline: 'border-slate-700 text-slate-300 bg-slate-900/80',
        critical: 'border-rose-500/40 bg-rose-950/40 text-rose-300 font-bold',
        high: 'border-amber-500/40 bg-amber-950/40 text-amber-300 font-semibold',
        medium: 'border-yellow-500/40 bg-yellow-950/40 text-yellow-300',
        low: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
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
