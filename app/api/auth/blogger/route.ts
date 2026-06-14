import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/blogger'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectUri = `${baseUrl}/api/auth/callback/google`
  
  console.log('[Blogger Auth] baseUrl:', baseUrl)
  console.log('[Blogger Auth] redirectUri:', redirectUri)
  console.log('[Blogger Auth] NEXT_PUBLIC_SITE_URL env:', process.env.NEXT_PUBLIC_SITE_URL)
  
  const authUrl = getAuthUrl(redirectUri)
  
  return NextResponse.redirect(authUrl)
}
