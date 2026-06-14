import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Dark Chronicles - History, Mystery & Hidden Truths',
  description: 'Automated blog revealing the dark secrets of history, mysterious cults, and hidden truths the world forgot.',
  generator: 'v0.app',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://darkchronicles.vercel.app'),
  openGraph: {
    title: 'Dark Chronicles - History, Mystery & Hidden Truths',
    description: 'Revealing the dark secrets of history, mysterious cults, and hidden truths the world forgot.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Dark Chronicles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dark Chronicles - History, Mystery & Hidden Truths',
    description: 'Revealing the dark secrets of history, mysterious cults, and hidden truths.',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
