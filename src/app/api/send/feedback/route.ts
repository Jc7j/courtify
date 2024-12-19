import { Resend } from 'resend'

import { FeedbackEmail } from '@/shared/components/feedback-email'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json()

    await resend.emails.send({
      from: 'Courtify Feedback <feedback@courtify.app>',
      to: 'jason.chiang@courtify.app',
      subject: 'New Feedback from Courtify User',
      react: FeedbackEmail({ feedback }),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to send feedback email:', error)
    return Response.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}
