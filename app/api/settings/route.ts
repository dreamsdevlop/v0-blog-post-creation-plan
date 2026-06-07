import { NextResponse } from 'next/server'
import { loadSettings, saveSettings } from '@/lib/storage'

export async function GET() {
  try {
    const settings = await loadSettings()
    return NextResponse.json({ settings: Object.keys(settings).length > 0 ? settings : null })
  } catch (error) {
    console.error('Failed to load settings:', error)
    return NextResponse.json({ settings: null })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { settings } = body as { settings?: Record<string, unknown> }

    if (!settings) {
      return NextResponse.json({ error: 'Settings payload is required' }, { status: 400 })
    }

    await saveSettings(settings)
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    )
  }
}
