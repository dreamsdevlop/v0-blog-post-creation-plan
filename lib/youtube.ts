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

export async function fetchTranscript(videoUrl: string): Promise<Array<{ text: string; start: number; duration: number }>> {
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL')
  }

  const videoId = videoIdMatch[1]

  try {
    // Fetch the video page to extract transcript data
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    if (!videoPageResponse.ok) {
      throw new Error('Failed to fetch video page')
    }

    const html = await videoPageResponse.text()

    // Try to find caption tracks in the page HTML
    const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
    if (!captionTracksMatch) {
      throw new Error('No captions available for this video')
    }

    const captionTracks = JSON.parse(captionTracksMatch[1])
    const englishTrack = captionTracks.find((track: { languageCode?: string }) => track.languageCode === 'en') || captionTracks[0]

    if (!englishTrack?.baseUrl) {
      throw new Error('No caption track URL found')
    }

    // Fetch the transcript XML
    const transcriptResponse = await fetch(englishTrack.baseUrl)
    if (!transcriptResponse.ok) {
      throw new Error('Failed to fetch transcript')
    }

    const transcriptXml = await transcriptResponse.text()

    // Parse the XML to extract transcript chunks
    const chunks: Array<{ text: string; start: number; duration: number }> = []
    const textMatches = [...transcriptXml.matchAll(/<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g)]

    for (const match of textMatches) {
      const start = parseFloat(match[1])
      const duration = parseFloat(match[2])
      const text = decodeHTMLEntities(match[3])
      chunks.push({ text, start, duration })
    }

    if (chunks.length === 0) {
      throw new Error('Transcript is empty')
    }

    return chunks
  } catch (error) {
    console.error('Transcript fetch error:', error)
    throw error
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
}

export function formatTranscriptForAI(chunks: Array<{ text: string; start: number; duration: number }>): string {
  return chunks.map(chunk => chunk.text).join(' ')
}
