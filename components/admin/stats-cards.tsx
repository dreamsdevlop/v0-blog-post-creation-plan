'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Video, Eye, TrendingUp, AlertCircle } from 'lucide-react'
import type { DashboardStats } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
})

export function StatsCards() {
  const { data: stats, error, isLoading } = useSWR<DashboardStats & { dataSource?: string }>('/api/stats', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="size-4 text-destructive" />
          <CardTitle className="text-sm font-medium text-destructive">Failed to load stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <p className="text-xs text-muted-foreground mt-1">Check server logs for details.</p>
        </CardContent>
      </Card>
    )
  }

  const cards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts ?? 0,
      description: `${stats?.publishedPosts ?? 0} published, ${stats?.draftPosts ?? 0} drafts`,
      icon: FileText,
    },
    {
      title: 'Videos Imported',
      value: stats?.totalVideos ?? 0,
      description: 'From partner channel',
      icon: Video,
    },
    {
      title: 'Total Views',
      value: stats?.totalViews?.toLocaleString() ?? '0',
      description: 'All-time page views',
      icon: Eye,
    },
    {
      title: 'This Month',
      value: stats?.thisMonthViews?.toLocaleString() ?? '0',
      description: 'Views this month',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            {stats?.dataSource && (
              <p className="text-[10px] text-muted-foreground mt-1">Source: {stats.dataSource}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
