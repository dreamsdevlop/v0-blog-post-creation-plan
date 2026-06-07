import { getPublishedPosts } from '@/lib/data'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  const posts = await getPublishedPosts()

  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n')}
    </item>
  `).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dark Chronicles - History, Mystery & Hidden Truths</title>
    <link>${baseUrl}</link>
    <description>Revealing the dark secrets of history, mysterious cults, and hidden truths the world forgot.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
