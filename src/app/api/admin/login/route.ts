import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() ?? 'admin@techbro.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

export async function POST(request: Request) {
  const body = await request.json()
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-auth', '1', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
}
