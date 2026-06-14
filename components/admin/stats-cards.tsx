'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Video, Eye, TrendingUp } from 'lucide-react'
import type { DashboardStats } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function StatsCards() {
  const { data: stats } = useSWR<DashboardStats>('/api/stats', fetcher, {
    refreshInterval: 30000,
  })

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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
