'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { ArrowLeft } from 'lucide-react'
import { useCourt } from '@/hooks/useCourt'

export default function CourtPage() {
  const params = useParams()
  const router = useRouter()
  const courtNumber = parseInt(params.id as string)
  const { court, courtLoading } = useCourt(courtNumber)

  if (courtLoading || !court) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="animate-pulse h-8 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{court.name}</h1>
      </div>
    </div>
  )
}
