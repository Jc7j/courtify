'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useFacility } from '@/core/facility/hooks/useFacility'

import { Input, Button, Label, RadioGroup, RadioGroupItem } from '@/shared/components/ui'

import type { Libraries } from '@react-google-maps/api'

const createFacilitySchema = z.object({
  name: z
    .string()
    .min(2, 'Facility name must be at least 2 characters')
    .max(50, 'Facility name must be less than 50 characters'),
  sports: z.enum(['volleyball']),
  address: z.string(),
})

type CreateFacilityFormData = z.infer<typeof createFacilitySchema>

// Define libraries array outside component to prevent rerenders
const libraries: Libraries = ['places']

export function CreateFacility({ onBack }: { onBack?: () => void }) {
  const { createFacility, creating, error: facilityError } = useFacility()
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  })

  const searchBoxRef = useRef<any | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<CreateFacilityFormData>({
    resolver: zodResolver(createFacilitySchema),
    defaultValues: {
      name: '',
      address: '',
      sports: 'volleyball',
    },
  })

  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces()
    if (!places?.length) return

    const place = places[0]
    if (place.formatted_address) {
      setValue('address', place.formatted_address)
    }
  }, [setValue])

  const onSubmit = async (data: CreateFacilityFormData) => {
    try {
      await createFacility(data.name.trim(), data.address, data.sports)
    } catch (err) {
      console.error('[Create Facility] Submit error:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        data,
      })

      if (err instanceof Error && err.message.toLowerCase().includes('name')) {
        setError('name', { message: err.message })
      } else if (err instanceof Error && err.message.toLowerCase().includes('address')) {
        setError('address', { message: err.message })
      }
    }
  }

  if (facilityError) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">{facilityError.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Create your facility</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Set up your facility to start managing your courts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Facility Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Facility name</Label>
          <Input
            id="name"
            placeholder="Enter your facility name"
            className={errors.name ? 'border-destructive' : ''}
            disabled={creating}
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Don&apos;t worry, you can change this later in settings.
            </p>
          )}
        </div>

        {/* Sports Category */}
        <div className="space-y-2">
          <Label>Sports category</Label>
          <RadioGroup defaultValue="volleyball" {...register('sports')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="volleyball" id="volleyball" />
              <Label htmlFor="volleyball">Volleyball</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          {isLoaded ? (
            <StandaloneSearchBox
              onLoad={(ref) => (searchBoxRef.current = ref)}
              onPlacesChanged={handlePlacesChanged}
            >
              <Input
                id="address"
                placeholder="Enter Address"
                className={errors.address ? 'border-destructive' : ''}
                disabled={creating}
                {...register('address')}
                aria-invalid={errors.address ? 'true' : 'false'}
              />
            </StandaloneSearchBox>
          ) : (
            <Input disabled placeholder="Loading address search..." className="bg-muted" />
          )}
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={creating}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={creating}>
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}
