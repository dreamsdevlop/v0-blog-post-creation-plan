# Dark Chronicles - Automated Blog Platform

A fully automated blog platform that transforms YouTube video transcripts into SEO-optimized blog posts using AI, with automated publishing to Blogger.

## Features

- **AI Content Generation** - Transform video transcripts into engaging blog posts using multiple AI models (DeepSeek, Kimi, GLM, StepFun)
- **AI Image Generation** - Automatically generate featured images using NVIDIA's Stable Diffusion XL
- **YouTube Integration** - Import videos from YouTube channels and fetch real transcripts
- **Blogger Publishing** - Auto-publish posts directly to your Blogger blog
- **Automation Pipeline** - Fully automated video-to-blog workflow with monitoring
- **Analytics Dashboard** - Track views, posts, and performance metrics
- **Persistent Storage** - File-based storage with Neon PostgreSQL support

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SITE_URL` - Your site URL
- `NVIDIA_API_KEY_1` through `NVIDIA_API_KEY_4` - NVIDIA AI API keys
- `NVIDIA_IMAGE_API_KEY` - NVIDIA Image API key
- `YOUTUBE_API_KEY` - YouTube Data API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `BLOGGER_BLOG_ID` - Your Blogger blog ID
- `DATABASE_URL` - Neon PostgreSQL connection string (optional, falls back to file storage)

### 3. Initialize Data

```bash
npm run seed
```

This creates sample posts, videos, and settings in the `data/` directory.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the blog.

Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

## Deploy to Vercel with Neon Database

### Step 1: Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/dbname?sslmode=require`)

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in Vercel project settings:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXT_PUBLIC_SITE_URL` - Your Vercel app URL
   - All other required API keys
5. Click **Deploy**

### Step 3: Initialize Database

After first deploy, trigger a serverless function to initialize tables:

```bash
curl https://your-app.vercel.app/api/stats
```

Or visit any admin page - the database initializes automatically on first request.

## Database Schema

The app uses these tables when `DATABASE_URL` is configured:

- `posts` - Blog posts
- `videos` - Imported YouTube videos
- `channel_config` - YouTube channel configuration
- `settings` - App settings

When `DATABASE_URL` is not set, the app falls back to file-based storage in the `data/` directory.

## Project Structure

```
app/
├── admin/                    # Admin panel pages
│   ├── page.tsx             # Dashboard
│   ├── posts/               # Post management
│   ├── videos/              # Video import
│   ├── generate/            # AI content generation
│   ├── automation/          # Automated workflow
│   ├── analytics/           # Analytics dashboard
│   └── settings/            # Configuration
├── api/                     # API routes
│   ├── auth/                # OAuth authentication
│   ├── generate/            # AI content generation
│   ├── generate-image/      # AI image generation
│   ├── posts/               # Post CRUD operations
│   ├── publish-blogger/     # Blogger publishing
│   ├── videos/              # Video management
│   ├── youtube/transcript/  # Transcript fetching
│   ├── stats/               # Dashboard statistics
│   └── settings/            # App settings
└── blog/                    # Public blog pages

components/
├── admin/                   # Admin components
│   ├── content-generator.tsx
│   ├── automated-workflow.tsx
│   ├── recent-posts.tsx
│   ├── stats-cards.tsx
│   └── sidebar.tsx
└── ui/                      # UI components

lib/
├── blogger.ts               # Blogger API integration
├── data.ts                  # Data access layer (async)
├── nvidia-ai.ts             # NVIDIA AI integration
├── nvidia-image.ts          # NVIDIA image generation
├── storage.ts               # File-based persistent storage
├── neon.ts                  # Neon database connection
├── db.ts                    # PostgreSQL database operations
├── types.ts                 # TypeScript types
└── youtube.ts               # YouTube API integration
```

## How It Works

1. **Import Videos** - Add YouTube videos via URL or sync an entire channel
2. **Fetch Transcripts** - Automatically fetch real video transcripts
3. **Generate Content** - AI transforms transcripts into SEO-optimized blog posts
4. **Generate Images** - AI creates featured images based on content
5. **Publish** - Posts are published to your Blogger blog or saved as drafts
6. **Automate** - Set up the automation pipeline for hands-free content creation

## Monetization

The platform is designed for monetization through:
- **Google AdSense** - Display ads on your blog
- **Amazon Associates** - Affiliate links in posts
- **Mediavine** - Premium ad network at 50K+ sessions/month

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI component library
- **NVIDIA AI** - Content and image generation
- **Blogger API** - Blog publishing
- **YouTube Data API** - Video metadata and transcripts
- **Neon PostgreSQL** - Production database
- **SWR** - Data fetching and caching

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Initialize sample data
- `npm run lint` - Run ESLint

## License

MIT
