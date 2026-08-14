import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/lib/newsletter'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, firstName, lastName } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 })
    }

    const result = await subscribeToNewsletter({
      email: email.toLowerCase().trim(),
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    )
  }
}
