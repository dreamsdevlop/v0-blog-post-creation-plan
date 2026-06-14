import { NextResponse } from 'next/server'
import { getVideos, addVideo, getSettings, createPost } from '@/lib/data'
import { fetchTranscript } from '@/lib/youtube'
import { generateBlogPost } from '@/lib/nvidia-ai'
import { generateBlogImage } from '@/lib/nvidia-image'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoId, autoPublish = true } = body as { videoId?: string; autoPublish?: boolean }

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    const videos = await getVideos()
    const video = videos.find(v => v.id === videoId)

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Get settings
    const settings = await getSettings()
    const contentModel = (settings?.contentModel as string) || 'deepseek'
    const imageStyle = (settings?.imageStyle as string) || 'auto'

    // Step 1: Fetch transcript if not already present
    let transcript = ''
    const transcriptMatch = video.description.match(/\[TRANSCRIPT\]\n([\s\S]*)$/)
    if (transcriptMatch) {
      transcript = transcriptMatch[1]
    } else {
      try {
        const result = await fetchTranscript(video.videoUrl)
        transcript = result.text
        // Save transcript to video
        await addVideo({
          ...video,
          description: `${video.description}\n\n[TRANSCRIPT]\n${transcript}`,
        })
      } catch (error) {
        console.error('Failed to fetch transcript:', error)
        // Use video description as fallback
        transcript = video.description
      }
    }

    // Step 2: Generate blog post
    let generatedContent: { title: string; content: string; excerpt: string; seoTitle: string; seoDescription: string; tags: string[] } | null = null
    try {
      generatedContent = await generateBlogPost(transcript, video.title, {
        model: contentModel as 'deepseek' | 'kimi' | 'glm' | 'stepfun',
        tone: 'mysterious',
        length: 'medium',
        includeCallToAction: true,
        addAffiliateLinks: false,
      })
    } catch (error) {
      console.error('Failed to generate content:', error)
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    // Step 3: Generate image
    let imageUrl = video.thumbnail
    try {
      const imageResult = await generateBlogImage(
        generatedContent.title,
        generatedContent.content,
        {
          style: imageStyle as 'auto' | 'cinematic' | 'dark_artistic' | 'noir_mystery' | 'historical_realistic',
        }
      )
      if (imageResult) {
        imageUrl = imageResult.imageUrl
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      // Use video thumbnail as fallback
    }

    // Step 4: Create post
    const slug = generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
    const now = new Date().toISOString()
    const post = await createPost({
      videoId: video.id,
      title: generatedContent.title,
      slug,
      content: generatedContent.content,
      excerpt: generatedContent.excerpt,
      thumbnail: imageUrl,
      publishedAt: now,
      createdAt: now,
      status: autoPublish ? 'published' : 'draft',
      seoTitle: generatedContent.seoTitle,
      seoDescription: generatedContent.seoDescription,
      tags: generatedContent.tags,
      views: 0,
      aiModel: contentModel,
    })

    return NextResponse.json({
      message: autoPublish ? 'Post published successfully' : 'Post saved as draft',
      post,
    })
  } catch (error) {
    console.error('Automation process error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Automation failed' },
      { status: 500 }
    )
  }
}
