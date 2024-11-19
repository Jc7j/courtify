'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button, success, error } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'


const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(50, 'Company name must be less than 50 characters'),
  sports: z.string(),
  address: z.string(),
  businessinfo: z.string(),
})

type CreateCompanyFormData = z.infer<typeof createCompanySchema>

interface CreateCompanyProps {
  onBack?: () => void
}

export function CreateCompany({ onBack }: CreateCompanyProps) {
  const { createCompany, creating } = useCompany()

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
      businessinfo: 'businessinfo',
    },
  })

  const onSubmit = async (data: CreateCompanyFormData) => {
    console.log('Form submitted:', data)

    try {
      await createCompany(data.name, data.address, data.sports, data.businessinfo)
      success('Company created successfully!')
    } catch (err) {
      console.error('Error creating company:', err)
      error(err instanceof Error ? err.message : 'Failed to create company')
    }
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
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
          <Input
            id="address"
            placeholder="Enter Address"
            className={errors.address ? 'border-destructive' : ''}
            disabled={creating}
            {...register('address')}
            aria-invalid={errors.address ? 'true' : 'false'}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
        {/* Company info import from google maps api */}
        <div className="space-y-2">
          <div className="items-top flex space-x-2">
            <Checkbox id="businessinfo" {...register('businessinfo')} />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="businessinfo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Would you like to import business information from google?
              </label>
              <p className="text-sm text-muted-foreground">
                You agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
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
            Create Company
          </Button>
        </div>
      </form>
    </div>
  )
}
