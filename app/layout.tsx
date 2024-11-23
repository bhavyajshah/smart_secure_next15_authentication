import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/providers/next-auth-provider'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/navbar'
import { ThemeProviderWrapper } from '@/components/providers/theme-provider-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NextJS Authentication',
  description: 'Secure authentication system with Next.js',
  keywords: ['Next.js', 'React', 'Authentication', 'Security'],
  authors: [{ name: 'Your Name' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProviderWrapper
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <NextAuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
              <Toaster position="top-center" />
            </div>
          </NextAuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}