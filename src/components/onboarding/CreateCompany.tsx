'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { useCompany } from '@/hooks/useCompany'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { supabase } from '@/lib/supabase/client'

const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(50, 'Company name must be less than 50 characters'),
})

type CreateCompanyFormData = z.infer<typeof createCompanySchema>

interface CreateCompanyProps {
  onBack?: () => void
}

export function CreateCompany({ onBack }: CreateCompanyProps) {
  const { createCompany, creating, createError } = useCompany()
  const { data: session } = useSession()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  })

  async function handleFormSubmit(data: CreateCompanyFormData) {
    if (!session?.user?.id) {
      toast.error('Please sign in to create a company')
      return
    }
    console.log('Creating company...')
    try {
      const company = await createCompany(data.name)

      // Update user's company_id
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: company.id })
        .eq('id', session.user.id)

      if (updateError) {
        console.error('Error updating user:', updateError)
        throw new Error('Failed to update user company')
      }

      toast.success('Company created successfully!')
      router.push(ROUTES.DASHBOARD)
    } catch (error) {
      console.error('Create company error:', error)
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
          disabled={creating}
        />

        {createError && <p className="text-sm text-destructive">{createError.message}</p>}

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
          <Button type="submit" loading={creating} className="flex-1">
            Create Company
          </Button>
        </div>
      </form>
    </div>
  )
}
