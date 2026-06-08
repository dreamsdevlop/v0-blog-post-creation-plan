import { NextResponse } from 'next/server'
import { loadSettings, saveSettings } from '@/lib/storage'

const DEFAULT_SETTINGS = {
  blogName: 'Dark Chronicles',
  blogDescription: 'History, Mystery & Hidden Truths',
  adsenseId: '',
  amazonAffiliateId: '',
  autoPublish: false,
  autoFetchTranscript: true,
  defaultModel: 'deepseek',
  publishTime: '09:00',
  timezone: 'UTC',
}

export async function GET() {
  try {
    const settings = await loadSettings()
    const merged = { ...DEFAULT_SETTINGS, ...settings }
    return NextResponse.json({ settings: Object.keys(settings).length > 0 ? merged : null })
  } catch (error) {
    console.error('Failed to load settings:', error)
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { settings } = body as { settings?: Record<string, unknown> }

    if (!settings) {
      return NextResponse.json({ error: 'Settings payload is required' }, { status: 400 })
    }

    const merged = { ...DEFAULT_SETTINGS, ...settings }
    await saveSettings(merged)
    return NextResponse.json({ success: true, settings: merged })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    )
  }
}
