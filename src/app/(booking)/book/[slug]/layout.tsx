import { Suspense, ReactNode } from 'react'

interface BookingLayoutProps {
  children: ReactNode
}

export default function BookingLayout({ children }: BookingLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
