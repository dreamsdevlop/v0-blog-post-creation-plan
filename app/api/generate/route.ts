import { NextResponse } from 'next/server'
import { generateBlogPost } from '@/lib/nvidia-ai'
import type { GenerationSettings } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transcript, videoTitle, settings } = body as {
      transcript: string
      videoTitle: string
      settings: GenerationSettings
    }
    
    if (!transcript || !videoTitle) {
      return NextResponse.json(
        { error: 'Transcript and video title are required' },
        { status: 400 }
      )
    }
    
    console.log('[Generate] Request received:', { transcriptLength: transcript.length, videoTitle, settings })
    const result = await generateBlogPost(transcript, videoTitle, settings)
    console.log('[Generate] Success:', result.title)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Generate] Error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    console.error('[Generate] Error message:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
