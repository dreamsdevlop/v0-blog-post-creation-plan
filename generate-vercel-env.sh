#!/bin/bash
# Generate Vercel Environment Variables
# This script outputs all env vars in a format you can copy-paste into Vercel Dashboard

# Generate a secure CRON_SECRET
CRON_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "generate-a-secure-random-string-here")

cat << 'EOF'
# Copy everything below and paste into Vercel Dashboard → Settings → Environment Variables
# Set Environment to "Production" for all of them

# ─── Site URL ───────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://v0-blog-post-creation-plan-rlys.vercel.app

# ─── Database (Neon PostgreSQL) ─────────────────────────
DATABASE_URL=postgresql://neondb_owner:npg_wJbegHYI15Bq@ep-rapid-butterfly-apa0ew4k-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# ─── Google OAuth / Blogger ─────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
BLOGGER_BLOG_ID=your-blogger-blog-id

# ─── YouTube ────────────────────────────────────────────
YOUTUBE_API_KEY=your-youtube-api-key

# ─── NVIDIA AI Models (text generation) ─────────────────
NVIDIA_API_KEY_1=your-nvidia-api-key-1
NVIDIA_API_KEY_2=your-nvidia-api-key-2
NVIDIA_API_KEY_3=your-nvidia-api-key-3
NVIDIA_API_KEY_4=your-nvidia-api-key-4
NVIDIA_API_KEY_5=your-nvidia-api-key-5

# ─── NVIDIA Image Generation ────────────────────────────
NVIDIA_IMAGE_API_KEY=your-nvidia-image-api-key
NVIDIA_IMAGE_API_KEY_2=your-nvidia-image-api-key-2
NVIDIA_IMAGE_API_KEY_3=your-nvidia-image-api-key-3
NVIDIA_IMAGE_API_KEY_4=your-nvidia-image-api-key-4

# ─── Cron Job Secret ────────────────────────────────────
CRON_SECRET=$CRON_SECRET
EOF

echo ""
echo "✅ Done! CRON_SECRET was auto-generated."
echo "⚠️  Remember to replace NEXT_PUBLIC_SITE_URL with your actual Vercel domain."
