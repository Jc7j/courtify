'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.log(data);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Work Email Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="email" 
            className="block text-[15px] font-medium text-foreground-subtle"
          >
            Work email
          </label>
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-3 py-2.5 border border-default rounded-md text-[15px] 
                bg-background-emphasis text-foreground-default
                focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-error">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="password" 
            className="block text-[15px] font-medium text-foreground-subtle"
          >
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3 py-2.5 border border-default rounded-md text-[15px]
                bg-background-emphasis text-foreground-default
                focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-error">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-md 
            hover:bg-primary-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
            disabled:opacity-50 disabled:cursor-not-allowed 
            transition-colors text-[15px] font-medium"
        >
          Continue
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-default"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background-emphasis text-foreground-muted">or</span>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-foreground-muted">Already have an account? </span>
        <a href="/signin" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </a>
      </div>
    </div>
  );
}
