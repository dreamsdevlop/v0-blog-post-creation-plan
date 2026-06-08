'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Video, Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle, Loader2, FileText, Wand2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function VideosPage() {
  const { data: videosData, mutate: mutateVideos } = useSWR<{ videos: Array<{ id: string; title: string; thumbnail: string; description?: string }> }>('/api/videos', fetcher)
  const [channelUrl, setChannelUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [importedVideos, setImportedVideos] = useState<Array<{
    id: string
    title: string
    thumbnail: string
    status: 'pending' | 'processed' | 'error' | 'transcript_ready'
    error?: string
    transcript?: string
    isGenerating?: boolean
  }>>([])
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string; transcript?: string } | null>(null)
  const [generatedContent, setGeneratedContent] = useState<{ title: string; content: string; excerpt: string } | null>(null)
  const [isGeneratingPost, setIsGeneratingPost] = useState(false)

  useEffect(() => {
    if (videosData?.videos) {
      setImportedVideos(
        videosData.videos.map(v => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail,
          status: 'processed' as const,
          transcript: v.description?.includes('[TRANSCRIPT]') ? v.description.split('[TRANSCRIPT]')[1]?.trim() : undefined,
        }))
      )
    }
  }, [videosData])

  const handleConnect = async () => {
    if (!channelUrl) return
    setIsConnected(true)
  }

  const handleImport = async () => {
    if (!videoUrl) return

    setIsImporting(true)
    setImportError(null)

    const tempId = crypto.randomUUID()
    setImportedVideos(prev => [
      {
        id: tempId,
        title: 'Importing...',
        thumbnail: '',
        status: 'pending' as const,
      },
      ...prev,
    ])

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, autoFetchTranscript: true }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import video')
      }

      setImportedVideos(prev =>
        prev.map(video =>
          video.id === tempId
            ? {
                id: data.video.id,
                title: data.video.title,
                thumbnail: data.video.thumbnail,
                status: 'processed' as const,
              }
            : video
        )
      )
      setVideoUrl('')
    } catch (error) {
      setImportedVideos(prev =>
        prev.map(video =>
          video.id === tempId
            ? {
                ...video,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Import failed',
                title: 'Import failed',
              }
            : video
        )
      )
      setImportError(error instanceof Error ? error.message : 'Failed to import video')
    } finally {
      setIsImporting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setImportError(null)

    try {
      const response = await fetch('/api/channels/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUrl,
          maxVideos: 10,
          autoFetchTranscript: true,
          autoGeneratePosts: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync channel')
      }

      if (data.videos && data.videos.length > 0) {
        setImportedVideos(prev => [
          ...data.videos.map((v: { id: string; title: string; thumbnail: string }) => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            status: 'processed' as const,
          })),
          ...prev,
        ])
      }
      mutateVideos()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to sync channel')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleFetchTranscript = async (videoId: string) => {
    setImportedVideos(prev =>
      prev.map(v =>
        v.id === videoId ? { ...v, status: 'pending' as const } : v
      )
    )

    try {
      const response = await fetch('/api/videos/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcript')
      }

      setImportedVideos(prev =>
        prev.map(v =>
          v.id === videoId
            ? {
                ...v,
                status: 'transcript_ready' as const,
                transcript: data.transcript,
              }
            : v
        )
      )

      // Update the video in the list
      mutateVideos()
    } catch (error) {
      setImportedVideos(prev =>
        prev.map(v =>
          v.id === videoId
            ? {
                ...v,
                status: 'processed' as const,
                error: error instanceof Error ? error.message : 'Transcript fetch failed',
              }
            : v
        )
      )
    }
  }

  const handleGeneratePost = async (videoId: string, videoTitle: string, transcript?: string) => {
    if (!transcript) {
      setImportError('No transcript available. Please fetch transcript first.')
      return
    }

    setIsGeneratingPost(true)
    setSelectedVideo({ id: videoId, title: videoTitle, transcript })
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          videoTitle,
          settings: {
            model: 'deepseek',
            tone: 'mysterious',
            length: 'medium',
            includeCallToAction: true,
            addAffiliateLinks: false,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate post')
      }

      const result = await response.json()
      setGeneratedContent(result)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to generate post')
    } finally {
      setIsGeneratingPost(false)
    }
  }

  const handleSavePost = async () => {
    if (!generatedContent || !selectedVideo) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          title: generatedContent.title,
          slug: generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
          content: generatedContent.content,
          excerpt: generatedContent.excerpt,
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
          publishedAt: new Date().toISOString(),
          status: 'draft',
          seoTitle: generatedContent.title.slice(0, 60),
          seoDescription: generatedContent.excerpt.slice(0, 155),
          tags: ['history', 'mystery'],
          views: 0,
          aiModel: 'deepseek',
        }),
      })

      if (response.ok) {
        setSelectedVideo(null)
        setGeneratedContent(null)
        alert('Post saved as draft!')
      }
    } catch (error) {
      setImportError('Failed to save post')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Videos</h1>
        <p className="text-muted-foreground">Import and manage videos from your partner channel</p>
      </div>

      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connect Partner Channel</CardTitle>
            <CardDescription>
              Link your partner's YouTube channel for automatic video syncing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <Alert>
                <CheckCircle className="size-4 text-green-500" />
                <AlertDescription>
                  Channel connected successfully. New videos will be synced automatically.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel URL</label>
                  <Input
                    placeholder="https://youtube.com/@channel-name"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleConnect} disabled={!channelUrl}>
                  <LinkIcon data-icon="inline-start" />
                  Connect Channel
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Single Video</CardTitle>
            <CardDescription>
              Manually import a specific video by pasting its URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleImport} disabled={!videoUrl || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  Importing...
                </>
              ) : (
                <>
                  <Video data-icon="inline-start" />
                  Import Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Imported Videos</CardTitle>
            <CardDescription>
              Videos ready to be transformed into blog posts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing || !isConnected}>
            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} data-icon="inline-start" />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardHeader>
        <CardContent>
          {importedVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No videos imported yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {importedVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="size-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-muted flex items-center justify-center">
                      <Video className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{video.title}</h3>
                    {video.error && (
                      <p className="text-xs text-destructive mt-1">{video.error}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          video.status === 'transcript_ready'
                            ? 'default'
                            : video.status === 'processed'
                            ? 'secondary'
                            : video.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {video.status === 'transcript_ready' && <CheckCircle className="size-3 mr-1" />}
                        {video.status === 'processed' && <CheckCircle className="size-3 mr-1" />}
                        {video.status === 'error' && <AlertCircle className="size-3 mr-1" />}
                        {video.status === 'pending' && <Loader2 className="size-3 mr-1 animate-spin" />}
                        {video.status}
                      </Badge>
                      {video.transcript && (
                        <Badge variant="outline" className="text-xs">
                          Transcript available
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {video.status !== 'transcript_ready' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFetchTranscript(video.id)}
                          disabled={video.status === 'pending'}
                        >
                          <FileText className="size-3 mr-1" />
                          Fetch Transcript
                        </Button>
                      )}
                      {video.status === 'transcript_ready' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleGeneratePost(video.id, video.title, video.transcript)}
                          disabled={isGeneratingPost}
                        >
                          {isGeneratingPost ? (
                            <>
                              <Loader2 className="size-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="size-3 mr-1" />
                              Generate Post
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript Preview Modal */}
      {selectedVideo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Transcript: {selectedVideo.title}</CardTitle>
                <CardDescription>
                  {selectedVideo.transcript ? `${selectedVideo.transcript.split(/\s+/).length} words` : 'No transcript'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedVideo(null); setGeneratedContent(null) }}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedVideo.transcript && (
              <Textarea
                value={selectedVideo.transcript}
                readOnly
                className="h-48 text-sm"
              />
            )}
            {generatedContent && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Generated Post Preview</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Title: {generatedContent.title}</p>
                  <p className="text-sm text-muted-foreground">Excerpt: {generatedContent.excerpt}</p>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: generatedContent.content }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSavePost}>Save as Draft</Button>
                  <Button variant="outline" onClick={() => setGeneratedContent(null)}>Discard</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
