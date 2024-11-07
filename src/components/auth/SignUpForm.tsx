'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

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
    setIsLoading(true);
    try {
      console.log(data);
      // Handle submission
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Work Email Field */}
        <Input
          {...register('email')}
          type="email"
          id="email"
          label="Work email"
          error={errors.email?.message}
          disabled={isLoading}
          size="md"
        />

        {/* Password Field */}
        <div className="space-y-2">
          <Input
            {...register('password')}
            type="password"
            id="password"
            label="Password"
            error={errors.password?.message}
            disabled={isLoading}
            size="md"
          />
          
          <ul className="text-sm text-foreground-muted list-disc pl-5 space-y-1">
            <li>At least 8 characters long</li>
          </ul>
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          size="md"
        >
          Continue
        </Button>
      </form>

      {/* Divider */}
      <Divider 
        label="or" 
        labelPosition="center"
        variant="default"
      />

      {/* Sign In Link */}
      <div className="text-center text-sm">
        <span className="text-foreground-muted">Already have an account? </span>
        <a href="/signin" 
           className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200">
          Sign in
        </a>
      </div>
    </div>
  );
}
