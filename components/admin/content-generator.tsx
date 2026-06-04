'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import type { GenerationSettings } from '@/lib/types'

const models = [
  { id: 'deepseek', name: 'DeepSeek 4 Pro Flash', description: 'Best for long-form content' },
  { id: 'kimi', name: 'Kimi K2.6', description: 'Great for creative writing' },
  { id: 'glm', name: 'GLM 5.1', description: 'Balanced performance' },
  { id: 'stepfun', name: 'StepFun 3.7 Flash', description: 'Fast generation' },
] as const

const tones = [
  { id: 'mysterious', name: 'Mysterious', description: 'Suspenseful and atmospheric' },
  { id: 'dramatic', name: 'Dramatic', description: 'Impactful and emotional' },
  { id: 'educational', name: 'Educational', description: 'Clear and informative' },
  { id: 'storytelling', name: 'Storytelling', description: 'Narrative-driven' },
] as const

export function ContentGenerator() {
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    content: string
    excerpt: string
    seoTitle: string
    seoDescription: string
    tags: string[]
  } | null>(null)
  const [copied, setCopied] = useState(false)
  
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'deepseek',
    tone: 'mysterious',
    length: 'medium',
    includeCallToAction: true,
    addAffiliateLinks: false,
  })

  const handleGenerate = async () => {
    if (!transcript || !videoTitle) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoTitle, settings }),
      })
      
      if (!response.ok) throw new Error('Generation failed')
      
      const result = await response.json()
      setGeneratedContent(result)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!generatedContent) return
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: videoUrl || 'manual',
        title: generatedContent.title,
        slug: generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        publishedAt: new Date().toISOString(),
        status: 'draft',
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        tags: generatedContent.tags,
        views: 0,
        aiModel: settings.model,
      }),
    })
    
    if (response.ok) {
      setGeneratedContent(null)
      setTranscript('')
      setVideoTitle('')
      setVideoUrl('')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Content Generator</CardTitle>
          <CardDescription>
            Transform video transcripts into engaging blog posts using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Video URL (optional)</label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Video Title</label>
            <Input
              placeholder="Enter the video title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transcript</label>
            <Textarea
              placeholder="Paste the video transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
            />
          </div>

          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="model">AI Model</TabsTrigger>
              <TabsTrigger value="tone">Tone</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="model" className="space-y-3 mt-4">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                    settings.model === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSettings({ ...settings, model: model.id })}
                >
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  {settings.model === model.id && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tone" className="space-y-3 mt-4">
              {tones.map((tone) => (
                <div
                  key={tone.id}
                  className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                    settings.tone === tone.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSettings({ ...settings, tone: tone.id })}
                >
                  <div>
                    <p className="font-medium text-sm">{tone.name}</p>
                    <p className="text-xs text-muted-foreground">{tone.description}</p>
                  </div>
                  {settings.tone === tone.id && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="options" className="space-y-4 mt-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Article Length</label>
                <div className="flex gap-2">
                  {(['short', 'medium', 'long'] as const).map((length) => (
                    <Button
                      key={length}
                      variant={settings.length === length ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings({ ...settings, length })}
                    >
                      {length.charAt(0).toUpperCase() + length.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Call-to-Action</p>
                  <p className="text-xs text-muted-foreground">Add subscription/comment prompts</p>
                </div>
                <Button
                  variant={settings.includeCallToAction ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, includeCallToAction: !settings.includeCallToAction })}
                >
                  {settings.includeCallToAction ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Affiliate Link Placeholders</p>
                  <p className="text-xs text-muted-foreground">Mark spots for affiliate products</p>
                </div>
                <Button
                  variant={settings.addAffiliateLinks ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ ...settings, addAffiliateLinks: !settings.addAffiliateLinks })}
                >
                  {settings.addAffiliateLinks ? 'On' : 'Off'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!transcript || !videoTitle || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles data-icon="inline-start" />
                Generate Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Preview and edit your blog post</CardDescription>
          </div>
          {generatedContent && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{generatedContent.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{generatedContent.excerpt}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {generatedContent.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-2">SEO Preview</h4>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium text-primary">{generatedContent.seoTitle}</p>
                  <p className="text-xs text-muted-foreground">{generatedContent.seoDescription}</p>
                </div>
              </div>

              <div
                className="prose prose-sm prose-invert max-h-64 overflow-y-auto rounded-lg border border-border p-4"
                dangerouslySetInnerHTML={{ __html: generatedContent.content }}
              />

              <div className="flex gap-2">
                <Button onClick={handleSaveAsDraft} className="flex-1">
                  Save as Draft
                </Button>
                <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                  Discard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Enter a transcript and click Generate to create your blog post
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
