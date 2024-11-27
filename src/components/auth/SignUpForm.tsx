'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button, success, error as toastError } from '@/components/ui'
import { useAuth } from '@/providers/AuthProvider'
import { Loader2 } from 'lucide-react'
import { Separator } from '../ui/separator'
import { ROUTES } from '@/constants/routes'

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
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

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
    setIsLoading(true)
    try {
      await signUp(data.email, data.password, data.name)
      success('Account created successfully!')
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'

      if (message.toLowerCase().includes('email')) {
        setError('email', { message })
      } else {
        toastError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <Input
            {...register('name')}
            type="text"
            id="name"
            placeholder="John Doe"
            className={errors.name ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="name"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Work Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <Input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@company.com"
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            {...register('password')}
            type="password"
            id="password"
            className={errors.password ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            <li>At least 6 characters long</li>
          </ul>
        </div>

        {/* Continue Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
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

      <Separator label="or" labelPosition="center" />

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <a
          href={ROUTES.AUTH.SIGNIN}
          className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
        >
          Sign in
        </a>
      </div>
    </div>
  )
}
