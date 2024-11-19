import { Metadata } from 'next'

interface BookingLayoutProps {
  children: React.ReactNode
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
