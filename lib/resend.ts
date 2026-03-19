import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Update FROM_EMAIL to your verified Resend domain address
const FROM_EMAIL = 'noreply@yourdomain.com'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })

  if (error) throw new Error(error.message)
  return data
}
