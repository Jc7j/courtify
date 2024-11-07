'use client';

import React from 'react';
import { SignUpForm } from '@/components/auth/SignUpForm';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image 
            src="/logo.svg" 
            alt="Courtify" 
            width={120} 
            height={40}
            priority
          />
        </div>
        
        {/* Title */}
        <h1 className="text-[32px] font-semibold text-center text-gray-900">
          Create your free account
        </h1>
        
        {/* Form */}
        <SignUpForm />
      </div>
    </div>
  );
} 
