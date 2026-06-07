import { NextResponse } from 'next/server'
import { getStats } from '@/lib/data'

export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      {
        totalVideos: 0,
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        thisMonthViews: 0,
      },
      { status: 500 }
    )
  }
}
