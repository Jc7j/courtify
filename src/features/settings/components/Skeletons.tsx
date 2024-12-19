'use client'

import React from 'react'

import { Card, CardContent, CardFooter, Skeleton } from '@/shared/components/ui'

export function MembersSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>

      <Skeleton className="h-5 w-32" />

      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton(): React.ReactElement {
  return (
    <div className="p-8">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-8 mt-8">
        <div className="space-y-4">
          <Skeleton className="h-[120px] w-full" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompanyProfileSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[120px] w-full" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}

export function DeleteSectionSkeleton(): React.ReactElement {
  return <Skeleton className="h-[72px] w-full" />
}

export function AccountSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4 flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="p-4 flex items-center justify-between gap-4 border-t">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-72" />
        </div>
      </Card>
    </div>
  )
}

export function PaymentProcessorSkeleton(): React.ReactElement {
  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 mt-8">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </CardFooter>
    </Card>
  )
}
