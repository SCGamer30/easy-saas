import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/cookie-consent'
import { FeedbackButton } from '@/components/feedback-button'

export const metadata: Metadata = {
  title: 'App',
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          {/* Remove <CookieConsent /> if your app doesn't use tracking cookies */}
          <CookieConsent />
          {/* Remove <FeedbackButton /> if you don't want in-app feedback collection */}
          <FeedbackButton />
        </Providers>
      </body>
    </html>
  )
}
