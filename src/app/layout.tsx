import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import { ApolloProvider } from "@/providers/ApolloProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

import "../styles/globals.css";
import "../styles/modern-normalize.css";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Courtify",
  description: "Court booking made simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider>
          <SupabaseProvider>
            <ApolloProvider pageProps={{}}>
              {children}
            </ApolloProvider>
          </SupabaseProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
