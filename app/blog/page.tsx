import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Eye } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

async function getPublishedPosts(): Promise<BlogPost[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/posts`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.posts?.filter((post: BlogPost) => post.status === 'published').sort((a: BlogPost, b: BlogPost) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ) || []
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dark Chronicles</h1>
                <p className="text-xs text-muted-foreground">History, Mystery & Hidden Truths</p>
              </div>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                All Posts
              </Link>
              <Link href="/blog/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Uncover the Dark Truths of History
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            Explore mysterious events, secret societies, and forgotten histories that shaped our world. 
            Every story has a shadow side waiting to be revealed.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <main className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className={`group ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className={`overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 ${index === 0 ? 'flex flex-col md:flex-row' : ''}`}>
                    <div className={`relative overflow-hidden ${index === 0 ? 'md:w-1/2' : 'aspect-video'}`}>
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className={`size-full object-cover transition-transform group-hover:scale-105 ${index === 0 ? 'aspect-video md:aspect-auto md:h-full' : ''}`}
                      />
                    </div>
                    <div className={`p-6 ${index === 0 ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className={`font-bold text-card-foreground group-hover:text-primary transition-colors ${index === 0 ? 'text-2xl' : 'text-lg'}`}>
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {post.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dark Chronicles. All rights reserved.</p>
          <p className="mt-2">Uncovering the mysteries history tried to hide.</p>
        </div>
      </footer>
    </div>
  )
}
