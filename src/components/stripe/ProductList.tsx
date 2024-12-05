'use client'

import { CompanyProduct } from '@/types/graphql'
import { formatCurrency } from '@/lib/utils/format-currency'
import { CreateProductDialog } from './CreateProductDialog'
import { MoreHorizontal, Archive, Loader2, RefreshCw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useState } from 'react'
import cn from '@/lib/utils/cn'

interface ProductListProps {
  products: CompanyProduct[]
  loading?: boolean
  syncNeeded?: boolean
  onSync: () => void
  onArchive: (productId: string) => Promise<void>
  onEdit: (product: CompanyProduct) => void
}

type ActionType = 'archive'

interface ProductAction {
  type: ActionType
  product: CompanyProduct
}

export function ProductList({
  products,
  loading,
  syncNeeded,
  onSync,
  onArchive,
  onEdit,
}: ProductListProps) {
  const [productAction, setProductAction] = useState<ProductAction | null>(null)

  const handleActionClick = (type: ActionType, product: CompanyProduct) => {
    setProductAction({ type, product })
  }

  const handleActionConfirm = async () => {
    if (!productAction) return

    const { type, product } = productAction
    if (type === 'archive') {
      await onArchive(product.id)
    }
    setProductAction(null)
  }

  const getActionContent = () => {
    if (!productAction) return null

    const { product } = productAction
    const isActive = product.is_active

    return {
      title: isActive ? 'Archive Product' : 'Restore Product',
      description: isActive
        ? `Are you sure you want to archive "${product.name}"? This will hide the product from new bookings.`
        : `Are you sure you want to restore "${product.name}"? This will make the product available for new bookings.`,
      actionLabel: isActive ? 'Archive' : 'Restore',
      loading: false,
    }
  }

  const actionContent = getActionContent()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Products</h2>
          <CreateProductDialog />
        </div>

        {syncNeeded && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/50">
            <p className="text-sm text-red-700 dark:text-red-400">
              Your database products are not in sync with your Stripe account. Could you be using a
              different Stripe account than the one connected to your company? Please contact
              support if you need help before clicking sync to update.
            </p>
            <Button onClick={onSync} variant="outline" size="sm" className="ml-4 shrink-0">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Products
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="divide-y rounded-lg border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground">
            Create a product to start accepting payments
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {product.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={product.is_active ? 'success' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Archived'}
                  </Badge>
                  <Badge variant="outline">{product.stripe_payment_type || 'one_time '}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(product.price_amount / 100, product.currency)}
                  </p>
                  {product.description && (
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuItem onClick={() => onEdit(product)} className="gap-2">
                      <span className="flex items-center gap-2 flex-1">Edit product</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleActionClick('archive', product)}
                      className={cn(
                        'gap-2',
                        product.is_active
                          ? 'text-yellow-600 dark:text-yellow-500 focus:text-yellow-600 dark:focus:text-yellow-500'
                          : 'text-emerald-600 dark:text-emerald-500 focus:text-emerald-600 dark:focus:text-emerald-500'
                      )}
                    >
                      <Archive className="h-4 w-4" />
                      <span className="flex-1">
                        {product.is_active ? 'Archive product' : 'Restore product'}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!productAction} onOpenChange={() => setProductAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>{actionContent?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionContent?.loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionContent?.loading}
            >
              {actionContent?.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                actionContent?.actionLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
