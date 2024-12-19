'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Clock, Calendar } from 'lucide-react'
import { useState, useImperativeHandle, RefObject } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Card,
  Checkbox,
  Label,
} from '@/shared/components/ui'
import { cn } from '@/shared/lib/utils/cn'
import { CompanyProduct } from '@/shared/types/graphql'

import { GuestDetailsType, ProductInfo } from '../../types'

const guestDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format'),
  net_height: z.enum(['Mens', 'Womens', 'CoedPlus', 'Coed']),
  selectedCourtProduct: z.custom<ProductInfo>(),
  selectedEquipment: z.array(z.custom<ProductInfo>()),
})

type FormRef = {
  submit: () => void
}

interface GuestDetailsProps {
  onSubmit: (data: GuestDetailsType) => void
  loading?: boolean
  products: CompanyProduct[]
  defaultValues?: Partial<GuestDetailsType>
  selectedTime?: {
    start_time: string
    end_time: string
  }
  formRef?: RefObject<FormRef>
}

const NET_HEIGHT_OPTIONS = [
  { value: 'Mens', label: "Men's" },
  { value: 'Womens', label: "Women's" },
  { value: 'CoedPlus', label: 'Co-ed+' },
  { value: 'Coed', label: 'Co-ed' },
] as const

export function GuestDetails({
  onSubmit,
  loading,
  products,
  defaultValues,
  selectedTime,
  formRef,
}: GuestDetailsProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof GuestDetailsType, boolean>>>({})

  const courtProducts = products.filter((p) => p.type === 'court_rental')
  const equipmentProducts = products.filter((p) => p.type === 'equipment')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<GuestDetailsType>({
    resolver: zodResolver(guestDetailsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      net_height: 'Mens',
      selectedCourtProduct: courtProducts[0] || undefined,
      selectedEquipment: [],
      ...defaultValues,
    },
  })

  useImperativeHandle(formRef, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  const selectedEquipment = watch('selectedEquipment')

  function handleFieldBlur(field: keyof GuestDetailsType) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    trigger(field)
  }

  const showError = (field: keyof GuestDetailsType) => touched[field] && errors[field]

  const handleEquipmentChange = (product: CompanyProduct, checked: boolean) => {
    if (checked) {
      setValue('selectedEquipment', [...selectedEquipment, product])
    } else {
      setValue(
        'selectedEquipment',
        selectedEquipment.filter((p) => p.id !== product.id)
      )
    }
  }

  return (
    <div className="space-y-8">
      {/* Selected Time Card */}
      {selectedTime && (
        <Card className="overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="text-lg">
                  {dayjs(selectedTime.start_time).format('dddd, MMMM D, YYYY')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="text-lg">
                  {dayjs(selectedTime.start_time).format('h:mm A')} -{' '}
                  {dayjs(selectedTime.end_time).format('h:mm A')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Guest Details Form */}
      <Card>
        <div className="bg-primary/5 border-b p-4">
          <h3 className="text-lg font-semibold text-primary">Your Details</h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Contact Details Section */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    {...register('name')}
                    onBlur={() => handleFieldBlur('name')}
                    className={cn(
                      'transition-colors',
                      showError('name') ? 'border-destructive' : ''
                    )}
                    disabled={loading}
                  />
                  {showError('name') && (
                    <p className="text-sm text-destructive">{errors.name?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    onBlur={() => handleFieldBlur('email')}
                    className={cn(showError('email') ? 'border-destructive' : '')}
                    disabled={loading}
                  />
                  {showError('email') && (
                    <p className="text-sm text-destructive">{errors.email?.message}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    formatPhoneNumber
                    {...register('phone')}
                    onBlur={() => handleFieldBlur('phone')}
                    className={cn(showError('phone') ? 'border-destructive' : '')}
                    disabled={loading}
                  />
                  {showError('phone') && (
                    <p className="text-sm text-destructive">{errors.phone?.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Court Options Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-base">Court Options</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Court Product Selection */}
                {courtProducts.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Court Type</label>
                    <Select
                      defaultValue={courtProducts[0]?.id}
                      onValueChange={(value) => {
                        const product = courtProducts.find((p) => p.id === value)
                        if (product) {
                          setValue('selectedCourtProduct', product)
                        }
                        handleFieldBlur('selectedCourtProduct')
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full h-fit">
                        <SelectValue placeholder="Select court type" />
                      </SelectTrigger>
                      <SelectContent>
                        {courtProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex flex-col py-1 w-full">
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium">{product.name}</span>

                                <span className="text-primary font-medium ml-4">
                                  ${(product.price_amount / 100).toFixed(2)}
                                </span>
                              </div>
                              {product.description && (
                                <span className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                  {product.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Net Height Selection */}
                <div className="space-y-2">
                  <label htmlFor="net_height" className="text-sm font-medium">
                    Net Height
                  </label>
                  <Select
                    defaultValue="Mens"
                    onValueChange={(value) => {
                      setValue('net_height', value as GuestDetailsType['net_height'])
                      handleFieldBlur('net_height')
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger id="net_height" className="w-full">
                      <SelectValue placeholder="Select net height" />
                    </SelectTrigger>
                    <SelectContent>
                      {NET_HEIGHT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showError('net_height') && (
                    <p className="text-sm text-destructive">{errors.net_height?.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment Selection */}
            {equipmentProducts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Additional Equipment</h4>
                <Card className="divide-y">
                  {equipmentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={product.id}
                        checked={selectedEquipment.some((p) => p.id === product.id)}
                        onCheckedChange={(checked) =>
                          handleEquipmentChange(product, checked as boolean)
                        }
                        className="mr-4"
                      />
                      <Label htmlFor={product.id} className="flex-1 cursor-pointer select-none">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                            )}
                          </div>
                          <span className="text-primary font-medium ml-4">
                            ${(product.price_amount / 100).toFixed(2)}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
