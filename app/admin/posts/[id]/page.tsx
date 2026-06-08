'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, ArrowLeft, Eye, Trash2, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')

  useEffect(() => {
    fetch(`/api/posts?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!post) return
    setIsSaving(true)
    try {
      await fetch(`/api/posts?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
    router.push('/admin/posts')
  }

  const handlePublish = async () => {
    if (!post) return
    const updated = { ...post, status: 'published' as const, publishedAt: new Date().toISOString() }
    await fetch(`/api/posts?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setPost(updated)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Post not found</p>
        <Link href="/admin/posts">
          <Button variant="outline" className="mt-4">
            <ArrowLeft data-icon="inline-start" />
            Back to Posts
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Post</h1>
            <p className="text-sm text-muted-foreground">Modify and update your blog post</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
            {post.status}
          </Badge>
          {post.status === 'draft' && (
            <Button onClick={handlePublish} size="sm">
              <Eye data-icon="inline-start" />
              Publish
            </Button>
          )}
          {post.status === 'published' && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye data-icon="inline-start" />
                View Live
              </Button>
            </Link>
          )}
        </div>
      </div>

      {saved && (
        <Alert>
          <CheckCircle className="size-4 text-green-500" />
          <AlertDescription>Post saved successfully!</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Edit the main content of your post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={post.title}
                      onChange={(e) => setPost({ ...post, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={post.slug}
                      onChange={(e) => setPost({ ...post, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Excerpt</label>
                    <Textarea
                      value={post.excerpt}
                      onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content (HTML)</label>
                    <Textarea
                      value={post.content}
                      onChange={(e) => setPost({ ...post, content: e.target.value })}
                      rows={16}
                      className="font-mono text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                  <CardDescription>Search engine optimization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SEO Title</label>
                    <Input
                      value={post.seoTitle || ''}
                      onChange={(e) => setPost({ ...post, seoTitle: e.target.value })}
                      placeholder={post.title}
                    />
                    <p className="text-xs text-muted-foreground">{(post.seoTitle || post.title).length}/60 characters</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta Description</label>
                    <Textarea
                      value={post.seoDescription || ''}
                      onChange={(e) => setPost({ ...post, seoDescription: e.target.value })}
                      placeholder={post.excerpt}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">{(post.seoDescription || post.excerpt).length}/155 characters</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma-separated)</label>
                    <Input
                      value={post.tags.join(', ')}
                      onChange={(e) => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail URL</label>
                    <Input
                      value={post.thumbnail}
                      onChange={(e) => setPost({ ...post, thumbnail: e.target.value })}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>AI Model: {post.aiModel}</p>
                    <p>Views: {post.views.toLocaleString()}</p>
                    <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                      <Save data-icon="inline-start" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 data-icon="inline-start" />
                    Delete Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your post will look to readers</CardDescription>
            </CardHeader>
            <CardContent>
              <article className="prose prose-neutral dark:prose-invert max-w-none">
                <h1>{post.title}</h1>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
