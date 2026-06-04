import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createBloggerPost,
  formatForBlogger,
  refreshAccessToken,
} from '@/lib/blogger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, tags, featuredImageUrl, videoUrl, isDraft } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    let accessToken = cookieStore.get('blogger_access_token')?.value
    const refreshToken = cookieStore.get('blogger_refresh_token')?.value
    const tokenExpiry = cookieStore.get('blogger_token_expiry')?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Not connected to Blogger. Please authorize first.' },
        { status: 401 }
      )
    }

    // Refresh token if expired
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry) && refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        accessToken = newTokens.access_token

        // Update cookies with new token
        cookieStore.set('blogger_access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60,
        })
        cookieStore.set('blogger_token_expiry', newTokens.expiry_date.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        })
      } catch {
        return NextResponse.json(
          { error: 'Session expired. Please reconnect to Blogger.' },
          { status: 401 }
        )
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No valid access token' },
        { status: 401 }
      )
    }

    // Format content for Blogger
    const formattedContent = formatForBlogger(content, featuredImageUrl, videoUrl)

    // Create post on Blogger
    const result = await createBloggerPost(accessToken, {
      title,
      content: formattedContent,
      labels: tags || [],
      isDraft: isDraft ?? false,
    })

    return NextResponse.json({
      success: true,
      postId: result.id,
      postUrl: result.url,
      message: isDraft ? 'Draft saved to Blogger' : 'Published to Blogger!',
    })
  } catch (error) {
    console.error('Blogger publish error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish' },
      { status: 500 }
    )
  }
}

// Check connection status
export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('blogger_access_token')?.value
  const refreshToken = cookieStore.get('blogger_refresh_token')?.value

  return NextResponse.json({
    connected: !!(accessToken || refreshToken),
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  })
}
