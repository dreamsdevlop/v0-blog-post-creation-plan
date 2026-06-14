import { StatsCards } from '@/components/admin/stats-cards'
import { RecentPosts } from '@/components/admin/recent-posts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Video, FileText } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to Dark Chronicles admin panel
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentPosts />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with content creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/generate" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Sparkles data-icon="inline-start" />
                  Generate New Post
                </Button>
              </Link>
              <Link href="/admin/videos" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Video data-icon="inline-start" />
                  Import Videos
                </Button>
              </Link>
              <Link href="/admin/posts" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText data-icon="inline-start" />
                  Manage Posts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monetization Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">AdSense:</strong> Add display ads once you reach 10K monthly views.
              </p>
              <p>
                <strong className="text-foreground">Affiliates:</strong> Link to books, documentaries on Amazon for 4-8% commission.
              </p>
              <p>
                <strong className="text-foreground">Mediavine:</strong> Apply at 50K sessions/month for premium rates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
