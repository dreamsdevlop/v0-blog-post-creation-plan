import type { BlogPost, Video, DashboardStats, ChannelConfig } from './types'
import {
  loadPosts,
  savePosts,
  loadVideos,
  saveVideos,
  loadChannelConfig,
  saveChannelConfig,
  loadSettings,
  saveSettings,
} from './storage'
import {
  initDatabase,
  isDbAvailable,
  dbGetPosts,
  dbGetPostById,
  dbGetPostBySlug,
  dbGetPublishedPosts,
  dbCreatePost,
  dbUpdatePost,
  dbDeletePost,
  dbGetVideos,
  dbAddVideo,
  dbGetChannelConfig,
  dbUpdateChannelConfig,
  dbGetSettings,
  dbSaveSettings,
  dbGetStats,
} from './db'

// In-memory cache with file-backed persistence
let posts: BlogPost[] = []
let videos: Video[] = []
let channelConfig: ChannelConfig = {
  channelId: '',
  channelName: '',
  channelUrl: '',
  autoProcess: false,
}

let initialized = false
let useDatabase = false

async function ensureInitialized() {
  if (initialized) return

  // Try database first
  try {
    await initDatabase()
    if (isDbAvailable()) {
      posts = await dbGetPosts()
      videos = await dbGetVideos()
      channelConfig = await dbGetChannelConfig()
      useDatabase = true
      initialized = true
      return
    }
  } catch (error) {
    console.log('Database not available, using file storage:', error)
  }

  // Fallback to file storage
  posts = await loadPosts()
  videos = await loadVideos()
  channelConfig = await loadChannelConfig()
  useDatabase = false
  initialized = true
}

// Data access functions
export async function getPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetPosts()
  }
  return [...posts]
}

export async function getAllPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetPosts()
  }
  return [...posts]
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetPostById(id)
  }
  return posts.find(p => p.id === id)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetPostBySlug(slug)
  }
  return posts.find(p => p.slug === slug)
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetPublishedPosts()
  }
  return posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  await ensureInitialized()
  if (useDatabase) {
    return dbCreatePost(post)
  }
  const now = new Date().toISOString()
  const newPost: BlogPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: post.createdAt || now,
    updatedAt: now,
  }
  posts.push(newPost)
  await savePosts(posts)
  return newPost
}

export async function updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  await ensureInitialized()
  if (useDatabase) {
    return dbUpdatePost(id, updates)
  }
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return null
  posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() }
  await savePosts(posts)
  return posts[index]
}

export async function deletePost(id: string): Promise<boolean> {
  await ensureInitialized()
  if (useDatabase) {
    return dbDeletePost(id)
  }
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return false
  posts.splice(index, 1)
  await savePosts(posts)
  return true
}

export async function getVideos(): Promise<Video[]> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetVideos()
  }
  return [...videos]
}

export async function addVideo(video: Video): Promise<Video> {
  await ensureInitialized()
  if (useDatabase) {
    return dbAddVideo(video)
  }
  videos.push(video)
  await saveVideos(videos)
  return video
}

export async function getChannelConfig(): Promise<ChannelConfig> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetChannelConfig()
  }
  return { ...channelConfig }
}

export async function updateChannelConfig(config: Partial<ChannelConfig>): Promise<ChannelConfig> {
  await ensureInitialized()
  if (useDatabase) {
    return dbUpdateChannelConfig(config)
  }
  channelConfig = { ...channelConfig, ...config }
  await saveChannelConfig(channelConfig)
  return { ...channelConfig }
}

export async function getSettings(): Promise<Record<string, unknown>> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetSettings()
  }
  return await loadSettings()
}

export async function saveSettingsData(settings: Record<string, unknown>): Promise<void> {
  await ensureInitialized()
  if (useDatabase) {
    await dbSaveSettings(settings)
    return
  }
  await saveSettings(settings)
}

export async function getStats(): Promise<DashboardStats> {
  await ensureInitialized()
  if (useDatabase) {
    return dbGetStats()
  }
  const published = posts.filter(p => p.status === 'published')
  const drafts = posts.filter(p => p.status === 'draft')
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

  const thisMonthViews = Math.floor(totalViews * 0.4)

  return {
    totalVideos: videos.length,
    totalPosts: posts.length,
    publishedPosts: published.length,
    draftPosts: drafts.length,
    totalViews,
    thisMonthViews,
  }
}
