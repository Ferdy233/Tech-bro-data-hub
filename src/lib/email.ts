import { Resend } from 'resend'

export async function sendAdminAlertEmail(options: {
  subject: string
  html: string
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ALERT_EMAIL_RECIPIENT
  const from = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !to) {
    return {
      sent: false,
      error: 'Email alerts are not configured. Set RESEND_API_KEY and ALERT_EMAIL_RECIPIENT.',
    }
  }

  if (!from) {
    return {
      sent: false,
      error: 'RESEND_FROM_EMAIL is not set. Use a verified sender address from your Resend dashboard.',
    }
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to,
    subject: options.subject,
    html: options.html,
  })

  if (error) {
    console.error('Resend send failed:', error)
    return { sent: false, error: error.message }
  }

  return { sent: true }
}
