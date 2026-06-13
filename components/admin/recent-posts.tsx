'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Eye, Trash2, AlertCircle } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
})

export function RecentPosts() {
  const { data: posts, error, isLoading, mutate } = useSWR<BlogPost[]>('/api/posts', fetcher)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="size-4 text-destructive" />
          <CardTitle className="text-sm font-medium text-destructive">Failed to load posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <p className="text-xs text-muted-foreground mt-1">Check server logs for details.</p>
        </CardContent>
      </Card>
    )
  }

  const recentPosts = posts?.slice(0, 5) ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Posts</CardTitle>
        <Link href="/admin/posts">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentPosts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No posts yet. Import a video to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-4 rounded-lg border border-border p-3"
              >
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm truncate">{post.title}</h3>
                    <Badge
                      variant={post.status === 'published' ? 'default' : 'secondary'}
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                    {' • '}
                    {post.views.toLocaleString()} views
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/admin/posts/${post.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Edit className="size-3" />
                      </Button>
                    </Link>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="size-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
