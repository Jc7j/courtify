import { Open_Sans } from 'next/font/google'
import { ReactNode } from 'react'

import { Toaster } from '@/shared/components/ui'
import { ApolloProvider } from '@/shared/providers/ApolloProvider'
import { AuthProvider } from '@/shared/providers/AuthProvider'
import { ThemeProvider } from '@/shared/providers/ThemeProvider'

import '@/styles/modern-normalize.css'
import '@/styles/globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'auto',
  variable: '--font-open-sans',
})

export const metadata = {
  title: process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'Courtify',
  description: 'Court rental booking system',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={openSans.variable}>
      <body>
        <AuthProvider>
          <ApolloProvider>
            <ThemeProvider>
              {children}
              <Toaster />
              {/* <SessionDebug /> */}
            </ThemeProvider>
          </ApolloProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
