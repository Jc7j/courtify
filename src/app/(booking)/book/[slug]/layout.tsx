import { Metadata } from 'next'
import { ReactNode } from 'react'

interface BookingLayoutProps {
  children: ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BookingLayoutProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Book a Court ${slug}`,
    description: `Book a court at `,
  }
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return <div className="min-h-screen bg-background">{children}</div>
}
