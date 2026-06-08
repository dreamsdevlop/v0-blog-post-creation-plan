import { NextResponse } from 'next/server'
import { getVideos, addVideo } from '@/lib/data'
import { fetchTranscript, formatTranscriptForAI } from '@/lib/youtube'

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

    const chunks = await fetchTranscript(video.videoUrl)
    const transcriptText = formatTranscriptForAI(chunks)

    // Update video with transcript data
    const updatedVideo = await addVideo({
      ...video,
      description: `${video.description}\n\n[TRANSCRIPT]\n${transcriptText}`,
    })

    return NextResponse.json({
      video: updatedVideo,
      transcript: transcriptText,
      chunks,
      wordCount: transcriptText.split(/\s+/).length,
    })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
