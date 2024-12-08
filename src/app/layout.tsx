import { ReactNode, Suspense } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { Toaster } from '@/components/ui'
import { AuthProvider } from '../providers/AuthProvider'
import { Open_Sans } from 'next/font/google'

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
            </ThemeProvider>
          </ApolloProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
