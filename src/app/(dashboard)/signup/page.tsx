'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const { signUp, loading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signUp(email, 'password');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center">Courtify</h1>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Create your free account
        </h2>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="name@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        {/* Terms */}
        <p className="mt-4 text-xs text-center text-gray-600">
          By creating an account, you agree to the{' '}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Sign In Link */}
        <p className="mt-8 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link
            href={ROUTES.AUTH.SIGNIN}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 
