import { NextResponse } from 'next/server'
import { getVideos, addVideo } from '@/lib/data'
import { fetchTranscript } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoId } = body as { videoId?: string }

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    const videos = await getVideos()
    const video = videos.find(v => v.id === videoId)

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const result = await fetchTranscript(video.videoUrl)
    const transcriptText = result.text

    // Update video with transcript data
    const updatedVideo = await addVideo({
      ...video,
      description: `${video.description}\n\n[TRANSCRIPT]\n${transcriptText}`,
    })

    return NextResponse.json({
      video: updatedVideo,
      transcript: transcriptText,
      wordCount: transcriptText.split(/\s+/).length,
      source: result.source,
    })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
