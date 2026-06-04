'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Video, Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export default function VideosPage() {
  const [channelUrl, setChannelUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [importedVideos, setImportedVideos] = useState<Array<{
    id: string
    title: string
    thumbnail: string
    status: 'pending' | 'processed' | 'error'
  }>>([
    {
      id: '1',
      title: 'What Really Happened at Dyatlov Pass?',
      thumbnail: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=400',
      status: 'processed',
    },
    {
      id: '2',
      title: 'The Curse of the Hope Diamond',
      thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      status: 'pending',
    },
  ])

  const handleConnect = () => {
    if (channelUrl) {
      setIsConnected(true)
    }
  }

  const handleImport = () => {
    if (videoUrl) {
      setImportedVideos([
        {
          id: Date.now().toString(),
          title: 'New Video from URL',
          thumbnail: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400',
          status: 'pending',
        },
        ...importedVideos,
      ])
      setVideoUrl('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Videos</h1>
        <p className="text-muted-foreground">Import and manage videos from your partner channel</p>
      </div>

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
          <Button variant="outline" size="sm">
            <RefreshCw data-icon="inline-start" />
            Sync Now
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
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="size-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{video.title}</h3>
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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={video.status === 'processed'}
                  >
                    Generate Post
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
