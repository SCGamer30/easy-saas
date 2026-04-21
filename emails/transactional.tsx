import { ActionButton, EmailLayout, Heading, Paragraph } from './components/layout'
import * as React from 'react'

export type TransactionalEmailProps = {
  name?: string
  productName?: string
  previewText: string
  heading: string
  bodyLines: string[]
  cta?: { label: string; url: string }
  footerNote?: string
}

// Generic base — use for one-off transactional sends (password reset,
// magic link, team invite, etc.) so you don't have to build a new template
// every time. Compose the copy as an array of paragraphs.
export default function TransactionalEmail({
  name,
  productName = 'Your App',
  previewText,
  heading,
  bodyLines,
  cta,
  footerNote,
}: TransactionalEmailProps) {
  return (
    <EmailLayout preview={previewText} productName={productName} footerNote={footerNote}>
      <Heading>{name ? `${heading}, ${name}.` : heading}</Heading>
      {bodyLines.map((line, i) => (
        <Paragraph key={i}>{line}</Paragraph>
      ))}
      {cta ? <ActionButton href={cta.url}>{cta.label}</ActionButton> : null}
    </EmailLayout>
  )
}

TransactionalEmail.PreviewProps = {
  name: 'Alex',
  productName: 'Your App',
  previewText: 'Confirm your email address',
  heading: 'One more step',
  bodyLines: [
    'Click the button below to confirm your email address. The link expires in 15 minutes.',
    "If you didn't ask for this, just ignore this email — nothing will happen.",
  ],
  cta: { label: 'Confirm email', url: 'https://example.com/verify?token=abc' },
} satisfies TransactionalEmailProps
