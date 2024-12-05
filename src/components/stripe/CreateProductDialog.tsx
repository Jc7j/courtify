'use client'

import { useState, FormEvent } from 'react'
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { ProductType, StripePaymentType } from '@/types/graphql'
import { useCompanyProducts } from '@/hooks/useCompanyProducts'

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: ProductType.CourtRental, label: 'Court Rental' },
  { value: ProductType.Equipment, label: 'Equipment' },
]

export function CreateProductDialog() {
  const { createProduct, creating } = useCompanyProducts()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'court_rental' as ProductType,
    priceAmount: '',
    stripePaymentType: StripePaymentType.OneTime,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const response = await createProduct({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priceAmount: Math.round(parseFloat(formData.priceAmount) * 100), // Convert to cents
        stripePaymentType: formData.stripePaymentType,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setOpen(false)
      setFormData({
        name: '',
        description: '',
        type: ProductType.CourtRental,
        priceAmount: '',
        stripePaymentType: StripePaymentType.OneTime,
      })
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create a Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: ProductType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceAmount}
              onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={creating}>
            Create Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
