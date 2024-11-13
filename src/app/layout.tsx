import { ThemeProvider } from '@/providers/ThemeProvider'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import '@/styles/globals.css'
import { Toaster } from '@/components/ui'

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
              <ThemeProvider>
                {children}
                <Toaster />
              </ThemeProvider>
            </ApolloProvider>
          </SupabaseProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
