import React from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import { UserProvider } from '@/providers/UserProvider'
import { Toaster } from '@/components/ui'

import '@/styles/globals.css'

export const metadata = {
  title: 'Courtify',
  description: 'Court rental booking system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <SupabaseProvider>
            <ApolloProvider>
              <UserProvider>
                <ThemeProvider>
                  {children}
                  <Toaster />
                </ThemeProvider>
              </UserProvider>
            </ApolloProvider>
          </SupabaseProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
