import { NextResponse } from 'next/server'
import { addVideo, getVideos } from '@/lib/data'
import { fetchYouTubeVideoMeta, fetchTranscript } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoUrls } = body as { videoUrls?: string[] }

    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return NextResponse.json({ error: 'videoUrls array is required' }, { status: 400 })
    }

    if (videoUrls.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 videos per batch' }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const videoUrl of videoUrls) {
      try {
        const meta = await fetchYouTubeVideoMeta(videoUrl)
        const existingVideos = await getVideos()
        const existingVideo = existingVideos.find(v => v.videoUrl === meta.videoUrl)

        if (existingVideo) {
          results.push({
            videoUrl,
            status: 'skipped',
            message: 'Already imported',
            video: existingVideo,
          })
          continue
        }

        const newVideo = await addVideo({
          id: crypto.randomUUID(),
          title: meta.title,
          description: meta.description,
          thumbnail: meta.thumbnail,
          publishedAt: meta.publishedAt,
          channelTitle: meta.channelTitle,
          videoUrl: meta.videoUrl,
          duration: meta.duration,
        })

        // Auto-fetch transcript in background
        fetchTranscript(videoUrl).catch((error) => {
          console.error('Background transcript fetch failed for', videoUrl, error)
        })

        results.push({
          videoUrl,
          status: 'imported',
          message: 'Imported successfully',
          video: newVideo,
        })
      } catch (error) {
        errors.push({
          videoUrl,
          error: error instanceof Error ? error.message : 'Failed to import',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: videoUrls.length,
        imported: results.filter(r => r.status === 'imported').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: errors.length,
      },
    })
  } catch (error) {
    console.error('Batch import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch import failed' },
      { status: 500 }
    )
  }
}
