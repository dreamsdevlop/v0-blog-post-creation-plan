export async function fetchYouTubeVideoMeta(videoUrl: string) {
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL')
  }

  const videoId = videoIdMatch[1]
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,contentDetails,statistics`,
    { next: { revalidate: 3600 } }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch video metadata')
  }

  const data = await response.json()
  const video = data.items?.[0]

  if (!video) {
    throw new Error('Video not found')
  }

  const { snippet, contentDetails } = video
  const duration = contentDetails?.duration || 'PT0S'

  return {
    id: videoId,
    title: snippet.title,
    description: snippet.description,
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
    publishedAt: snippet.publishedAt,
    channelTitle: snippet.channelTitle,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    duration,
  }
}

export async function fetchTranscript(videoUrl: string) {
  // Placeholder for transcript fetching
  // In production, you would use a transcript API or service
  return []
}

export function formatTranscriptForAI(chunks: Array<{ text: string; start: number; duration: number }>) {
  return chunks.map(chunk => chunk.text).join(' ')
}
