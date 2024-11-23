'use client'

import { notFound } from 'next/navigation'
import { useCompany } from '@/hooks/useCompany'
import { Skeleton } from '@/components/ui'
import { use } from 'react'
import { BookingForm } from '@/components/booking/BookingForm'

interface BookingPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = use(params)
  const { company, loading, error } = useCompany({
    slug: resolvedParams.slug,
  })

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex flex-1 bg-secondary" />
        <div className="w-full lg:w-1/2 p-8 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    notFound()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Info */}
      <div className="hidden lg:flex lg:flex-1 bg-secondary items-center justify-center p-12 sticky top-0 h-screen">
        <div className="max-w-lg space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary-foreground text-center">
              Rent Your Court at {company.name}
            </h2>
            <p className="text-secondary-foreground/80 text-center text-base leading-relaxed">
              Select your preferred court and time slot. Our easy booking system ensures a seamless
              experience for securing your next game or practice session.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Booking Form */}
      <div className="w-full lg:w-1/2 min-h-screen bg-background flex flex-col">
        <div className="flex-1 px-8 py-12 overflow-y-auto">
          <BookingForm company={company} />
        </div>

        <div className="px-8 py-6 text-sm text-muted-foreground border-t">
          <p>© {new Date().getFullYear()} Powered by Courtify. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
