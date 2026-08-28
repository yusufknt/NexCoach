import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Email notifications will be disabled.')
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export const EMAIL_CONFIG = {
  from: 'NexCoach <notify@resend.dev>',
  appName: 'NexCoach',
} as const
