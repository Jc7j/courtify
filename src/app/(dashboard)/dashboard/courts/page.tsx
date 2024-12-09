'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button, error as toastError, success as toastSuccess, Card } from '@/components/ui'
import { useCourt } from '@/hooks/useCourt'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { useCompany } from '@/hooks/useCompany'
import { useStripe } from '@/hooks/useStripe'
import { StripeStatus } from '@/types/stripe'
import { toast } from 'sonner'
import { ProductList } from '@/components/stripe/ProductList'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'
import type { CompanyProduct } from '@/types/graphql'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CourtsList } from '@/components/courts/CourtsList'
import { Info, Plus } from 'lucide-react'
import { CreateProductDialog } from '@/components/stripe/CreateProductDialog'

dayjs.extend(relativeTime)

export default function CourtsPage() {
  const router = useRouter()
  const { company } = useCompany()
  const { checkStripeStatus } = useStripe()
  const { courts, loading: courtsLoading, error, createCourt, creating, refetch } = useCourt()
  const { listProducts, archiveProduct, syncProducts, products, loadingProducts } =
    useCompanyProducts()

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [syncNeeded, setSyncNeeded] = useState(false)

  const handleSync = useCallback(async () => {
    await syncProducts()
  }, [syncProducts])

  const handleArchive = useCallback(
    async (productId: string) => {
      const result = await archiveProduct(productId)
      if (!result.error) {
        const productsResult = await listProducts()
        if (!productsResult.error) {
          setSyncNeeded(productsResult.syncNeeded)
        }
      }
    },
    [archiveProduct, listProducts]
  )

  const handleEdit = useCallback((product: CompanyProduct) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product.id)
  }, [])

  async function handleCreateCourt(name: string) {
    try {
      await createCourt(name)
      toastSuccess('Court created successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create court')
    }
  }

  function handleCourtClick(courtNumber: number) {
    router.push(`${ROUTES.DASHBOARD.HOME}/courts/${courtNumber}`)
  }

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      if (!company?.id || !company.stripe_account_id) return
      try {
        const status = await checkStripeStatus()
        if (!mounted) return

        if (status.error) {
          toast.error(status.error)
          return
        }

        setStripeStatus(status)

        if (status.isConnected && status.isEnabled) {
          const result = await listProducts()
          if (result.error) {
            toast.error(result.error)
            return
          }
          setSyncNeeded(result.syncNeeded)
        }
      } catch (error) {
        console.error('[CourtsPage] Error fetching data:', error)
        toast.error('Failed to fetch data')
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [company?.id, company?.stripe_account_id])

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Courts</h1>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>Failed to load courts. Please try again later.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Court & Product Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your courts, schedules, and rental products all in one place.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Total Courts</span>
              <span className="text-2xl font-bold mt-2">{courts.length}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {courts.length === 0 ? 'No courts added yet' : 'Courts available for booking'}
              </span>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Active Products</span>
              <span className="text-2xl font-bold mt-2">
                {products.filter((p: CompanyProduct) => p.is_active).length}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Products available for purchase
              </span>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Payment Status</span>
              <span className="text-2xl font-bold mt-2">
                {stripeStatus?.isEnabled ? 'Ready' : 'Not Connected'}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {stripeStatus?.isEnabled
                  ? 'Ready to accept payments'
                  : 'Connect Stripe to accept payments'}
              </span>
            </div>
          </Card>
        </div>

        {/* Courts Section */}
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
          <CourtsList
            courts={courts}
            loading={courtsLoading}
            creating={creating}
            onCreateCourt={handleCreateCourt}
            onCourtClick={handleCourtClick}
          />
        </Card>

        {/* Products Section */}
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Products & Pricing</h2>
                <p className="text-sm text-muted-foreground">
                  Configure court rentals and equipment offerings
                </p>
              </div>
              {stripeStatus?.isConnected && stripeStatus.isEnabled && <CreateProductDialog />}
            </div>

            {stripeStatus?.isConnected && stripeStatus.isEnabled ? (
              <ProductList
                products={products}
                loading={loadingProducts}
                syncNeeded={syncNeeded}
                onSync={handleSync}
                onArchive={handleArchive}
                onEdit={handleEdit}
              />
            ) : (
              <div className="rounded-lg border bg-muted/5 p-8">
                <div className="flex items-start space-x-4">
                  <Info className="h-6 w-6 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Payment Processing Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your Stripe account to start managing products and accepting payments.
                    </p>
                    <a
                      href={ROUTES.DASHBOARD.SETTINGS.PAYMENT_PROCESSOR}
                      className="inline-flex items-center text-primary hover:underline text-sm font-medium group"
                    >
                      Go to Payment Settings
                      <span className="ml-1 group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
