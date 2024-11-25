import { Metadata } from 'next'
import { ReactNode } from 'react'

interface BookingLayoutProps {
  children: ReactNode
  params: {
    slug: string
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Book a Court `,
    description: `Book a court at `,
  }
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return <div className="min-h-screen bg-background">{children}</div>
}
