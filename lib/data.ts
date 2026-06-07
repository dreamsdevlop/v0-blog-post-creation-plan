import type { BlogPost, Video, DashboardStats, ChannelConfig } from './types'
import {
  loadPosts,
  savePosts,
  loadVideos,
  saveVideos,
  loadChannelConfig,
  saveChannelConfig,
} from './storage'

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

async function ensureInitialized() {
  if (initialized) return
  posts = await loadPosts()
  videos = await loadVideos()
  channelConfig = await loadChannelConfig()
  initialized = true
}

async function persistPosts() {
  await savePosts(posts)
}

async function persistVideos() {
  await saveVideos(videos)
}

async function persistChannelConfig() {
  await saveChannelConfig(channelConfig)
}

// Data access functions
export async function getPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  return [...posts]
}

export async function getAllPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  return [...posts]
}

export async function getPostById(id: string): Promise<BlogPost | undefined> {
  await ensureInitialized()
  return posts.find(p => p.id === id)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  await ensureInitialized()
  return posts.find(p => p.slug === slug)
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  await ensureInitialized()
  return posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function createPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  await ensureInitialized()
  const now = new Date().toISOString()
  const newPost: BlogPost = {
    ...post,
    id: crypto.randomUUID(),
    createdAt: post.createdAt || now,
    updatedAt: now,
  }
  posts.push(newPost)
  await persistPosts()
  return newPost
}

export async function updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  await ensureInitialized()
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return null
  posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() }
  await persistPosts()
  return posts[index]
}

export async function deletePost(id: string): Promise<boolean> {
  await ensureInitialized()
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) return false
  posts.splice(index, 1)
  await persistPosts()
  return true
}

export async function getVideos(): Promise<Video[]> {
  await ensureInitialized()
  return [...videos]
}

export async function addVideo(video: Video): Promise<Video> {
  await ensureInitialized()
  videos.push(video)
  await persistVideos()
  return video
}

export async function getChannelConfig(): Promise<ChannelConfig> {
  await ensureInitialized()
  return { ...channelConfig }
}

export async function updateChannelConfig(config: Partial<ChannelConfig>): Promise<ChannelConfig> {
  await ensureInitialized()
  channelConfig = { ...channelConfig, ...config }
  await persistChannelConfig()
  return { ...channelConfig }
}

export async function getStats(): Promise<DashboardStats> {
  await ensureInitialized()
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
