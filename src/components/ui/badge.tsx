import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary hover:bg-primary/20 border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent',
        success: 'bg-success/10 text-success hover:bg-success/20 border-transparent',
        warning: 'bg-warning/10 text-warning hover:bg-warning/20 border-transparent',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent',
        info: 'bg-info/10 text-info hover:bg-info/20 border-transparent',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground border-transparent',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  clickable?: boolean
}

function Badge({ className, variant, size, clickable, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        clickable && 'cursor-pointer active:scale-95',
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

/* 
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Blocked</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>

// Interactive badge
<Badge clickable onClick={() => {}}>
  Clickable
</Badge>

// Ghost and outline variants
<Badge variant="ghost">Ghost</Badge>
<Badge variant="outline">Outline</Badge>
*/
