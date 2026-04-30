import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

function originFromEnv(value: string | undefined) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const appOrigin = originFromEnv(process.env.NEXT_PUBLIC_APP_URL)
const convexOrigin = originFromEnv(process.env.NEXT_PUBLIC_CONVEX_URL)
const posthogOrigin = originFromEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST)
const sentryDsnOrigin = originFromEnv(process.env.NEXT_PUBLIC_SENTRY_DSN)

const csp = [
  ['default-src', "'self'"],
  [
    'script-src',
    "'self'",
    "'unsafe-inline'",
    'https://*.clerk.com',
    'https://*.clerk.accounts.dev',
    'https://js.stripe.com',
    'https://va.vercel-scripts.com',
  ],
  ['style-src', "'self'", "'unsafe-inline'"],
  ['img-src', "'self'", 'data:', 'blob:', 'https://img.clerk.com', 'https://images.clerk.dev'],
  ['font-src', "'self'", 'data:'],
  [
    'connect-src',
    "'self'",
    appOrigin,
    convexOrigin,
    posthogOrigin,
    sentryDsnOrigin,
    'https://*.clerk.com',
    'https://*.clerk.accounts.dev',
    'https://api.stripe.com',
    'https://r.stripe.com',
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
    'https://*.posthog.com',
    'https://*.i.posthog.com',
  ],
  [
    'frame-src',
    "'self'",
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://*.clerk.com',
  ],
  ['worker-src', "'self'", 'blob:'],
  ['media-src', "'self'", 'blob:'],
  ['object-src', "'none'"],
  ['base-uri', "'self'"],
  ['form-action', "'self'"],
  ['frame-ancestors', "'none'"],
  ['upgrade-insecure-requests'],
]
  .map((directive) => directive.filter(Boolean).join(' '))
  .join('; ')

// Standard recommended security headers. The CSP is intentionally service-aware
// so Clerk, Convex, Stripe, PostHog, Sentry, and Vercel Analytics have the
// origins they need without leaving every remote origin open.
const securityHeaders = [
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: csp,
        },
      ]
    : []),
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default withBundleAnalyzer(
  withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    sourcemaps: { deleteSourcemapsAfterUpload: true },
    widenClientFileUpload: true,
  }),
)
