'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input, Button, SuccessToast, ErrorToast } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/shared/providers/AuthProvider'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(data: SignInFormData) {
    setIsLoading(true)
    try {
      await signIn(data.email, data.password)
      SuccessToast('Signed in successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'

      if (message.toLowerCase().includes('invalid credentials')) {
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      } else {
        ErrorToast(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="Enter your email"
            error={errors.email?.message}
            disabled={isLoading}
            autoComplete="email"
          />

          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button type="submit" loading={isLoading} fullWidth>
            Sign in
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <a
            href={ROUTES.AUTH.SIGNUP}
            className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
