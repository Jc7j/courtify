import { ThemeProvider } from '@/providers/ThemeProvider'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import { UserProvider } from '@/providers/UserProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { Toaster } from '@/components/ui'
import { SessionDebug } from '@/components/debug/SessionDebug'

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
          <ApolloProvider>
            <UserProvider>
              <ThemeProvider>
                {children}
                <Toaster />
                {process.env.NODE_ENV === 'development' && <SessionDebug />}
              </ThemeProvider>
            </UserProvider>
          </ApolloProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
