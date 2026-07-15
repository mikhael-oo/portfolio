// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { MotionConfig } from 'framer-motion'
import LenisProvider from '@/lib/lenis'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mikhael Opeyemi-Olatunji — Software Engineer',
  description: 'Software engineer based in Vancouver, BC. Currently at Splunk.',
  metadataBase: new URL('https://mikhaelcodes.dev'),
  alternates: { canonical: 'https://mikhaelcodes.dev' },
  openGraph: {
    title: 'Mikhael Opeyemi-Olatunji',
    description: 'Full-stack engineer based in Vancouver, BC.',
    url: 'https://mikhaelcodes.dev',
    siteName: 'mikhaelcodes.dev',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mikhael Opeyemi-Olatunji',
    creator: '@tha_mikky',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={sans.variable}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('portfolio-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');})()`}
        </Script>
        <LenisProvider>
          <MotionConfig reducedMotion="user">
            {children}
          </MotionConfig>
        </LenisProvider>
      </body>
    </html>
  )
}
