import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'tabular h-10 w-full rounded-md border border-border bg-surface-sunken px-3 text-sm text-fg',
        'transition-colors duration-[--duration-fast] placeholder:text-fg-subtle',
        'hover:border-border-strong focus:border-accent focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
