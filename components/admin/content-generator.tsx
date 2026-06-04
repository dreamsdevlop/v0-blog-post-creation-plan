'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Loader2, Copy, Check, Image as ImageIcon, RefreshCw, Wand2, ExternalLink } from 'lucide-react'
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

const imageStyles = [
  { id: 'auto', name: 'AI Decides', description: 'Best style based on content' },
  { id: 'cinematic', name: 'Cinematic', description: 'Epic movie-like scenes' },
  { id: 'dark_artistic', name: 'Dark Artistic', description: 'Moody illustrations' },
  { id: 'noir_mystery', name: 'Noir Mystery', description: 'High contrast shadows' },
  { id: 'historical_realistic', name: 'Historical', description: 'Authentic period style' },
] as const

export function ContentGenerator() {
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    content: string
    excerpt: string
    seoTitle: string
    seoDescription: string
    tags: string[]
  } | null>(null)
  const [generatedImage, setGeneratedImage] = useState<{
    imageUrl: string
    style: string
    prompt: string
  } | null>(null)
  const [imageOptions, setImageOptions] = useState<Array<{
    imageUrl: string
    style: string
    prompt: string
  }>>([])
  const [copied, setCopied] = useState(false)
  const [autoGenerateImage, setAutoGenerateImage] = useState(true)
  const [selectedImageStyle, setSelectedImageStyle] = useState('auto')
  const [isPublishingToBlogger, setIsPublishingToBlogger] = useState(false)
  const [bloggerConnected, setBloggerConnected] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'deepseek',
    tone: 'mysterious',
    length: 'medium',
    includeCallToAction: true,
    addAffiliateLinks: false,
  })

  const handleGenerateImage = async (title: string, content: string, generateMultiple = false) => {
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content: content.slice(0, 500), 
          style: selectedImageStyle,
          generateMultiple 
        }),
      })
      
      if (!response.ok) throw new Error('Image generation failed')
      
      const result = await response.json()
      
      if (generateMultiple && result.images) {
        setImageOptions(result.images)
        if (result.images.length > 0) {
          setGeneratedImage(result.images[0])
        }
      } else {
        setGeneratedImage(result)
        setImageOptions([])
      }
    } catch (error) {
      console.error('Image generation error:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGenerate = async () => {
    if (!transcript || !videoTitle) return
    
    setIsGenerating(true)
    setGeneratedImage(null)
    setImageOptions([])
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoTitle, settings }),
      })
      
      if (!response.ok) throw new Error('Generation failed')
      
      const result = await response.json()
      setGeneratedContent(result)
      
      // Auto-generate image after content is ready
      if (autoGenerateImage) {
        await handleGenerateImage(result.title, result.content)
      }
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
        thumbnail: generatedImage?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
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
      setGeneratedImage(null)
      setImageOptions([])
      setTranscript('')
      setVideoTitle('')
      setVideoUrl('')
    }
  }

  const handlePublishNow = async () => {
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
        thumbnail: generatedImage?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        publishedAt: new Date().toISOString(),
        status: 'published',
        seoTitle: generatedContent.seoTitle,
        seoDescription: generatedContent.seoDescription,
        tags: generatedContent.tags,
        views: 0,
        aiModel: settings.model,
      }),
    })
    
    if (response.ok) {
      setGeneratedContent(null)
      setGeneratedImage(null)
      setImageOptions([])
      setTranscript('')
      setVideoTitle('')
      setVideoUrl('')
      setPublishedUrl(null)
    }
  }

  const handlePublishToBlogger = async (isDraft = false) => {
    if (!generatedContent) return
    
    setIsPublishingToBlogger(true)
    setPublishedUrl(null)
    
    try {
      const response = await fetch('/api/publish-blogger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedContent.title,
          content: generatedContent.content,
          tags: generatedContent.tags,
          featuredImageUrl: generatedImage?.imageUrl,
          videoUrl: videoUrl || undefined,
          isDraft,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not connected - redirect to auth
          window.location.href = '/api/auth/blogger'
          return
        }
        throw new Error(result.error || 'Failed to publish')
      }
      
      setPublishedUrl(result.postUrl)
    } catch (error) {
      console.error('Blogger publish error:', error)
      alert(error instanceof Error ? error.message : 'Failed to publish to Blogger')
    } finally {
      setIsPublishingToBlogger(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Content Generator</CardTitle>
          <CardDescription>
            Transform video transcripts into engaging blog posts with AI-generated images
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="tone">Tone</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
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

            <TabsContent value="image" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-Generate Featured Image</p>
                  <p className="text-xs text-muted-foreground">Create image automatically with content</p>
                </div>
                <Button
                  variant={autoGenerateImage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoGenerateImage(!autoGenerateImage)}
                >
                  {autoGenerateImage ? 'On' : 'Off'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {imageStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`rounded-lg border p-2 cursor-pointer transition-colors ${
                        selectedImageStyle === style.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedImageStyle(style.id)}
                    >
                      <p className="font-medium text-xs">{style.name}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                Generating Content & Image...
              </>
            ) : (
              <>
                <Wand2 data-icon="inline-start" />
                Generate Complete Blog Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Featured Image Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Featured Image</CardTitle>
              <CardDescription>AI-generated thumbnail for your post</CardDescription>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateImage(generatedContent.title, generatedContent.content, true)}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isGeneratingImage ? (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="size-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Generating image...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden border border-border">
                  <img 
                    src={generatedImage.imageUrl} 
                    alt="Generated thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{generatedImage.style}</Badge>
                  <p className="text-xs text-muted-foreground truncate max-w-48" title={generatedImage.prompt}>
                    {generatedImage.prompt.slice(0, 40)}...
                  </p>
                </div>
                
                {/* Image Options */}
                {imageOptions.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Alternative Styles:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {imageOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className={`aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all ${
                            generatedImage.imageUrl === option.imageUrl 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setGeneratedImage(option)}
                        >
                          <img 
                            src={option.imageUrl} 
                            alt={`Style: ${option.style}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Image will appear here after generation
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Generated Content</CardTitle>
              <CardDescription>Preview and edit your blog post</CardDescription>
            </div>
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
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
                  className="prose prose-sm prose-invert max-h-48 overflow-y-auto rounded-lg border border-border p-4"
                  dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                />

                <div className="flex flex-col gap-3">
                  {publishedUrl && (
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                      <p className="text-sm text-green-400 font-medium">Published to Blogger!</p>
                      <a 
                        href={publishedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-green-300 hover:underline flex items-center gap-1"
                      >
                        View Post <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePublishToBlogger(false)} 
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      disabled={isPublishingToBlogger}
                    >
                      {isPublishingToBlogger ? (
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                      ) : (
                        <ExternalLink data-icon="inline-start" />
                      )}
                      Publish to Blogger
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePublishToBlogger(true)}
                      disabled={isPublishingToBlogger}
                    >
                      Draft
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handlePublishNow} variant="secondary" className="flex-1">
                      <Sparkles data-icon="inline-start" />
                      Save Locally
                    </Button>
                    <Button variant="outline" onClick={handleSaveAsDraft}>
                      Save Draft
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setGeneratedContent(null)
                      setGeneratedImage(null)
                      setImageOptions([])
                      setPublishedUrl(null)
                    }}>
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="size-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Enter a transcript and click Generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
