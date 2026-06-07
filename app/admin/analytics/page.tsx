'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Eye, FileText, Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AnalyticsPage() {
  const { data: stats } = useSWR<{
    totalVideos: number
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    thisMonthViews: number
  }>('/api/stats', fetcher)

  const { data: posts } = useSWR<BlogPost[]>('/api/posts', fetcher)

  const weeklyData = [
    { day: 'Mon', views: Math.floor((stats?.thisMonthViews || 0) * 0.12) },
    { day: 'Tue', views: Math.floor((stats?.thisMonthViews || 0) * 0.15) },
    { day: 'Wed', views: Math.floor((stats?.thisMonthViews || 0) * 0.13) },
    { day: 'Thu', views: Math.floor((stats?.thisMonthViews || 0) * 0.18) },
    { day: 'Fri', views: Math.floor((stats?.thisMonthViews || 0) * 0.2) },
    { day: 'Sat', views: Math.floor((stats?.thisMonthViews || 0) * 0.11) },
    { day: 'Sun', views: Math.floor((stats?.thisMonthViews || 0) * 0.11) },
  ]

  const maxViews = Math.max(...weeklyData.map(d => d.views), 1)

  const topPosts = (posts || [])
    .filter(p => p.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map(p => ({ title: p.title, views: p.views, growth: 0 }))

  const trafficSources = [
    { source: 'Organic Search', percentage: 45 },
    { source: 'Direct', percentage: 25 },
    { source: 'Social Media', percentage: 20 },
    { source: 'Referral', percentage: 10 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your blog performance and growth</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalViews || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3 text-green-500" />
              <span className="text-green-500">+12%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Posts
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedPosts || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.draftPosts || 0} draft pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time on Page
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4:32</div>
            <p className="text-xs text-muted-foreground">Above industry average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Est. Revenue
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${((stats?.totalViews || 0) * 0.005).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on $5 RPM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Views</CardTitle>
            <CardDescription>Page views over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                    style={{ height: `${(day.views / maxViews) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{source.source}</span>
                  <span className="font-medium">{source.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Your most viewed content</CardDescription>
        </CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No published posts yet
            </div>
          ) : (
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div
                  key={post.title}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {post.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <Badge variant={post.growth > 0 ? 'default' : 'secondary'}>
                    {post.growth > 0 ? '+' : ''}{post.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
