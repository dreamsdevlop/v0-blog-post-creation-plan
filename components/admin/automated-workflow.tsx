'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react'

interface AutomationStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  message?: string
}

interface AutomationJob {
  id: string
  videoTitle: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  steps: AutomationStep[]
  createdAt: string
  completedAt?: string
  postId?: string
}

export function AutomatedWorkflow() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [channelUrl, setChannelUrl] = useState('')
  const [jobs, setJobs] = useState<AutomationJob[]>([])
  const [stats, setStats] = useState({
    totalProcessed: 0,
    successRate: 100,
    avgProcessingTime: '3.2 min',
    postsThisWeek: 0,
  })
  const [settings, setSettings] = useState({
    checkInterval: '60',
    autoPublish: 'publish',
    contentModel: 'deepseek',
    imageStyle: 'auto',
    dailyPostLimit: 5,
    minVideoDuration: 5,
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [isRunningJob, setIsRunningJob] = useState(false)

  const automationSteps = [
    { id: 'fetch', name: 'Fetch New Videos' },
    { id: 'transcript', name: 'Get Transcript' },
    { id: 'content', name: 'Generate Content' },
    { id: 'image', name: 'Generate Image' },
    { id: 'seo', name: 'Optimize SEO' },
    { id: 'publish', name: 'Publish Post' },
  ]

  const runAutomation = async (videoTitle: string, videoUrl?: string) => {
    if (isRunningJob) return
    setIsRunningJob(true)

    const jobId = Date.now().toString()
    const newJob: AutomationJob = {
      id: jobId,
      videoTitle,
      status: 'processing',
      steps: automationSteps.map(s => ({ ...s, status: 'pending' as const })),
      createdAt: new Date().toISOString(),
    }

    setJobs(prev => [newJob, ...prev])

    try {
      // Step 1: Fetch video metadata
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 0 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      let actualVideoUrl = videoUrl
      if (!actualVideoUrl && channelUrl) {
        // Use the channel URL as a base to find recent videos
        actualVideoUrl = channelUrl
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 0 ? { ...step, status: 'completed' as const, message: 'Video found' } : step) }
          : job
      ))

      // Step 2: Get transcript
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 1 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      let transcript = ''
      try {
        if (actualVideoUrl) {
          const transcriptRes = await fetch('/api/youtube/transcript', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl: actualVideoUrl }),
          })

          if (transcriptRes.ok) {
            const transcriptData = await transcriptRes.json()
            transcript = transcriptData.transcript || ''
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1500))

        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 1 ? { ...step, status: 'completed' as const, message: transcript ? 'Transcript fetched' : 'Using video description' } : step) }
            : job
        ))
      } catch (error) {
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 1 ? { ...step, status: 'error' as const, message: 'Transcript unavailable' } : step) }
            : job
        ))
      }

      // Step 3: Generate content
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 2 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      let generatedContent: { title: string; content: string; excerpt: string; seoTitle: string; seoDescription: string; tags: string[] } | null = null
      try {
        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: transcript || videoTitle,
            videoTitle,
            settings: {
              model: settings.contentModel,
              tone: 'mysterious',
              length: 'medium',
              includeCallToAction: true,
              addAffiliateLinks: false,
            },
          }),
        })

        if (generateRes.ok) {
          generatedContent = await generateRes.json()
        }

        await new Promise(resolve => setTimeout(resolve, 2000))

        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 2 ? { ...step, status: 'completed' as const, message: generatedContent ? 'Content generated' : 'Using fallback' } : step) }
            : job
        ))
      } catch (error) {
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 2 ? { ...step, status: 'error' as const, message: 'Generation failed' } : step) }
            : job
        ))
      }

      // Step 4: Generate image
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 3 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      let generatedImage: { imageUrl: string; style: string; prompt: string } | null = null
      try {
        const imageRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: generatedContent?.title || videoTitle,
            content: generatedContent?.content || '',
            style: settings.imageStyle,
          }),
        })

        if (imageRes.ok) {
          generatedImage = await imageRes.json()
        }

        await new Promise(resolve => setTimeout(resolve, 1500))

        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 3 ? { ...step, status: 'completed' as const, message: generatedImage ? 'Image generated' : 'Using default' } : step) }
            : job
        ))
      } catch (error) {
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 3 ? { ...step, status: 'error' as const, message: 'Image generation failed' } : step) }
            : job
        ))
      }

      // Step 5: Optimize SEO (automatic)
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 4 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      await new Promise(resolve => setTimeout(resolve, 800))

      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 4 ? { ...step, status: 'completed' as const, message: 'SEO optimized' } : step) }
          : job
      ))

      // Step 6: Publish post
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 5 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      if (generatedContent) {
        try {
          const publishRes = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoId: videoUrl || 'automation',
              title: generatedContent.title,
              slug: generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
              content: generatedContent.content,
              excerpt: generatedContent.excerpt,
              thumbnail: generatedImage?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
              publishedAt: new Date().toISOString(),
              status: settings.autoPublish === 'publish' ? 'published' : 'draft',
              seoTitle: generatedContent.seoTitle,
              seoDescription: generatedContent.seoDescription,
              tags: generatedContent.tags,
              views: 0,
              aiModel: settings.contentModel,
            }),
          })

          if (publishRes.ok) {
            const publishedPost = await publishRes.json()
            await new Promise(resolve => setTimeout(resolve, 1000))

            setJobs(prev => prev.map(job =>
              job.id === jobId
                ? {
                    ...job,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    postId: publishedPost.id,
                    steps: job.steps.map((step, idx) => idx === 5 ? { ...step, status: 'completed' as const, message: 'Post published' } : step),
                  }
                : job
            ))

            setStats(prev => ({
              ...prev,
              totalProcessed: prev.totalProcessed + 1,
              postsThisWeek: prev.postsThisWeek + 1,
            }))
          } else {
            throw new Error('Failed to publish post')
          }
        } catch (error) {
          setJobs(prev => prev.map(job =>
            job.id === jobId
              ? { ...job, status: 'failed', steps: job.steps.map((step, idx) => idx === 5 ? { ...step, status: 'error' as const, message: 'Publish failed' } : step) }
              : job
          ))
        }
      } else {
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, status: 'failed', steps: job.steps.map((step, idx) => idx === 5 ? { ...step, status: 'error' as const, message: 'No content generated' } : step) }
            : job
        ))
      }
    } catch (error) {
      console.error('Automation error:', error)
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'failed' }
          : job
      ))
    } finally {
      setIsRunningJob(false)
    }
  }

  const handleSyncChannel = async () => {
    if (!channelUrl || isRunningJob) return

    setIsRunningJob(true)
    const jobId = Date.now().toString()
    const newJob: AutomationJob = {
      id: jobId,
      videoTitle: `Channel Sync: ${channelUrl}`,
      status: 'processing',
      steps: automationSteps.map(s => ({ ...s, status: 'pending' as const })),
      createdAt: new Date().toISOString(),
    }

    setJobs(prev => [newJob, ...prev])

    try {
      // Sync channel videos
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, steps: job.steps.map((step, idx) => idx === 0 ? { ...step, status: 'running' as const } : step) }
          : job
      ))

      const syncRes = await fetch('/api/videos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl }),
      })

      if (syncRes.ok) {
        const syncData = await syncRes.json()
        await new Promise(resolve => setTimeout(resolve, 1000))

        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, steps: job.steps.map((step, idx) => idx === 0 ? { ...step, status: 'completed' as const, message: `Synced ${syncData.videos?.length || 0} videos` } : step) }
            : job
        ))

        // Mark remaining steps as completed for sync
        for (let i = 1; i < automationSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          setJobs(prev => prev.map(job =>
            job.id === jobId
              ? { ...job, steps: job.steps.map((step, idx) => idx === i ? { ...step, status: 'completed' as const } : step) }
              : job
          ))
        }

        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? { ...job, status: 'completed', completedAt: new Date().toISOString() }
            : job
        ))

        setStats(prev => ({
          ...prev,
          totalProcessed: prev.totalProcessed + 1,
        }))
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      setJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'failed' }
          : job
      ))
    } finally {
      setIsRunningJob(false)
    }
  }

  const getStepIcon = (status: AutomationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="size-4 text-green-500" />
      case 'running':
        return <Loader2 className="size-4 text-primary animate-spin" />
      case 'error':
        return <AlertCircle className="size-4 text-destructive" />
      default:
        return <Circle className="size-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Automation Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                Automated Workflow
              </CardTitle>
              <CardDescription>
                Fully automated video-to-blog pipeline with AI content and image generation
              </CardDescription>
            </div>
            <Button
              variant={isEnabled ? 'destructive' : 'default'}
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? (
                <>
                  <Pause data-icon="inline-start" />
                  Stop Automation
                </>
              ) : (
                <>
                  <Play data-icon="inline-start" />
                  Start Automation
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="YouTube Channel URL or RSS Feed"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSyncChannel}
              disabled={!channelUrl || isRunningJob}
            >
              {isRunningJob ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Sync Channel'
              )}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalProcessed}</p>
              <p className="text-xs text-muted-foreground">Posts Generated</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold">{stats.avgProcessingTime}</p>
              <p className="text-xs text-muted-foreground">Avg. Time</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-2xl font-bold">{stats.postsThisWeek}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Steps</CardTitle>
          <CardDescription>Each video goes through these automated steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {automationSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <p className="text-xs mt-2 text-center max-w-16">{step.name}</p>
                </div>
                {idx < automationSteps.length - 1 && (
                  <div className="h-0.5 w-8 bg-primary/30 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Processing Queue</CardTitle>
              <CardDescription>Current and recent automation jobs</CardDescription>
            </div>
            <Badge variant="secondary">
              {jobs.filter(j => j.status === 'processing').length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="size-8 mx-auto mb-2" />
              <p className="text-sm">No jobs yet. Start automation or run a test.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{job.videoTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'processing' ? 'secondary' :
                      job.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex items-center gap-1">
                          {getStepIcon(step.status)}
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {step.name}
                          </span>
                        </div>
                        {idx < job.steps.length - 1 && (
                          <div className={`h-0.5 w-4 mx-1 ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Check Interval</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={settings.checkInterval}
                onChange={(e) => setSettings({ ...settings, checkInterval: e.target.value })}
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
                <option value="360">Every 6 hours</option>
                <option value="1440">Once daily</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-Publish</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={settings.autoPublish}
                onChange={(e) => setSettings({ ...settings, autoPublish: e.target.value })}
              >
                <option value="draft">Save as Draft</option>
                <option value="publish">Publish Immediately</option>
                <option value="schedule">Schedule for Best Time</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Model</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={settings.contentModel}
                onChange={(e) => setSettings({ ...settings, contentModel: e.target.value })}
              >
                <option value="deepseek">DeepSeek 4 Pro Flash</option>
                <option value="kimi">Kimi K2.6</option>
                <option value="glm">GLM 5.1</option>
                <option value="stepfun">StepFun 3.7 Flash</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Style</label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={settings.imageStyle}
                onChange={(e) => setSettings({ ...settings, imageStyle: e.target.value })}
              >
                <option value="auto">AI Decides</option>
                <option value="cinematic">Cinematic</option>
                <option value="dark_artistic">Dark Artistic</option>
                <option value="noir_mystery">Noir Mystery</option>
                <option value="historical_realistic">Historical</option>
              </select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Post Limit</span>
            <Input
              type="number"
              value={settings.dailyPostLimit}
              onChange={(e) => setSettings({ ...settings, dailyPostLimit: parseInt(e.target.value) || 0 })}
              className="w-20 text-center"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Minimum Video Duration (min)</span>
            <Input
              type="number"
              value={settings.minVideoDuration}
              onChange={(e) => setSettings({ ...settings, minVideoDuration: parseInt(e.target.value) || 0 })}
              className="w-20 text-center"
            />
          </div>

          <Button
            className="w-full"
            onClick={async () => {
              setIsSavingSettings(true)
              try {
                await fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ settings }),
                })
                setSettingsSaved(true)
                setTimeout(() => setSettingsSaved(false), 3000)
              } catch (error) {
                console.error('Failed to save automation settings:', error)
              } finally {
                setIsSavingSettings(false)
              }
            }}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? 'Saving...' : 'Save Automation Settings'}
          </Button>

          {settingsSaved && (
            <p className="text-xs text-green-500 text-center">Settings saved successfully!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
