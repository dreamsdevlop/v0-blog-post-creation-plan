import { getSql, isDatabaseConfigured } from './neon'
import type { BlogPost, Video, ChannelConfig } from './types'

let dbAvailable = false

export async function initDatabase() {
  if (!isDatabaseConfigured()) {
    console.log('DATABASE_URL not configured, using file-based storage')
    return
  }

  let sql: ReturnType<typeof getSql> | null = null
  try {
    sql = getSql()
  } catch (error) {
    console.error('Database client initialization error, falling back to file storage:', error)
    dbAvailable = false
    return
  }

  if (!sql) {
    console.log('SQL client is null, using file-based storage')
    dbAvailable = false
    return
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        video_id TEXT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'draft',
        seo_title TEXT,
        seo_description TEXT,
        tags TEXT[] DEFAULT '{}',
        views INTEGER NOT NULL DEFAULT 0,
        ai_model TEXT NOT NULL
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL,
        channel_title TEXT NOT NULL,
        video_url TEXT NOT NULL UNIQUE,
        duration TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS channel_config (
        id SERIAL PRIMARY KEY,
        channel_id TEXT,
        channel_name TEXT,
        channel_url TEXT,
        auto_process BOOLEAN DEFAULT FALSE
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      )
    `

    dbAvailable = true
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error, falling back to file storage:', error)
    dbAvailable = false
  }
}

export function isDbAvailable(): boolean {
  return dbAvailable && isDatabaseConfigured()
}

// Posts
export async function dbGetPosts(): Promise<BlogPost[]> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return []

  const rows = (await sql`SELECT * FROM posts ORDER BY created_at DESC`) as Record<string, unknown>[]
  return rows.map(rowToPost)
}

export async function dbGetPostById(id: string): Promise<BlogPost | undefined> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return undefined

  const rows = (await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[]
  if (rows.length === 0) return undefined
  return rowToPost(rows[0])
}

export async function dbGetPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return undefined

  const rows = (await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`) as Record<string, unknown>[]
  if (rows.length === 0) return undefined
  return rowToPost(rows[0])
}

export async function dbGetPublishedPosts(): Promise<BlogPost[]> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return []

  const rows = (await sql`SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC`) as Record<string, unknown>[]
  return rows.map(rowToPost)
}

export async function dbCreatePost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) throw new Error('Database not available')

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await sql`
    INSERT INTO posts (
      id, video_id, title, slug, content, excerpt, thumbnail,
      published_at, created_at, updated_at, status, seo_title,
      seo_description, tags, views, ai_model
    ) VALUES (
      ${id},
      ${post.videoId},
      ${post.title},
      ${post.slug},
      ${post.content},
      ${post.excerpt},
      ${post.thumbnail},
      ${post.publishedAt},
      ${post.createdAt || now},
      ${now},
      ${post.status},
      ${post.seoTitle || null},
      ${post.seoDescription || null},
      ${post.tags || []},
      ${post.views || 0},
      ${post.aiModel}
    )
  `

  return { ...post, id, createdAt: post.createdAt || now, updatedAt: now }
}

export async function dbUpdatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return null

  const now = new Date().toISOString()
  const existing = await dbGetPostById(id)
  if (!existing) return null

  const updated = { ...existing, ...updates, updatedAt: now }

  await sql`
    UPDATE posts SET
      title = ${updated.title},
      slug = ${updated.slug},
      content = ${updated.content},
      excerpt = ${updated.excerpt},
      thumbnail = ${updated.thumbnail},
      published_at = ${updated.publishedAt},
      updated_at = ${now},
      status = ${updated.status},
      seo_title = ${updated.seoTitle || null},
      seo_description = ${updated.seoDescription || null},
      tags = ${updated.tags || []},
      views = ${updated.views},
      ai_model = ${updated.aiModel}
    WHERE id = ${id}
  `

  return updated
}

export async function dbDeletePost(id: string): Promise<boolean> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return false

  const existing = await dbGetPostById(id)
  if (!existing) return false

  await sql`DELETE FROM posts WHERE id = ${id}`
  return true
}

// Videos
export async function dbGetVideos(): Promise<Video[]> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return []

  const rows = (await sql`SELECT * FROM videos ORDER BY published_at DESC`) as Record<string, unknown>[]
  return rows.map(rowToVideo)
}

export async function dbAddVideo(video: Video): Promise<Video> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) throw new Error('Database not available')

  await sql`
    INSERT INTO videos (
      id, title, description, thumbnail, published_at,
      channel_title, video_url, duration
    ) VALUES (
      ${video.id},
      ${video.title},
      ${video.description || null},
      ${video.thumbnail},
      ${video.publishedAt},
      ${video.channelTitle},
      ${video.videoUrl},
      ${video.duration || null}
    )
    ON CONFLICT (video_url) DO NOTHING
  `

  return video
}

// Channel config
export async function dbGetChannelConfig(): Promise<ChannelConfig> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) {
    return {
      channelId: '',
      channelName: '',
      channelUrl: '',
      autoProcess: false,
    }
  }

  const rows = (await sql`SELECT * FROM channel_config LIMIT 1`) as Record<string, unknown>[]
  if (rows.length === 0) {
    return {
      channelId: '',
      channelName: '',
      channelUrl: '',
      autoProcess: false,
    }
  }

  const row = rows[0]
  return {
    channelId: (row.channel_id as string) || '',
    channelName: (row.channel_name as string) || '',
    channelUrl: (row.channel_url as string) || '',
    autoProcess: (row.auto_process as boolean) || false,
  }
}

export async function dbUpdateChannelConfig(config: Partial<ChannelConfig>): Promise<ChannelConfig> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) throw new Error('Database not available')

  const existing = await dbGetChannelConfig()
  const updated = { ...existing, ...config }

  await sql`
    INSERT INTO channel_config (id, channel_id, channel_name, channel_url, auto_process)
    VALUES (1, ${updated.channelId}, ${updated.channelName}, ${updated.channelUrl}, ${updated.autoProcess})
    ON CONFLICT (id) DO UPDATE SET
      channel_id = EXCLUDED.channel_id,
      channel_name = EXCLUDED.channel_name,
      channel_url = EXCLUDED.channel_url,
      auto_process = EXCLUDED.auto_process
  `

  return updated
}

// Settings
export async function dbGetSettings(): Promise<Record<string, unknown>> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) {
    return {}
  }

  const rows = (await sql`SELECT key, value FROM settings`) as { key: string; value: unknown }[]
  const settings: Record<string, unknown> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }
  return settings
}

export async function dbSaveSettings(settings: Record<string, unknown>): Promise<void> {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) return

  for (const [key, value] of Object.entries(settings)) {
    await sql`
      INSERT INTO settings (key, value)
      VALUES (${key}, ${JSON.stringify(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `
  }
}

// Stats
export async function dbGetStats() {
  if (!isDbAvailable()) {
    throw new Error('Database not available')
  }

  const sql = getSql()
  if (!sql) {
    return {
      totalVideos: 0,
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      thisMonthViews: 0,
    }
  }

  try {
    const posts = await dbGetPosts()
    const published = posts.filter(p => p.status === 'published')
    const drafts = posts.filter(p => p.status === 'draft')
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
    const thisMonthViews = Math.floor(totalViews * 0.4)

    return {
      totalVideos: 0,
      totalPosts: posts.length,
      publishedPosts: published.length,
      draftPosts: drafts.length,
      totalViews,
      thisMonthViews,
    }
  } catch (error) {
    console.error('Failed to fetch stats from database, returning empty stats:', error)
    return {
      totalVideos: 0,
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
      thisMonthViews: 0,
    }
  }
}

function rowToPost(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    videoId: (row.video_id as string) || '',
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    excerpt: row.excerpt as string,
    thumbnail: row.thumbnail as string,
    publishedAt: row.published_at as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    status: row.status as BlogPost['status'],
    seoTitle: row.seo_title as string | undefined,
    seoDescription: row.seo_description as string | undefined,
    tags: (row.tags as string[]) || [],
    views: (row.views as number) || 0,
    aiModel: row.ai_model as string,
  }
}

function rowToVideo(row: Record<string, unknown>): Video {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    thumbnail: row.thumbnail as string,
    publishedAt: row.published_at as string,
    channelTitle: row.channel_title as string,
    videoUrl: row.video_url as string,
    duration: row.duration as string | undefined,
  }
}
