'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import cn from '@/lib/utils/cn'

const logoVariants = cva(
  // Base styles
  'inline-flex items-center',
  {
    variants: {
      size: {
        sm: 'h-6',    // 24px
        md: 'h-8',    // 32px
        lg: 'h-10',   // 40px
        xl: 'h-12',   // 48px
      },
      clickable: {
        true: 'cursor-pointer hover:opacity-80 transition-opacity duration-200',
        false: '',
      }
    },
    defaultVariants: {
      size: 'md',
      clickable: false,
    }
  }
)

interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string
  href?: string
}

export function Logo({ size, clickable, className, href }: LogoProps) {
  const logoContent = (
    <div className={cn(logoVariants({ size, clickable }), className)}>
      <Image 
        src="/logo.svg" 
        alt="Courtify" 
        width={120} 
        height={40}
        className="h-full w-auto"
        priority
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        {logoContent}
      </Link>
    )
  }

  return logoContent
} 

{/*
// Basic usage
<Logo />

// With specific size
<Logo size="lg" />

// As a link
<Logo href="/dashboard" clickable />

// With custom className
<Logo className="my-8" />

// All options
<Logo 
  size="xl"
  clickable
  href="/home"
  className="custom-class"
/>
*/}
