import { Resend } from 'resend'
import WelcomeEmail, { type WelcomeEmailProps } from '@/emails/welcome'
import SubscriptionConfirmedEmail, {
  type SubscriptionConfirmedEmailProps,
} from '@/emails/subscription-confirmed'
import SubscriptionCanceledEmail, {
  type SubscriptionCanceledEmailProps,
} from '@/emails/subscription-canceled'
import TransactionalEmail, { type TransactionalEmailProps } from '@/emails/transactional'

const resend = new Resend(process.env.RESEND_API_KEY)

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
  const { data, error } = await resend.emails.send({
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
  const { data, error } = await resend.emails.send({
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
