// Google Blogger API Integration
// Safe, official Google API for auto-posting to Blogger/Blogspot

interface BloggerPost {
  title: string
  content: string
  labels?: string[]
  isDraft?: boolean
}

interface BloggerTokens {
  access_token: string
  refresh_token: string
  expiry_date: number
}

const BLOGGER_API_BASE = 'https://www.googleapis.com/blogger/v3'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

// Get OAuth URL for user to authorize
export function getAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/blogger',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<BloggerTokens> {
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  }
}

// Refresh access token
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expiry_date: number }> {
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  }
}

// Create a new blog post on Blogger
export async function createBloggerPost(
  accessToken: string,
  post: BloggerPost
): Promise<{ id: string; url: string }> {
  const blogId = process.env.BLOGGER_BLOG_ID

  if (!blogId) {
    throw new Error('BLOGGER_BLOG_ID not configured')
  }

  const response = await fetch(
    `${BLOGGER_API_BASE}/blogs/${blogId}/posts?isDraft=${post.isDraft ?? false}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'blogger#post',
        title: post.title,
        content: post.content,
        labels: post.labels || [],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create post: ${error}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    url: data.url,
  }
}

// Update an existing blog post
export async function updateBloggerPost(
  accessToken: string,
  postId: string,
  post: Partial<BloggerPost>
): Promise<{ id: string; url: string }> {
  const blogId = process.env.BLOGGER_BLOG_ID

  if (!blogId) {
    throw new Error('BLOGGER_BLOG_ID not configured')
  }

  const response = await fetch(
    `${BLOGGER_API_BASE}/blogs/${blogId}/posts/${postId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        labels: post.labels,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update post: ${error}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    url: data.url,
  }
}

// Get blog info
export async function getBlogInfo(accessToken: string) {
  const blogId = process.env.BLOGGER_BLOG_ID

  if (!blogId) {
    throw new Error('BLOGGER_BLOG_ID not configured')
  }

  const response = await fetch(`${BLOGGER_API_BASE}/blogs/${blogId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get blog info')
  }

  return response.json()
}

// Format post content for Blogger (HTML)
export function formatForBlogger(
  content: string,
  featuredImageUrl?: string,
  videoUrl?: string
): string {
  let html = ''

  // Add featured image at top
  if (featuredImageUrl) {
    html += `<div class="featured-image" style="margin-bottom: 20px;">
      <img src="${featuredImageUrl}" alt="Featured Image" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>`
  }

  // Add video embed if from YouTube
  if (videoUrl) {
    const videoId = extractYouTubeId(videoUrl)
    if (videoId) {
      html += `<div class="video-embed" style="margin-bottom: 20px;">
        <p><em>Watch the original video:</em></p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>`
    }
  }

  // Add main content (convert markdown-style to HTML if needed)
  html += formatMarkdownToHtml(content)

  // Add affiliate disclaimer if needed
  html += `<div class="disclaimer" style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; font-size: 0.9em;">
    <p><em>This post may contain affiliate links. We earn a small commission if you make a purchase.</em></p>
  </div>`

  return html
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function formatMarkdownToHtml(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[123]>)/g, '$1')
    .replace(/(<\/h[123]>)<\/p>/g, '$1')
}
