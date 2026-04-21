import { ActionButton, EmailLayout, Heading, Paragraph } from './components/layout'
import * as React from 'react'

export type WelcomeEmailProps = {
  name?: string
  productName?: string
  ctaUrl?: string
}

export default function WelcomeEmail({
  name = 'there',
  productName = 'Your App',
  ctaUrl = 'https://example.com/dashboard',
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to ${productName}, ${name}`} productName={productName}>
      <Heading>Welcome, {name}.</Heading>
      <Paragraph>
        Thanks for signing up for {productName}. Your account is ready — jump in whenever you&apos;re
        set.
      </Paragraph>
      <Paragraph>
        If you hit anything confusing or have feedback in the first week, reply to this email
        directly. A real person reads every response.
      </Paragraph>
      <ActionButton href={ctaUrl}>Open your dashboard</ActionButton>
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  name: 'Alex',
  productName: 'Your App',
  ctaUrl: 'https://example.com/dashboard',
} satisfies WelcomeEmailProps
