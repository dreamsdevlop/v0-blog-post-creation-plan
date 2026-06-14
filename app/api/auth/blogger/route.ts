import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/blogger'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectUri = `${baseUrl}/api/auth/callback/google`
  
  const authUrl = getAuthUrl(redirectUri)
  
  return NextResponse.redirect(authUrl)
}
