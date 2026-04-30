import './globals.css'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/cookie-consent'
import { FeedbackButton } from '@/components/feedback-button'
import { generateMeta } from '@/lib/metadata'

const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'Easy SaaS'

export const metadata = generateMeta({
  title: productName,
  description: 'Production-ready SaaS starter with auth, database, email, analytics, and billing.',
})

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
