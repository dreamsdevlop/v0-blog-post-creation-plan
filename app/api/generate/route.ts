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
    
    const result = await generateBlogPost(transcript, videoTitle, settings)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
