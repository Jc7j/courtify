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
import { Plus } from 'lucide-react'

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
    stripePaymentType: 'one_time' as StripePaymentType,
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log('🚀 Starting form submission with data:', formData)

    try {
      console.log('📤 Calling createProduct with:', {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        priceAmount: Math.round(parseFloat(formData.priceAmount) * 100),
        stripePaymentType: 'one_time' as StripePaymentType,
      })

      const response = await createProduct({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        priceAmount: Math.round(parseFloat(formData.priceAmount) * 100),
        stripePaymentType: 'one_time' as StripePaymentType,
      })

      console.log('📥 Create product response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      setOpen(false)
      setFormData({
        name: '',
        description: '',
        type: 'court_rental' as ProductType,
        priceAmount: '',
        stripePaymentType: 'one_time' as StripePaymentType,
      })
    } catch (error) {
      console.error('❌ Form submission error:', {
        error,
        formData,
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-primary hover:text-primary-foreground hover:bg-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
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
