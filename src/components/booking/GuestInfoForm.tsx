'use client'

import { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
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
import { useBookingStore } from '@/stores/useBookingStore'
import dayjs from 'dayjs'

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
  net_height: z.enum(['Mens', 'Womens', 'CoedPlus', 'Coed']),
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
  const { selectedAvailability } = useBookingStore()
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
      net_height: 'Mens',
      ...defaultValues,
    },
  })

  const handleFieldBlur = async (field: keyof GuestInfo) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    await trigger(field)
  }

  const showError = (field: keyof GuestInfo) => touched[field] && errors[field]

  return (
    <div className="space-y-6">
      {/* Selected Time Summary */}
      {selectedAvailability && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <h3 className="font-medium">Selected Court Time</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{dayjs(selectedAvailability.start_time).format('dddd, MMMM D, YYYY')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {dayjs(selectedAvailability.start_time).format('h:mm A')} -{' '}
                {dayjs(selectedAvailability.end_time).format('h:mm A')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Court {selectedAvailability.court_number}</span>
            </div>
          </div>
        </div>
      )}

      {/* Guest Information Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              placeholder="Acme Doe"
              {...register('name')}
              onBlur={() => handleFieldBlur('name')}
              className={showError('name') ? 'border-destructive' : ''}
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
              placeholder="acme@example.com"
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
              placeholder="(555) 123-4567"
              formatPhoneNumber
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
              defaultValue="Mens"
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
    </div>
  )
}
