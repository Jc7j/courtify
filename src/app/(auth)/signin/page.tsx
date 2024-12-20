'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Input, Button } from '@/shared/components/ui'
import { ASSET_PATHS, ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/shared/providers/AuthProvider'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const { signIn, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(data: SignInFormData) {
    try {
      await signIn(data.email, data.password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      if (message.toLowerCase().includes('invalid')) {
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0">
          <Image
            src={`${ASSET_PATHS.IMAGES}/volleyball.png`}
            alt="Volleyball Court"
            className="w-full h-full object-cover"
            fill
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Sign in to Courtify</h1>
              <p className="text-base text-gray-400">
                Welcome back! Please enter your details to continue.
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

            <div className="text-center text-sm">
              <span className="text-gray-300">Don&apos;t have an account? </span>
              <Link
                href={ROUTES.AUTH.SIGNUP}
                className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
