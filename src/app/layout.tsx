import { ThemeProvider } from '@/providers/ThemeProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { Toaster } from '@/components/ui'
import { ReactNode } from 'react'
import { SessionDebug } from '@/components/debug/SessionDebug'
import { AuthProvider } from '../providers/AuthProvider'

import '@/styles/globals.css'

export const metadata = {
  title: 'Courtify',
  description: 'Court rental booking system',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ApolloProvider>
            <ThemeProvider>
              {children}
              <Toaster />
              {process.env.NODE_ENV === 'development' && <SessionDebug />}
            </ThemeProvider>
          </ApolloProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
