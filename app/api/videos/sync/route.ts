import { NextResponse } from 'next/server'
import { getVideos, addVideo, updateChannelConfig } from '@/lib/data'
import { fetchYouTubeVideoMeta } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { channelUrl } = body as { channelUrl?: string }

    if (!channelUrl) {
      return NextResponse.json({ error: 'channelUrl is required' }, { status: 400 })
    }

    // Update channel config
    updateChannelConfig({ channelUrl, autoProcess: true })

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
    }

    // Extract channel ID from URL or use as-is if it's already a channel ID
    let channelId = channelUrl
    const channelHandleMatch = channelUrl.match(/@[\w-]+/)
    const channelIdMatch = channelUrl.match(/channel\/([\w-]+)/)
    const customUrlMatch = channelUrl.match(/c\/([\w-]+)/)

    if (channelHandleMatch) {
      channelId = channelHandleMatch[0]
    } else if (channelIdMatch) {
      channelId = channelIdMatch[1]
    } else if (customUrlMatch) {
      channelId = customUrlMatch[1]
    }

    // Fetch channel videos using YouTube Data API
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`,
      { next: { revalidate: 300 } }
    )

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('YouTube API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch videos from YouTube channel' },
        { status: 500 }
      )
    }

    const searchData = await searchResponse.json()
    const videos = searchData.items || []

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        videos: [],
        message: 'No videos found in channel',
      })
    }

    // Import each video
    const importedVideos = []
    for (const video of videos) {
      try {
        const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`
        const meta = await fetchYouTubeVideoMeta(videoUrl)
        const existingVideo = getVideos().find(v => v.videoUrl === meta.videoUrl)

        if (!existingVideo) {
          const newVideo = addVideo({
            id: crypto.randomUUID(),
            title: meta.title,
            description: meta.description,
            thumbnail: meta.thumbnail,
            publishedAt: meta.publishedAt,
            channelTitle: meta.channelTitle,
            videoUrl: meta.videoUrl,
            duration: meta.duration,
          })
          importedVideos.push({
            id: newVideo.id,
            title: newVideo.title,
            thumbnail: newVideo.thumbnail,
          })
        } else {
          importedVideos.push({
            id: existingVideo.id,
            title: existingVideo.title,
            thumbnail: existingVideo.thumbnail,
          })
        }
      } catch (error) {
        console.error('Error importing video:', video.id.videoId, error)
      }
    }

    return NextResponse.json({
      success: true,
      videos: importedVideos,
      message: `Synced ${importedVideos.length} videos from channel`,
    })
  } catch (error) {
    console.error('Video sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync channel' },
      { status: 500 }
    )
  }
}
