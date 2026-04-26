import { Resend } from 'resend'
import WelcomeEmail, { type WelcomeEmailProps } from '@/emails/welcome'
import SubscriptionConfirmedEmail, {
  type SubscriptionConfirmedEmailProps,
} from '@/emails/subscription-confirmed'
import SubscriptionCanceledEmail, {
  type SubscriptionCanceledEmailProps,
} from '@/emails/subscription-canceled'
import TransactionalEmail, { type TransactionalEmailProps } from '@/emails/transactional'

// Lazy-init so a missing RESEND_API_KEY doesn't crash module loads at
// build time. Helpers throw `ResendNotConfiguredError` only when actually
// called without a key — never at import.
export class ResendNotConfiguredError extends Error {
  constructor() {
    super(
      'Resend is not configured for this project. Set RESEND_API_KEY in .env.local — run /setup or grab a key from https://resend.com/api-keys.',
    )
    this.name = 'ResendNotConfiguredError'
  }
}

let _resend: Resend | null = null

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

function getResend(): Resend {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) throw new ResendNotConfiguredError()
  _resend = new Resend(key)
  return _resend
}

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@yourdomain.com'

type SendOptions = {
  to: string
  from?: string
  replyTo?: string
}

async function send({
  to,
  from,
  replyTo,
  subject,
  react,
}: SendOptions & { subject: string; react: React.ReactElement }) {
  const { data, error } = await getResend().emails.send({
    from: from ?? FROM_EMAIL,
    to,
    subject,
    react,
    replyTo,
  })

  if (error) throw new Error(error.message)
  return data
}

// Plain-HTML fallback for ad-hoc sends that don't use a React Email template.
export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendOptions & { subject: string; html: string }) {
  const { data, error } = await getResend().emails.send({
    from: from ?? FROM_EMAIL,
    to,
    subject,
    html,
    replyTo,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function sendWelcomeEmail(opts: SendOptions & WelcomeEmailProps) {
  const { to, from, replyTo, ...props } = opts
  return send({
    to,
    from,
    replyTo,
    subject: `Welcome to ${props.productName ?? 'Your App'}`,
    react: WelcomeEmail(props),
  })
}

export async function sendSubscriptionConfirmedEmail(
  opts: SendOptions & SubscriptionConfirmedEmailProps,
) {
  const { to, from, replyTo, ...props } = opts
  return send({
    to,
    from,
    replyTo,
    subject: `Your ${props.planName} subscription is active`,
    react: SubscriptionConfirmedEmail(props),
  })
}

export async function sendSubscriptionCanceledEmail(
  opts: SendOptions & SubscriptionCanceledEmailProps,
) {
  const { to, from, replyTo, ...props } = opts
  return send({
    to,
    from,
    replyTo,
    subject: `Your ${props.planName} subscription was canceled`,
    react: SubscriptionCanceledEmail(props),
  })
}

export async function sendTransactionalEmail(
  opts: SendOptions & TransactionalEmailProps & { subject: string },
) {
  const { to, from, replyTo, subject, ...props } = opts
  return send({
    to,
    from,
    replyTo,
    subject,
    react: TransactionalEmail(props),
  })
}
