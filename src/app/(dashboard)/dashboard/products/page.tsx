'use client'

import { MoreHorizontal } from 'lucide-react'
import { useState, Suspense } from 'react'

import { ProductDialog } from '@/features/stripe/components/products/ProductDialog'

import { useFacilityProducts } from '@/core/facility/hooks/useFacilityProducts'
import { useFacilityStore } from '@/core/facility/hooks/useFacilityStore'

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui'
import { Skeleton } from '@/shared/components/ui/skeleton'

import type { FacilityProduct } from '@/shared/types/graphql'

function ProductsPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

interface ProductsListProps {
  products: FacilityProduct[]
  onArchive: (id: string) => Promise<void>
  onEdit: (product: FacilityProduct) => void
}

function ProductsList({ products, onArchive, onEdit }: ProductsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products?.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>${(product.price_amount / 100).toFixed(2)}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.description || 'No description'}
            </TableCell>
            <TableCell>{product.type}</TableCell>
            <TableCell>
              <Badge variant={product.is_active ? 'success' : 'secondary'}>
                {product.is_active ? 'Active' : 'Archived'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onArchive(product.id)}
                    className={product.is_active ? 'text-destructive' : 'text-success'}
                  >
                    {product.is_active ? 'Archive' : 'Restore'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<FacilityProduct | null>(null)
  const facilityId = useFacilityStore((state) => state.facility?.id)
  const { products, loading, archiveProduct } = useFacilityProducts({
    facilityId: facilityId || '',
  })

  if (!facilityId) return null

  const handleEdit = (product: FacilityProduct) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleArchive = async (id: string) => {
    await archiveProduct(id)
  }

  const handleDialogClose = () => {
    setSelectedProduct(null)
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <ProductsPageSkeleton />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your rental products and equipment offerings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setDialogOpen(true)}>Add Product</Button>
        </div>
      </div>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsList products={products} onArchive={handleArchive} onEdit={handleEdit} />
      </Suspense>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        facilityId={facilityId}
        product={selectedProduct}
      />
    </div>
  )
}
