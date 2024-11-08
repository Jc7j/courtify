'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  
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
    }
  });

  async function onSubmit(data: SignUpFormData) {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
      toast.success('Account created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      
      if (message.includes('email')) {
        setError('email', { message });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <Input
          {...register('name')}
          type="text"
          id="name"
          label="Full name"
          placeholder="John Doe"
          error={errors.name?.message}
          disabled={isLoading}
          size="md"
          autoComplete="name"
        />

        {/* Work Email Field */}
        <Input
          {...register('email')}
          type="email"
          id="email"
          label="Work email"
          placeholder="john@company.com"
          error={errors.email?.message}
          disabled={isLoading}
          size="md"
          autoComplete="email"
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
            autoComplete="new-password"
          />
          
          <ul className="text-sm text-foreground-muted list-disc pl-5">
            <li>At least 6 characters long</li>
          </ul>
        </div>

        {/* Continue Button */}
        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          size="md"
        >
          Create account
        </Button>
      </form>

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
