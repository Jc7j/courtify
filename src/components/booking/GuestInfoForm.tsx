'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from '@/components/ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const guestInfoSchema = z.object({
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
  net_height: z.enum(['7-feet', '7-feet-4-1/8-inches', '8-feet']),
})

export type GuestInfo = z.infer<typeof guestInfoSchema>

interface GuestInfoFormProps {
  defaultValues?: Partial<GuestInfo>
  onSubmit: (data: GuestInfo) => void
  loading?: boolean
}

const NET_HEIGHT_OPTIONS = [
  { value: 'Mens', label: "Men's" },
  { value: 'Womens', label: "Women's" },
  { value: 'CoedPlus', label: 'Co-ed+' },
  { value: 'Coed', label: 'Co-ed' },
] as const

export function GuestInfoForm({ defaultValues, onSubmit, loading }: GuestInfoFormProps) {
  const [touched, setTouched] = useState<Partial<Record<keyof GuestInfo, boolean>>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<GuestInfo>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      net_height: '7-feet',
      ...defaultValues,
    },
  })

  const handleFieldBlur = async (field: keyof GuestInfo) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    await trigger(field)
  }

  const showError = (field: keyof GuestInfo) => touched[field] && errors[field]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="name"
            {...register('name')}
            onBlur={() => handleFieldBlur('name')}
            className={showError('name') ? 'border-destructive' : ''}
            disabled={loading}
          />
          {showError('name') && <p className="text-sm text-destructive">{errors.name?.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            onBlur={() => handleFieldBlur('email')}
            className={showError('email') ? 'border-destructive' : ''}
            disabled={loading}
          />
          {showError('email') && (
            <p className="text-sm text-destructive">{errors.email?.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            onBlur={() => handleFieldBlur('phone')}
            className={showError('phone') ? 'border-destructive' : ''}
            disabled={loading}
          />
          {showError('phone') && (
            <p className="text-sm text-destructive">{errors.phone?.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="net_height" className="text-sm font-medium">
            Net Height
          </label>
          <Select
            defaultValue={defaultValues?.net_height || '7-feet'}
            onValueChange={(value) => {
              setValue('net_height', value as GuestInfo['net_height'])
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
    </form>
  )
}
