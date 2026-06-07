import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getPublishedPosts } from '@/lib/data'
import { formatDistanceToNow, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Clock, Eye, ArrowLeft, Share2 } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.thumbnail],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.thumbnail],
    },
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post || post.status !== 'published') {
    notFound()
  }

  const relatedPosts = getPublishedPosts()
    .filter(p => p.id !== post.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Dark Chronicles</span>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft data-icon="inline-start" />
                All Posts
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>
              {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            </time>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {post.views.toLocaleString()} views
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Featured Image */}
          <div className="mt-8 overflow-hidden rounded-xl">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full object-cover aspect-video"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg prose-invert mt-8 max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <Separator className="my-8" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found this interesting? Share it with others.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }
              }}
            >
              <Share2 data-icon="inline-start" />
              Share
            </Button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">More Dark Chronicles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.thumbnail}
                        alt={relatedPost.title}
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {relatedPost.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dark Chronicles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
