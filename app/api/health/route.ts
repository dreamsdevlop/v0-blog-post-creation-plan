import { NextResponse } from 'next/server'
import { isDatabaseConfigured } from '@/lib/neon'
import { getStats } from '@/lib/data'

export async function GET() {
  try {
    const stats = await getStats()
    const dbStatus = isDatabaseConfigured()

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'file-storage',
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
