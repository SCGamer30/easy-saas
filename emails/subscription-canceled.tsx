import { ActionButton, DetailRow, EmailLayout, Heading, Paragraph } from './components/layout'
import * as React from 'react'

export type SubscriptionCanceledEmailProps = {
  name?: string
  planName: string
  endsAt: string
  resubscribeUrl?: string
  productName?: string
}

export default function SubscriptionCanceledEmail({
  name = 'there',
  planName,
  endsAt,
  resubscribeUrl = 'https://example.com/pricing',
  productName = 'Your App',
}: SubscriptionCanceledEmailProps) {
  return (
    <EmailLayout
      preview={`Your ${planName} subscription has been canceled`}
      productName={productName}
    >
      <Heading>Your subscription is canceled, {name}.</Heading>
      <Paragraph>
        You&apos;ll keep {planName} access until {endsAt}. After that, your account stays — just
        without the paid features.
      </Paragraph>
      <Paragraph>
        If we missed the mark for you, we&apos;d love to hear why. Reply to this email and a human
        will read it.
      </Paragraph>
      <DetailRow label="Plan" value={planName} />
      <DetailRow label="Access until" value={endsAt} />
      <div style={{ height: '12px' }} />
      <ActionButton href={resubscribeUrl}>Come back any time</ActionButton>
    </EmailLayout>
  )
}

SubscriptionCanceledEmail.PreviewProps = {
  name: 'Alex',
  planName: 'Pro',
  endsAt: 'May 20, 2026',
  resubscribeUrl: 'https://example.com/pricing',
  productName: 'Your App',
} satisfies SubscriptionCanceledEmailProps
