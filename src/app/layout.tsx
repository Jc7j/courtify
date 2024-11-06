import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { ApolloProvider } from '@/providers/ApolloProvider'
import { NextAuthProvider } from '@/providers/NextAuthProvider'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Courtify',
  description: 'Court rental booking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <NextAuthProvider>
          <ThemeProvider>
            <SupabaseProvider>
              <ApolloProvider>
                <main className="flex min-h-screen flex-col bg-background-default">
                  {children}
                </main>
              </ApolloProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
