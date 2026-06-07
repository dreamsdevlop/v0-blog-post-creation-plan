import type { BlogPost, Video, ChannelConfig } from './types'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json')
const CHANNEL_FILE = path.join(DATA_DIR, 'channel.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // directory may already exist
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

const SEED_POSTS: BlogPost[] = [
  {
    id: '1',
    videoId: 'sample-1',
    title: 'The Mysterious Disappearance of the Roanoke Colony',
    slug: 'mysterious-disappearance-roanoke-colony',
    content: `<h2>The Lost Colony Mystery</h2>
<p>In 1587, a group of 115 English settlers arrived on Roanoke Island, off the coast of present-day North Carolina. Led by John White, they established what was meant to be England's first permanent settlement in the New World.</p>

<p>When White returned from a supply trip to England in 1590, he found the colony completely abandoned. The only clue was the word "CROATOAN" carved into a wooden post. To this day, no one knows what happened to the colonists.</p>

<h2>Theories and Speculation</h2>
<p>Historians have proposed numerous theories: integration with local Native American tribes, death from disease or famine, attacks, or even attempts to sail back to England. Recent archaeological discoveries have provided tantalizing hints, but the truth remains elusive.</p>

<h2>The Dark Truth</h2>
<p>Some researchers believe there's more to this story than we've been told. Evidence suggests the colonists may have been involved in secret operations, and their disappearance was no accident...</p>`,
    excerpt: 'The mysterious vanishing of 115 colonists from Roanoke Island in 1590 remains one of America\'s oldest unsolved mysteries.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published',
    seoTitle: 'Roanoke Colony Mystery: What Really Happened to the Lost Colonists?',
    seoDescription: 'Discover the dark truth behind the mysterious disappearance of the Roanoke Colony in 1590.',
    tags: ['mystery', 'history', 'roanoke', 'colonial america'],
    views: 1247,
    aiModel: 'deepseek',
  },
  {
    id: '2',
    videoId: 'sample-2',
    title: 'Secret Societies That Shaped History',
    slug: 'secret-societies-shaped-history',
    content: `<h2>The Hidden Hand of History</h2>
<p>Throughout human history, secret societies have operated in the shadows, pulling strings and shaping events in ways most people never realize.</p>

<p>From the Knights Templar to the Illuminati, from Skull and Bones to the Bohemian Grove, these organizations have counted among their members some of the most powerful people in the world.</p>

<h2>Their Influence Today</h2>
<p>Many believe these societies continue to wield enormous influence over global politics, finance, and culture. The evidence is all around us, hidden in plain sight...</p>`,
    excerpt: 'From the Knights Templar to modern-day power brokers, secret societies have always shaped world events from the shadows.',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'published',
    seoTitle: 'Secret Societies: The Hidden Powers Behind History',
    seoDescription: 'Explore the secret societies that have shaped world events for centuries.',
    tags: ['secret societies', 'illuminati', 'history', 'conspiracy'],
    views: 892,
    aiModel: 'kimi',
  },
  {
    id: '3',
    videoId: 'sample-3',
    title: 'The Dark Origins of Ancient Cults',
    slug: 'dark-origins-ancient-cults',
    content: `<h2>Cults Through the Ages</h2>
<p>Long before modern cult leaders, ancient civilizations harbored mysterious religious sects with dark rituals and forbidden knowledge.</p>`,
    excerpt: 'Ancient civilizations harbored mysterious religious sects with dark rituals and forbidden knowledge that still influence us today.',
    thumbnail: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'draft',
    tags: ['cults', 'ancient history', 'religion', 'rituals'],
    views: 0,
    aiModel: 'glm',
  },
]

const SEED_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'What Really Happened at Dyatlov Pass?',
    description: 'Exploring the mysterious deaths of 9 hikers in 1959',
    thumbnail: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=400',
    publishedAt: new Date().toISOString(),
    channelTitle: 'Dark History Channel',
    videoUrl: 'https://youtube.com/watch?v=example1',
    duration: 'PT15M30S',
  },
  {
    id: 'vid-2',
    title: 'The Curse of the Hope Diamond',
    description: 'The dark history of the world\'s most famous gem',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    channelTitle: 'Dark History Channel',
    videoUrl: 'https://youtube.com/watch?v=example2',
    duration: 'PT12M45S',
  },
]

const SEED_CHANNEL: ChannelConfig = {
  channelId: '',
  channelName: '',
  channelUrl: '',
  autoProcess: false,
}

const SEED_SETTINGS: Record<string, unknown> = {
  blogName: 'Dark Chronicles',
  blogDescription: 'History, Mystery & Hidden Truths',
  adsenseId: '',
  amazonAffiliateId: '',
  autoPublish: false,
  defaultModel: 'deepseek',
}

// Posts
export async function loadPosts(): Promise<BlogPost[]> {
  const posts = await readJsonFile<BlogPost[]>(POSTS_FILE, [])
  if (posts.length === 0) {
    await writeJsonFile(POSTS_FILE, SEED_POSTS)
    return [...SEED_POSTS]
  }
  return posts
}

export async function savePosts(posts: BlogPost[]): Promise<void> {
  await writeJsonFile(POSTS_FILE, posts)
}

// Videos
export async function loadVideos(): Promise<Video[]> {
  const videos = await readJsonFile<Video[]>(VIDEOS_FILE, [])
  if (videos.length === 0) {
    await writeJsonFile(VIDEOS_FILE, SEED_VIDEOS)
    return [...SEED_VIDEOS]
  }
  return videos
}

export async function saveVideos(videos: Video[]): Promise<void> {
  await writeJsonFile(VIDEOS_FILE, videos)
}

// Channel config
export async function loadChannelConfig(): Promise<ChannelConfig> {
  return readJsonFile<ChannelConfig>(CHANNEL_FILE, SEED_CHANNEL)
}

export async function saveChannelConfig(config: ChannelConfig): Promise<void> {
  await writeJsonFile(CHANNEL_FILE, config)
}

// Settings
export async function loadSettings(): Promise<Record<string, unknown>> {
  const settings = await readJsonFile<Record<string, unknown>>(SETTINGS_FILE, {})
  if (Object.keys(settings).length === 0) {
    await writeJsonFile(SETTINGS_FILE, SEED_SETTINGS)
    return { ...SEED_SETTINGS }
  }
  return settings
}

export async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  await writeJsonFile(SETTINGS_FILE, settings)
}
