'use client'

import { CompanyProduct } from '@/types/graphql'
import { formatCurrency } from '@/lib/utils/format-currency'
import { CreateProductDialog } from './CreateProductDialog'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Archive, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

import { useState, useMemo } from 'react'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'
import cn from '@/lib/utils/cn'

interface ProductListProps {
  products: CompanyProduct[]
}

type ActionType = 'archive'

interface ProductAction {
  type: ActionType
  product: CompanyProduct
}

export function ProductList({ products }: ProductListProps) {
  const { archiveProduct } = useCompanyProducts()
  const [productAction, setProductAction] = useState<ProductAction | null>(null)

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [products])

  const handleEdit = (product: CompanyProduct) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product.id)
  }

  const handleActionClick = (type: ActionType, product: CompanyProduct) => {
    setProductAction({ type, product })
  }

  const handleActionConfirm = async () => {
    if (!productAction) return

    const { type, product } = productAction
    let response

    if (type === 'archive') {
      response = await archiveProduct(product.id)
    }

    if (!response?.error) {
      setProductAction(null)
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Products</h2>
        <CreateProductDialog />
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground">
            Create a product to start accepting payments
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {sortedProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{product.type.replace('_', ' ')}</Badge>
                  <Badge variant={product.is_active ? 'success' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Archived'}
                  </Badge>
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
                    <DropdownMenuItem onClick={() => handleEdit(product)} className="gap-2">
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
