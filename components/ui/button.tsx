import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/30',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-600/20',
        outline:
          'border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200',
        secondary:
          'bg-slate-800 text-slate-200 hover:bg-slate-700',
        ghost: 'hover:bg-slate-800 hover:text-white text-slate-400',
        link: 'text-emerald-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-sm font-semibold',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
