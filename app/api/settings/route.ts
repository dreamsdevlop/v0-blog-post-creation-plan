import { NextResponse } from 'next/server'

const SETTINGS_KEY = 'dark-chronicles-settings'

// In-memory settings store (in production, use a database)
let settingsStore: Record<string, unknown> = {}

export async function GET() {
  try {
    // Try to get from in-memory store first
    if (Object.keys(settingsStore).length > 0) {
      return NextResponse.json({ settings: settingsStore })
    }

    // Fallback to environment variable
    const envSettings = process.env[SETTINGS_KEY]
    if (envSettings) {
      try {
        const parsed = JSON.parse(envSettings)
        settingsStore = parsed
        return NextResponse.json({ settings: parsed })
      } catch {
        // ignore invalid JSON
      }
    }

    return NextResponse.json({ settings: null })
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

    // Persist to in-memory store
    settingsStore = { ...settingsStore, ...settings }

    return NextResponse.json({ success: true, settings: settingsStore })
  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    )
  }
}
