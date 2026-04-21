import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export const EMERALD = '#16a34a'
export const TEXT_PRIMARY = '#0a0a0a'
export const TEXT_SECONDARY = '#4b5563'
export const TEXT_TERTIARY = '#9ca3af'
export const BORDER = '#e5e7eb'
export const SURFACE = '#ffffff'
export const SURFACE_SUBTLE = '#f9fafb'

const fontStack = 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'

export const baseText = {
  fontFamily: fontStack,
  color: TEXT_PRIMARY,
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0',
}

export const mutedText = {
  ...baseText,
  color: TEXT_SECONDARY,
}

type EmailLayoutProps = {
  preview: string
  children: React.ReactNode
  productName?: string
  footerNote?: string
}

export function EmailLayout({
  preview,
  children,
  productName = 'Your App',
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          fallbackFontFamily={['Helvetica', 'Arial']}
          webFont={{
            url: 'https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8gMEwcGFWNOITddY4.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: SURFACE_SUBTLE,
          fontFamily: fontStack,
          margin: 0,
          padding: '32px 0',
        }}
      >
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Section style={{ padding: '32px 40px 8px' }}>
            <Text
              style={{
                ...baseText,
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: EMERALD,
              }}
            >
              {productName}
            </Text>
          </Section>
          <Section style={{ padding: '8px 40px 32px' }}>{children}</Section>
          <Hr style={{ borderColor: BORDER, margin: 0 }} />
          <Section style={{ padding: '20px 40px' }}>
            <Text style={{ ...baseText, fontSize: '12px', color: TEXT_TERTIARY }}>
              {footerNote ?? `Sent by ${productName}. If this wasn't you, you can safely ignore it.`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        ...baseText,
        fontSize: '24px',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: '1.3',
        marginBottom: '16px',
      }}
    >
      {children}
    </Text>
  )
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={{ ...mutedText, marginBottom: '16px' }}>{children}</Text>
}

export function ActionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        backgroundColor: EMERALD,
        color: '#ffffff',
        fontFamily: fontStack,
        fontSize: '14px',
        fontWeight: 500,
        textDecoration: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        margin: '8px 0 16px',
      }}
    >
      {children}
    </a>
  )
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Section
      style={{
        borderTop: `1px solid ${BORDER}`,
        padding: '12px 0',
      }}
    >
      <Text style={{ ...baseText, fontSize: '12px', color: TEXT_TERTIARY, marginBottom: '2px' }}>
        {label}
      </Text>
      <Text style={{ ...baseText, fontSize: '14px', color: TEXT_PRIMARY }}>{value}</Text>
    </Section>
  )
}
