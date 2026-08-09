import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'tabular h-10 w-full rounded-md border border-control bg-background px-3 text-sm text-foreground',
        'transition-colors duration-[--duration-fast] placeholder:text-muted-foreground',
        'hover:border-foreground/20 focus:border-foreground focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
