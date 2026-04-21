import {
  ActionButton,
  DetailRow,
  EmailLayout,
  Heading,
  Paragraph,
} from './components/layout'
import * as React from 'react'

export type SubscriptionConfirmedEmailProps = {
  name?: string
  planName: string
  amount: string
  interval: 'month' | 'year'
  nextBillingDate?: string
  manageUrl?: string
  productName?: string
}

export default function SubscriptionConfirmedEmail({
  name = 'there',
  planName,
  amount,
  interval,
  nextBillingDate,
  manageUrl = 'https://example.com/dashboard/billing',
  productName = 'Your App',
}: SubscriptionConfirmedEmailProps) {
  return (
    <EmailLayout
      preview={`Your ${planName} subscription is active`}
      productName={productName}
    >
      <Heading>You&apos;re on {planName}, {name}.</Heading>
      <Paragraph>
        Your subscription is active and every paid feature just unlocked. The receipt below is for
        your records.
      </Paragraph>
      <DetailRow label="Plan" value={planName} />
      <DetailRow label="Amount" value={`${amount} / ${interval}`} />
      {nextBillingDate ? <DetailRow label="Next billing date" value={nextBillingDate} /> : null}
      <div style={{ height: '12px' }} />
      <ActionButton href={manageUrl}>Manage billing</ActionButton>
    </EmailLayout>
  )
}

SubscriptionConfirmedEmail.PreviewProps = {
  name: 'Alex',
  planName: 'Pro',
  amount: '$20.00',
  interval: 'month',
  nextBillingDate: 'May 20, 2026',
  manageUrl: 'https://example.com/dashboard/billing',
  productName: 'Your App',
} satisfies SubscriptionConfirmedEmailProps
