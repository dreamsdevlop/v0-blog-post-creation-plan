'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Video, Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function VideosPage() {
  const [channelUrl, setChannelUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [importedVideos, setImportedVideos] = useState<Array<{
    id: string
    title: string
    thumbnail: string
    status: 'pending' | 'processed' | 'error'
    error?: string
  }>>([])
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

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
        status: 'pending',
      },
      ...prev,
    ])

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
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
      const response = await fetch('/api/videos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl }),
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
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to sync channel')
    } finally {
      setIsSyncing(false)
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
              Link your partner&apos;s YouTube channel for automatic video syncing
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
            <Button onClick={handleImport} disabled={!videoUrl}>
              <Video data-icon="inline-start" />
              Import Video
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
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          video.status === 'processed'
                            ? 'default'
                            : video.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {video.status === 'processed' && <CheckCircle className="size-3 mr-1" />}
                        {video.status === 'error' && <AlertCircle className="size-3 mr-1" />}
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
