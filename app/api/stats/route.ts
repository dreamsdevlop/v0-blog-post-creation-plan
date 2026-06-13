import { NextResponse } from 'next/server'
import { getStats, isDbAvailable } from '@/lib/data'

export async function GET() {
  let stats
  try {
    stats = await getStats()
  } catch (error) {
    console.error('Stats API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      {
        totalVideos: 0,
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        thisMonthViews: 0,
        dataSource: 'error',
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack }),
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ ...stats, dataSource: isDbAvailable() ? 'database' : 'file' })
}
