import { NextResponse } from 'next/server'
import { getChannelConfig, updateChannelConfig, getVideos, addVideo } from '@/lib/data'
import { fetchChannelVideos, fetchTranscript } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const channelConfig = await getChannelConfig()

    if (!channelConfig.channelId || !channelConfig.autoProcess) {
      return NextResponse.json({ message: 'No channel configured or auto-process disabled' })
    }

    // Fetch latest videos from channel
    const channelVideos = await fetchChannelVideos(channelConfig.channelId, 10)

    // Get existing videos to avoid duplicates
    const existingVideosList = await getVideos()
    const existingUrls = new Set(existingVideosList.map(v => v.videoUrl))

    // Filter out already imported videos
    const newVideos = channelVideos.filter(v => !existingUrls.has(v.videoUrl))

    // Import new videos and fetch transcripts
    const importedVideos = []
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

        // Auto-fetch transcript
        try {
          const result = await fetchTranscript(video.videoUrl)
          const transcriptText = result.text
          await addVideo({
            ...newVideo,
            description: `${newVideo.description}\n\n[TRANSCRIPT]\n${transcriptText}`,
          })
        } catch (error) {
          console.error('Failed to fetch transcript for video:', video.videoUrl, error)
        }
      } catch (error) {
        console.error('Failed to import video:', video.videoUrl, error)
      }
    }

    // Update last sync time
    await updateChannelConfig({
      ...channelConfig,
      lastSync: new Date().toISOString(),
    })

    return NextResponse.json({
      message: `Synced ${importedVideos.length} new videos`,
      imported: importedVideos.length,
      videos: importedVideos,
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron sync failed' },
      { status: 500 }
    )
  }
}
