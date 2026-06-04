import { ContentGenerator } from '@/components/admin/content-generator'

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Content</h1>
        <p className="text-muted-foreground">
          Transform video transcripts into SEO-optimized blog posts using AI
        </p>
      </div>

      <ContentGenerator />
    </div>
  )
}
