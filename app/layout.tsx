import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import '../styles/auth.css'
import '../styles/layout.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Yang - Fantastic Frontier',
  description: 'A modern social network with fantastic frontier design',
  keywords: ['social', 'network', 'fantastic', 'frontier', 'yang'],
  authors: [{ name: 'Yang Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00D4FF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
