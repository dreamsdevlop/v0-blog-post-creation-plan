import { NextResponse } from 'next/server'
import { addVideo, getVideos } from '@/lib/data'
import { fetchYouTubeVideoMeta } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoUrl } = body as { videoUrl?: string }

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }

    const meta = await fetchYouTubeVideoMeta(videoUrl)
    const existingVideo = getVideos().find(v => v.videoUrl === meta.videoUrl)

    if (existingVideo) {
      return NextResponse.json({
        video: existingVideo,
        message: 'Video already imported',
      })
    }

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

    return NextResponse.json({
      video: newVideo,
      message: 'Video imported successfully',
    })
  } catch (error) {
    console.error('Video import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import video' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const videos = getVideos()
  return NextResponse.json({ videos })
}
