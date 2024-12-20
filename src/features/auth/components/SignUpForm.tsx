'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input, Button, Separator } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/lib/utils/cn'
import { useAuth } from '@/shared/providers/AuthProvider'

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  })

  async function onSubmit(data: SignUpFormData) {
    try {
      await signUp(data.email, data.password, data.name)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.toLowerCase().includes('email')) {
        setError('email', { message })
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-200">
            Full name
          </label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className={cn(
              'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500',
              errors.name && 'border-red-500'
            )}
            disabled={isLoading}
            autoComplete="name"
          />
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>

        {/* Work Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-200">
            Work email
          </label>
          <Input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@facility.com"
            className={cn(
              'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500',
              errors.email && 'border-red-500'
            )}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-200">
            Password
          </label>
          <Input
            {...register('password')}
            type="password"
            id="password"
            className={cn(
              'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500',
              errors.password && 'border-red-500'
            )}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          <ul className="text-sm text-gray-400 list-disc pl-5">
            <li>At least 6 characters long</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Creating account</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <Separator className="bg-gray-700" />

      <div className="text-center text-sm">
        <span className="text-gray-400">Already have an account? </span>
        <Link
          href={ROUTES.AUTH.SIGNIN}
          className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
