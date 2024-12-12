'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button, success, error } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { useUserStore } from '@/stores/useUserStore'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { useRef } from 'react'
const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(50, 'Company name must be less than 50 characters'),
  sports: z.string(),
  address: z.string(),
})

type CreateCompanyFormData = z.infer<typeof createCompanySchema>

interface CreateCompanyProps {
  onBack?: () => void
}

export function CreateCompany({ onBack }: CreateCompanyProps) {
  const { createCompany, creating } = useCompany()
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAP_API_KEY!,
    libraries: ['places'],
  })
  const inputRef = useRef(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      address: '',
      sports: 'volleyball',
    },
  })

  async function onSubmit(data: CreateCompanyFormData) {
    try {
      await createCompany(data.name.trim(), data.address, data.sports)

      const updatedUser = useUserStore.getState().user
      if (!updatedUser?.company_id) {
        throw new Error('Company created but user state not updated')
      }

      success('Company created successfully!')
    } catch (err) {
      console.error('Error creating company:', err)

      if (err instanceof Error) {
        if (err.message.includes('user state not updated')) {
          error('Company created but failed to update session. Please try refreshing.')
        } else {
          error(err.message)
        }
      } else {
        error('Failed to create company')
      }
    }
  }

  const handleonPlacesChanged = () => {
    const address = inputRef.current.getPlaces()
    console.log('address:', address)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Create your company</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Set up your company workspace to start managing your courts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Company name
          </label>
          <Input
            id="name"
            placeholder="Enter your company name"
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
        {/* Sports */}
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Sports category
          </label>
          <RadioGroup defaultValue="sports" {...register('sports')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="volleyball" id="volleyball" />
              <Label htmlFor="volleyball">Volleyball</Label>
            </div>
          </RadioGroup>
        </div>
        {/* Address */}
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Address
          </label>
          {isLoaded && (
            <StandaloneSearchBox
              onLoad={(ref) => (inputRef.current = ref)}
              onPlacesChanged={handleonPlacesChanged}
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
          )}
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
        {/* back and create buttons */}
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
