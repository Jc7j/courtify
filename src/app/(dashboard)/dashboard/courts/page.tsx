'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { useCalendarStore } from '@/features/availability/hooks/useCalendarStore'
import { CourtList } from '@/features/courts/components/CourtList'
import { CourtsErrorBoundary } from '@/features/courts/components/CourtsErrorBoundary'
import { QuickStatsSkeleton } from '@/features/courts/components/Skeletons'
import { useCourt } from '@/features/courts/hooks/useCourt'
import { ProductsSection } from '@/features/stripe/components/ProductsSection'
import { useStripe } from '@/features/stripe/hooks/useStripe'

import { useCompanyProducts } from '@/core/company/hooks/useCompanyProducts'
import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { Button, Card, ErrorToast, SuccessToast } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'

import type { CompanyProduct } from '@/shared/types/graphql'
import type { StripeStatus } from '@/shared/types/stripe'

function QuickStats({
  courts,
  products,
  stripeStatus,
}: {
  courts: number
  products: number
  stripeStatus: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Total Courts</span>
          <span className="text-2xl font-bold mt-2">{courts}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {courts === 0 ? 'No courts added yet' : 'Courts available for booking'}
          </span>
        </div>
      </Card>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Active Products</span>
          <span className="text-2xl font-bold mt-2">{products}</span>
          <span className="text-xs text-muted-foreground mt-1">
            Products available for purchase
          </span>
        </div>
      </Card>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
          <span className="text-2xl font-bold mt-2">{stripeStatus}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {stripeStatus === 'Ready'
              ? 'Ready to accept payments'
              : 'Connect Stripe to accept payments'}
          </span>
        </div>
      </Card>
    </div>
  )
}

export default function CourtsPage() {
  const router = useRouter()
  const company = useCompanyStore((state) => state.company)
  const { checkStripeStatus } = useStripe()
  const { courts, loading: courtsLoading, createCourt, creating } = useCourt()
  const { listProducts, archiveProduct, syncProducts, products, loadingProducts } =
    useCompanyProducts({
      companyId: company?.id,
    })
  const setCalendarSettings = useCalendarStore((state) => state.setSettings)

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [syncNeeded, setSyncNeeded] = useState(false)

  // Initialize calendar settings
  useEffect(() => {
    setCalendarSettings({
      slotMinTime: '06:00:00',
      slotMaxTime: '23:00:00',
      isFullHeight: true,
    })
  }, [setCalendarSettings])

  const handleCreateCourt = useCallback(
    async (name: string) => {
      try {
        await createCourt(name)
        SuccessToast('Court created successfully')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to create court')
      }
    },
    [createCourt]
  )

  const handleCourtClick = useCallback(
    (courtNumber: number) => {
      router.push(`${ROUTES.DASHBOARD.HOME}/courts/${courtNumber}`)
    },
    [router]
  )

  const handleSync = () => syncProducts()
  const handleArchive = async (productId: string) => {
    const result = await archiveProduct(productId)
    if (!result.error) {
      const productsResult = await listProducts()
      if (!productsResult.error) {
        setSyncNeeded(productsResult.syncNeeded)
      }
    }
  }

  useEffect(() => {
    let mounted = true

    async function fetchStripeStatus() {
      if (!company?.id || !company.stripe_account_id) return
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error) {
          ErrorToast(status.error)
          return
        }

        setStripeStatus(status)
      } catch (error) {
        if (!mounted) return
        console.error('[CourtsPage] Error fetching data:', error)
        ErrorToast('Failed to fetch data')
      }
    }

    fetchStripeStatus()
    return () => {
      mounted = false
    }
  }, [company?.id, company?.stripe_account_id, checkStripeStatus])

  useEffect(() => {
    if (!stripeStatus?.isConnected || !stripeStatus.isEnabled) return

    let mounted = true

    async function syncProductsStatus() {
      try {
        const result = await listProducts()
        if (!mounted) return

        if (result.error) {
          ErrorToast(result.error)
          return
        }
        setSyncNeeded(result.syncNeeded)
      } catch (error) {
        if (!mounted) return
        ErrorToast(
          `Failed to sync products: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    syncProductsStatus()
    return () => {
      mounted = false
    }
  }, [stripeStatus?.isConnected, stripeStatus?.isEnabled, listProducts])

  return (
    <CourtsErrorBoundary>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Court & Product Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courts, schedules, and rental products all in one place.
          </p>
        </div>

        <div className="grid gap-8">
          <Suspense fallback={<QuickStatsSkeleton />}>
            <QuickStats
              courts={courts.length}
              products={products.filter((p: CompanyProduct) => p.is_active).length}
              stripeStatus={stripeStatus?.isEnabled ? 'Ready' : 'Not Connected'}
            />
          </Suspense>

          <Card className="p-6 space-y-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Court Management</h2>
                <p className="text-sm text-muted-foreground">
                  Add and manage courts, set schedules, and track bookings
                </p>
              </div>
              <Button
                variant="outline"
                className="text-primary hover:text-primary-foreground hover:bg-primary"
                onClick={() => handleCreateCourt('New Court')}
                disabled={creating}
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Court
              </Button>
            </div>
            <CourtList
              courts={courts}
              loading={courtsLoading}
              creating={creating}
              onCreateCourt={handleCreateCourt}
              onCourtClick={handleCourtClick}
            />
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <ProductsSection
              stripeStatus={stripeStatus}
              products={products}
              loadingProducts={loadingProducts}
              syncNeeded={syncNeeded}
              onSync={handleSync}
              onArchive={handleArchive}
            />
          </Card>
        </div>
      </div>
    </CourtsErrorBoundary>
  )
}
