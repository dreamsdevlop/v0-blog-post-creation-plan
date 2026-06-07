# Dark Chronicles - Automated Blog Platform

A fully automated blog platform that transforms YouTube video transcripts into SEO-optimized blog posts using AI, with automated publishing to Blogger.

## Features

- **AI Content Generation** - Transform video transcripts into engaging blog posts using multiple AI models (DeepSeek, Kimi, GLM, StepFun)
- **AI Image Generation** - Automatically generate featured images using NVIDIA's Stable Diffusion XL
- **YouTube Integration** - Import videos from YouTube channels and fetch real transcripts
- **Blogger Publishing** - Auto-publish posts directly to your Blogger blog
- **Automation Pipeline** - Fully automated video-to-blog workflow with monitoring
- **Analytics Dashboard** - Track views, posts, and performance metrics
- **Persistent Storage** - All data saved to local JSON files

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Required for AI content generation
NVIDIA_API_KEY_1=your_nvidia_api_key_1
NVIDIA_API_KEY_2=your_nvidia_api_key_2
NVIDIA_API_KEY_3=your_nvidia_api_key_3
NVIDIA_API_KEY_4=your_nvidia_api_key_4

# Required for image generation
NVIDIA_IMAGE_API_KEY=your_nvidia_image_api_key

# Required for YouTube integration
YOUTUBE_API_KEY=your_youtube_api_key

# Required for Blogger publishing
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BLOGGER_BLOG_ID=your_blogger_blog_id

# Site URL (for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

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
- **SWR** - Data fetching and caching

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Initialize sample data
- `npm run lint` - Run ESLint

## License

MIT
