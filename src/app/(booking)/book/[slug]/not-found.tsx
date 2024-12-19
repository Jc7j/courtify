import Link from 'next/link'

import { Button } from '@/shared/components/ui'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Facility Not Found</h1>
        <p className="text-muted-foreground">
          The facility you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
