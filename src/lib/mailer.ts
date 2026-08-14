import { getPayload } from 'payload'
import configPromise from '@payload-config'

export type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

type MailConfig = {
  provider: string
  fromName?: string
  fromEmail?: string
  replyToEmail?: string
  // resend
  resendApiKey?: string
  // smtp
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUsername?: string
  smtpPassword?: string
  // sendgrid
  sendgridApiKey?: string
  // mailgun
  mailgunApiKey?: string
  mailgunDomain?: string
  mailgunRegion?: string
  // ses
  sesAccessKeyId?: string
  sesSecretAccessKey?: string
  sesRegion?: string
}

let cachedConfig: MailConfig | null = null

async function getMailConfig(): Promise<MailConfig | null> {
  if (cachedConfig) return cachedConfig
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'mail-settings', depth: 0 })
    if (settings?.provider) {
      cachedConfig = settings as unknown as MailConfig
      return cachedConfig
    }
  } catch {
    // DB not available — fall back to env vars below
  }
  return null
}

async function sendViaResend(config: MailConfig, email: EmailPayload): Promise<void> {
  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Resend API key not configured')

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const from = `${config.fromName || 'Your Store'} <${config.fromEmail || process.env.FROM_EMAIL || 'noreply@example.com'}>`

  const { error } = await resend.emails.send({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    ...(config.replyToEmail ? { replyTo: config.replyToEmail } : {}),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}

async function sendViaSmtp(config: MailConfig, email: EmailPayload): Promise<void> {
  const host = config.smtpHost || process.env.SMTP_HOST
  const port = config.smtpPort || Number(process.env.SMTP_PORT) || 587
  const user = config.smtpUsername || process.env.SMTP_USER
  const pass = config.smtpPassword || process.env.SMTP_PASS

  if (!host || !user || !pass) throw new Error('SMTP credentials not fully configured')

  const nodemailer = await import('nodemailer')
  const transport = nodemailer.default.createTransport({
    host,
    port,
    secure: config.smtpSecure ?? false,
    auth: { user, pass },
  })

  const from = `${config.fromName || 'Your Store'} <${config.fromEmail || user}>`

  await transport.sendMail({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    ...(config.replyToEmail ? { replyTo: config.replyToEmail } : {}),
  })
}

async function sendViaSendGrid(config: MailConfig, email: EmailPayload): Promise<void> {
  const apiKey = config.sendgridApiKey || process.env.SENDGRID_API_KEY
  if (!apiKey) throw new Error('SendGrid API key not configured')

  // Dynamic import so the package is optional at install time
  let sgMail: { default: { setApiKey: (k: string) => void; send: (msg: unknown) => Promise<unknown> } }
  try {
    sgMail = await import('@sendgrid/mail' as string) as never
  } catch {
    throw new Error('@sendgrid/mail not installed — run: pnpm add @sendgrid/mail')
  }
  sgMail.default.setApiKey(apiKey)
  const from = { name: config.fromName || 'Your Store', email: config.fromEmail || 'noreply@example.com' }
  await sgMail.default.send({
    from,
    to: email.to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    ...(config.replyToEmail ? { replyTo: config.replyToEmail } : {}),
  })
}

async function sendViaMailgun(config: MailConfig, email: EmailPayload): Promise<void> {
  const apiKey = config.mailgunApiKey || process.env.MAILGUN_API_KEY
  const domain = config.mailgunDomain || process.env.MAILGUN_DOMAIN
  if (!apiKey || !domain) throw new Error('Mailgun API key and domain required')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let MailgunMod: any
  try {
    MailgunMod = await import('mailgun.js' as string)
  } catch {
    throw new Error('mailgun.js not installed — run: pnpm add mailgun.js')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let formData: any
  try {
    const fd = await import('form-data' as string)
    formData = (fd as { default: unknown }).default ?? fd
  } catch {
    throw new Error('form-data not installed — run: pnpm add form-data')
  }

  const MailgunClass = MailgunMod.default ?? MailgunMod
  const mg = new MailgunClass(formData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (mg as any).client({
    username: 'api',
    key: apiKey,
    ...(config.mailgunRegion === 'EU' ? { url: 'https://api.eu.mailgun.net' } : {}),
  })

  const from = `${config.fromName || 'Your Store'} <${config.fromEmail || `noreply@${domain}`}>`
  await client.messages.create(domain, {
    from,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    ...(config.replyToEmail ? { 'h:Reply-To': config.replyToEmail } : {}),
  })
}

async function sendViaSes(config: MailConfig, email: EmailPayload): Promise<void> {
  const accessKeyId = config.sesAccessKeyId || process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = config.sesSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
  const region = config.sesRegion || process.env.AWS_REGION || 'eu-west-2'
  if (!accessKeyId || !secretAccessKey) throw new Error('AWS SES credentials not configured')

  let SES: { SESClient: new (opts: unknown) => unknown; SendEmailCommand: new (opts: unknown) => unknown }
  try {
    SES = await import('@aws-sdk/client-ses' as string) as never
  } catch {
    throw new Error('@aws-sdk/client-ses not installed — run: pnpm add @aws-sdk/client-ses')
  }

  const client = new SES.SESClient({ region, credentials: { accessKeyId, secretAccessKey } })
  const fromAddr = `${config.fromName || 'Your Store'} <${config.fromEmail || 'noreply@example.com'}>`

  await (client as { send: (cmd: unknown) => Promise<unknown> }).send(new SES.SendEmailCommand({
    Source: fromAddr,
    Destination: { ToAddresses: [email.to] },
    Message: {
      Subject: { Data: email.subject },
      Body: {
        Html: { Data: email.html },
        ...(email.text ? { Text: { Data: email.text } } : {}),
      },
    },
    ...(config.replyToEmail ? { ReplyToAddresses: [config.replyToEmail] } : {}),
  }))
}

/**
 * Send a transactional email via the provider configured in MailSettings CMS global.
 * Falls back to environment variables if MailSettings is not configured.
 */
export async function sendEmail(email: EmailPayload): Promise<void> {
  const config = await getMailConfig()
  const provider = config?.provider || process.env.EMAIL_PROVIDER || 'resend'

  try {
    const cfg: MailConfig = config ?? ({ provider } as MailConfig)
    switch (provider) {
      case 'smtp':
        await sendViaSmtp(cfg, email)
        break
      case 'sendgrid':
        await sendViaSendGrid(cfg, email)
        break
      case 'mailgun':
        await sendViaMailgun(cfg, email)
        break
      case 'ses':
        await sendViaSes(cfg, email)
        break
      case 'resend':
      default:
        await sendViaResend(cfg, email)
    }
    console.log(`✅ Email sent via ${provider} to ${email.to}`)
  } catch (error) {
    console.error(`❌ Failed to send email via ${provider}:`, error)
    throw error
  }
}
