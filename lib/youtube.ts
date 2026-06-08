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
    channelId: snippet.channelId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    duration,
    tags: snippet.tags || [],
    categoryId: snippet.categoryId,
    defaultLanguage: snippet.defaultLanguage,
    defaultAudioLanguage: snippet.defaultAudioLanguage,
  }
}

export async function fetchTranscript(videoUrl: string): Promise<{ text: string; source: 'captions' | 'description' | 'title'; chunks?: Array<{ text: string; start: number; duration: number }> }> {
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL')
  }

  const videoId = videoIdMatch[1]

  try {
    // Method 1: Try to fetch captions from YouTube page HTML
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    if (!videoPageResponse.ok) {
      throw new Error('Failed to fetch video page')
    }

    const html = await videoPageResponse.text()

    // Try to find caption tracks in the page HTML - multiple patterns
    let captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/)
    if (!captionTracksMatch) {
      // Try alternative pattern
      captionTracksMatch = html.match(/"captions":\s*\{[^}]*"playerCaptionsTracklistRenderer":\s*\{[^}]*"captionTracks":\s*(\[.*?\])/)
    }
    if (!captionTracksMatch) {
      // Try to find in ytInitialPlayerResponse
      const initialDataMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.*?\});\s*<\/script>/s)
      if (initialDataMatch) {
        try {
          const initialData = JSON.parse(initialDataMatch[1])
          const tracks = initialData?.captions?.playerCaptionsTracklistRenderer?.captionTracks
          if (tracks && tracks.length > 0) {
            const englishTrack = tracks.find((t: { languageCode?: string }) => t.languageCode === 'en') || tracks[0]
            if (englishTrack?.baseUrl) {
              const transcriptResponse = await fetch(englishTrack.baseUrl)
              if (transcriptResponse.ok) {
                const transcriptXml = await transcriptResponse.text()
                const chunks = parseTranscriptXml(transcriptXml)
                if (chunks.length > 0) {
                  const text = chunks.map(c => c.text).join(' ')
                  return { text, source: 'captions', chunks }
                }
              }
            }
          }
        } catch (e) {
          // Continue to fallback
        }
      }
    }

    if (captionTracksMatch) {
      try {
        const captionTracks = JSON.parse(captionTracksMatch[1])
        const englishTrack = captionTracks.find((track: { languageCode?: string }) => track.languageCode === 'en') || captionTracks[0]

        if (englishTrack?.baseUrl) {
          const transcriptResponse = await fetch(englishTrack.baseUrl)
          if (transcriptResponse.ok) {
            const transcriptXml = await transcriptResponse.text()
            const chunks = parseTranscriptXml(transcriptXml)
            if (chunks.length > 0) {
              const text = chunks.map(c => c.text).join(' ')
              return { text, source: 'captions', chunks }
            }
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    // Method 2: Fallback to video description
    const meta = await fetchYouTubeVideoMeta(videoUrl)
    const description = meta.description?.trim() || ''
    if (description.length > 100) {
      return { text: description, source: 'description' }
    }

    // Method 3: Fallback to title only
    if (meta.title) {
      return { text: meta.title, source: 'title' }
    }

    throw new Error('No transcript, description, or title available for this video')
  } catch (error) {
    console.error('Transcript fetch error:', error)
    throw error
  }
}

function parseTranscriptXml(xml: string): Array<{ text: string; start: number; duration: number }> {
  const chunks: Array<{ text: string; start: number; duration: number }> = []
  const textMatches = [...xml.matchAll(/<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g)]

  for (const match of textMatches) {
    const start = parseFloat(match[1])
    const duration = parseFloat(match[2])
    const text = decodeHTMLEntities(match[3])
    chunks.push({ text, start, duration })
  }

  return chunks
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

export async function fetchChannelVideos(channelId: string, maxResults: number = 10): Promise<Array<{
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  videoUrl: string
  duration: string
}>> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error('YouTube API key not configured')
  }

  // First, get the uploads playlist ID
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails`,
    { next: { revalidate: 3600 } }
  )

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch channel info')
  }

  const channelData = await channelResponse.json()
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

  if (!uploadsPlaylistId) {
    throw new Error('Channel uploads playlist not found')
  }

  // Then, get videos from the uploads playlist
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet,contentDetails&maxResults=${maxResults}&order=desc`,
    { next: { revalidate: 3600 } }
  )

  if (!playlistResponse.ok) {
    throw new Error('Failed to fetch channel videos')
  }

  const playlistData = await playlistResponse.json()

  return playlistData.items?.map((item: { contentDetails?: { videoId?: string }; snippet?: { title?: string; description?: string; thumbnails?: { high?: { url?: string }; medium?: { url?: string } }; publishedAt?: string } }) => {
    const videoId = item.contentDetails?.videoId
    const snippet = item.snippet
    return {
      id: videoId || '',
      title: snippet?.title || '',
      description: snippet?.description || '',
      thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || '',
      publishedAt: snippet?.publishedAt || '',
      videoUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : '',
      duration: 'PT0S',
    }
  }) || []
}
