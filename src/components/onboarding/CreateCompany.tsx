'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(50, 'Company name must be less than 50 characters'),
  inviteCode: z
    .string()
    .min(6, 'Invite code must be at least 6 characters')
    .max(20, 'Invite code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invite code can only contain letters, numbers, and hyphens'),
})

type CreateCompanyFormData = z.infer<typeof createCompanySchema>

interface CreateCompanyProps {
  onSubmit: (data: CreateCompanyFormData) => Promise<void>
  isLoading?: boolean
  onBack?: () => void
}

export function CreateCompany({ onSubmit, isLoading, onBack }: CreateCompanyProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  })

  const handleFormSubmit = async (data: CreateCompanyFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create company')
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground-emphasis">Create your company</h1>
        <p className="text-base text-foreground-muted leading-relaxed">
          Set up your company workspace to start managing your courts.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          {...register('name')}
          label="Company name"
          placeholder="Enter your company name"
          error={errors.name?.message}
          disabled={isLoading}
        />

        <Input
          {...register('inviteCode')}
          label="Invite code"
          placeholder="e.g., my-company"
          error={errors.inviteCode?.message}
          hint="This code will be used by team members to join your company"
          disabled={isLoading}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" loading={isLoading} className="flex-1">
            Create Company
          </Button>
        </div>
      </form>
    </div>
  )
}
