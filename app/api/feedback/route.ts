import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { checkRateLimit } from '@/lib/ratelimit'
import { isResendConfigured } from '@/lib/resend'
import { Resend } from 'resend'

const feedbackSchema = z.object({
  message: z.string().min(1).max(2000),
  page: z.string().url().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success, reset } = await checkRateLimit('email', userId)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))) },
      },
    )
  }

  const parsed = feedbackSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { message, page } = parsed.data
  const toEmail = process.env.FROM_EMAIL ?? process.env.FEEDBACK_EMAIL

  // If Resend isn't configured, log to console in dev and succeed silently in prod
  if (!isResendConfigured() || !toEmail) {
    if (process.env.NODE_ENV === 'development') {
      // In dev without Resend, just log so the widget still works
      console.info('[feedback]', { userId, message, page })
    }
    return NextResponse.json({ ok: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: toEmail,
      to: toEmail,
      subject: `Feedback from user ${userId}`,
      text: [`User: ${userId}`, page ? `Page: ${page}` : null, '', message]
        .filter(Boolean)
        .join('\n'),
    })
  } catch (err) {
    Sentry.captureException(err)
    // Don't surface email failures to the user — feedback was captured
  }

  return NextResponse.json({ ok: true })
}
