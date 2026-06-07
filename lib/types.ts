export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  videoUrl: string
  duration?: string
}

export interface BlogPost {
  id: string
  videoId: string
  title: string
  slug: string
  content: string
  excerpt: string
  thumbnail: string
  publishedAt: string
  createdAt: string
  updatedAt?: string
  status: 'draft' | 'published' | 'scheduled'
  seoTitle?: string
  seoDescription?: string
  tags: string[]
  views: number
  aiModel: string
}

export interface TranscriptChunk {
  text: string
  start: number
  duration: number
}

export interface GenerationSettings {
  model: 'deepseek' | 'kimi' | 'glm' | 'stepfun'
  tone: 'mysterious' | 'dramatic' | 'educational' | 'storytelling'
  length: 'short' | 'medium' | 'long'
  includeCallToAction: boolean
  addAffiliateLinks: boolean
}

export interface ChannelConfig {
  channelId: string
  channelName: string
  channelUrl: string
  apiKey?: string
  autoProcess: boolean
  lastSync?: string
}

export interface DashboardStats {
  totalVideos: number
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  thisMonthViews: number
}
