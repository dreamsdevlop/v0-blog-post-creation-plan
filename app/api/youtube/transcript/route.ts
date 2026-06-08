import { NextResponse } from 'next/server'
import { fetchTranscript } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoUrl } = body as { videoUrl?: string }

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }

    const result = await fetchTranscript(videoUrl)
    const transcriptText = result.text
    const chunks = result.chunks || []

    return NextResponse.json({
      transcript: transcriptText,
      chunks,
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
