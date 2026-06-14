import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/blogger'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')
  
  if (error) {
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(error)}`, request.url)
    )
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/settings?error=No authorization code', request.url)
    )
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/auth/callback/google`
    
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    
    // Store tokens securely in cookies (httpOnly)
    const cookieStore = await cookies()
    
    cookieStore.set('blogger_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })
    
    cookieStore.set('blogger_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    
    cookieStore.set('blogger_token_expiry', tokens.expiry_date.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
    
    return NextResponse.redirect(
      new URL('/admin/settings?success=blogger_connected', request.url)
    )
  } catch (err) {
    console.error('OAuth error:', err)
    return NextResponse.redirect(
      new URL('/admin/settings?error=Failed to connect Blogger', request.url)
    )
  }
}
