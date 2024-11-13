'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button, success, error } from '@/components/ui'
import { useCompany } from '@/hooks/useCompany'
import { Loader2 } from 'lucide-react'
import { BaseUser } from '@/types/auth'
import { useOnboarding } from '@/hooks/useOnboarding'

const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(50, 'Company name must be less than 50 characters'),
})

type CreateCompanyFormData = z.infer<typeof createCompanySchema>

interface CreateCompanyProps {
  user: BaseUser | null
  onBack?: () => void
}

export function CreateCompany({ user, onBack }: CreateCompanyProps) {
  const { createCompany, creating } = useCompany()
  const { handleCompanyCreated } = useOnboarding()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  })

  async function handleFormSubmit(data: CreateCompanyFormData) {
    if (!user?.id) return

    try {
      const company = await createCompany(data.name)
      success('Company created successfully!')
      await handleCompanyCreated(company.id)
    } catch (err) {
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

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Company name
          </label>
          <Input
            {...register('name')}
            id="name"
            placeholder="Enter your company name"
            className={errors.name ? 'border-destructive' : ''}
            disabled={creating}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

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
            {creating ? (
              <>
                <span className="mr-2">Creating</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              'Create Company'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
