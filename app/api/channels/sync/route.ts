import { NextResponse } from 'next/server'
import { getVideos, addVideo, getSettings } from '@/lib/data'
import { fetchChannelVideos, fetchTranscript } from '@/lib/youtube'
import { generateBlogPost } from '@/lib/nvidia-ai'
import { generateBlogImage } from '@/lib/nvidia-image'
import { createPost } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channelId, channelUrl, maxVideos = 10, autoFetchTranscript = true, autoGeneratePosts = false } = body as {
      channelId?: string
      channelUrl?: string
      maxVideos?: number
      autoFetchTranscript?: boolean
      autoGeneratePosts?: boolean
    }

    if (!channelId && !channelUrl) {
      return NextResponse.json({ error: 'channelId or channelUrl is required' }, { status: 400 })
    }

    // Extract channel ID from URL if provided
    let resolvedChannelId = channelId
    if (!resolvedChannelId && channelUrl) {
      const channelIdMatch = channelUrl.match(/(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/@)([\w-]+)/)
      if (channelIdMatch) {
        resolvedChannelId = channelIdMatch[1]
      } else {
        // Try to get channel ID from custom URL
        const apiKey = process.env.YOUTUBE_API_KEY
        if (!apiKey) {
          return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
        }
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&forUsername=${channelUrl.replace('youtube.com/c/', '')}&part=id`,
          { next: { revalidate: 3600 } }
        )
        const channelData = await channelResponse.json()
        resolvedChannelId = channelData.items?.[0]?.id
        if (!resolvedChannelId) {
          return NextResponse.json({ error: 'Could not resolve channel ID' }, { status: 400 })
        }
      }
    }

    // Fetch channel videos
    if (!resolvedChannelId) {
      return NextResponse.json({ error: 'Could not resolve channel ID' }, { status: 400 })
    }
    const channelVideos = await fetchChannelVideos(resolvedChannelId, maxVideos)

    // Get existing videos to avoid duplicates
    const existingVideos = await getVideos()
    const existingUrls = new Set(existingVideos.map(v => v.videoUrl))

    // Filter out already imported videos
    const newVideos = channelVideos.filter(v => !existingUrls.has(v.videoUrl))

    // Get settings for auto-generation
    const settings = await getSettings()
    const contentModel = (settings?.contentModel as string) || 'deepseek'
    const imageStyle = (settings?.imageStyle as string) || 'auto'
    const autoPublish = (settings?.autoPublish as string) !== 'draft'

    // Import new videos and optionally auto-generate posts
    const importedVideos = []
    const generatedPosts = []
    for (const video of newVideos) {
      try {
        const newVideo = await addVideo({
          id: crypto.randomUUID(),
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          publishedAt: video.publishedAt,
          channelTitle: '',
          videoUrl: video.videoUrl,
          duration: video.duration,
        })
        importedVideos.push(newVideo)

        // Auto-fetch transcript in background
        if (autoFetchTranscript) {
          fetchTranscript(video.videoUrl).then(async (result) => {
            const transcriptText = result.text
            const updatedVideo = await addVideo({
              ...newVideo,
              description: `${newVideo.description}\n\n[TRANSCRIPT]\n${transcriptText}`,
            })

            // Auto-generate post if enabled
            if (autoGeneratePosts) {
              try {
                const generatedContent = await generateBlogPost(transcriptText, video.title, {
                  model: contentModel as 'deepseek' | 'kimi' | 'glm' | 'stepfun',
                  tone: 'mysterious',
                  length: 'medium',
                  includeCallToAction: true,
                  addAffiliateLinks: false,
                })

                let imageUrl = updatedVideo.thumbnail
                try {
                  const imageResult = await generateBlogImage(
                    generatedContent.title,
                    generatedContent.content,
                    { style: imageStyle as 'auto' | 'cinematic' | 'dark_artistic' | 'noir_mystery' | 'historical_realistic' }
                  )
                  if (imageResult) {
                    imageUrl = imageResult.imageUrl
                  }
                } catch (error) {
                  console.error('Failed to generate image:', error)
                }

                const slug = generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
                const now = new Date().toISOString()
                const post = await createPost({
                  videoId: updatedVideo.id,
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
                generatedPosts.push(post)
              } catch (error) {
                console.error('Failed to auto-generate post:', error)
              }
            }
          }).catch((error) => {
            console.error('Background transcript fetch failed:', error)
          })
        }
      } catch (error) {
        console.error('Failed to import video:', video.videoUrl, error)
      }
    }

    return NextResponse.json({
      message: `Synced ${importedVideos.length} new videos from channel`,
      imported: importedVideos.length,
      skipped: newVideos.length - importedVideos.length,
      videos: importedVideos,
      postsGenerated: generatedPosts.length,
    })
  } catch (error) {
    console.error('Channel sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync channel' },
      { status: 500 }
    )
  }
}
