'use client';

import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-default">
      <div className="w-full max-w-md p-8 space-y-6 bg-background-emphasis rounded-lg shadow-lg border border-border-default">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground-emphasis">
            Create your account
          </h1>
          <p className="mt-2 text-foreground-muted">
            Start managing your court bookings
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
} 
