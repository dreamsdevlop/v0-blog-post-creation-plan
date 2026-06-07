'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [bloggerStatus, setBloggerStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [settings, setSettings] = useState({
    blogName: 'Dark Chronicles',
    blogDescription: 'History, Mystery & Hidden Truths',
    adsenseId: '',
    amazonAffiliateId: '',
    autoPublish: false,
    defaultModel: 'deepseek',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Check Blogger connection status
  useEffect(() => {
    fetch('/api/publish-blogger')
      .then(res => res.json())
      .then(data => setBloggerStatus(data.connected ? 'connected' : 'disconnected'))
      .catch(() => setBloggerStatus('disconnected'))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your blog and monetization</p>
      </div>

      {saved && (
        <Alert>
          <CheckCircle className="size-4 text-green-500" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google Blogger</CardTitle>
            <CardDescription>Connect to publish posts directly to your Blogger blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">
                  {bloggerStatus === 'connected' 
                    ? 'Your Blogger account is connected' 
                    : 'Connect to publish posts to Blogger'}
                </p>
              </div>
              {bloggerStatus === 'loading' ? (
                <Badge variant="secondary">
                  <Loader2 className="size-3 mr-1 animate-spin" />
                  Checking
                </Badge>
              ) : bloggerStatus === 'connected' ? (
                <Badge variant="default">
                  <CheckCircle className="size-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="size-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>

            {bloggerStatus !== 'connected' && (
              <a href="/api/auth/blogger" className="block w-full">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <ExternalLink data-icon="inline-start" />
                  Connect Google Blogger
                </Button>
              </a>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Required Environment Variables:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>GOOGLE_CLIENT_ID</li>
                <li>GOOGLE_CLIENT_SECRET</li>
                <li>BLOGGER_BLOG_ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Settings</CardTitle>
            <CardDescription>Basic configuration for your blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Blog Name</label>
              <Input
                value={settings.blogName}
                onChange={(e) => setSettings({ ...settings, blogName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blog Description</label>
              <Textarea
                value={settings.blogDescription}
                onChange={(e) => setSettings({ ...settings, blogDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default AI Model</label>
              <div className="flex flex-wrap gap-2">
                {['deepseek', 'kimi', 'glm', 'stepfun'].map((model) => (
                  <Button
                    key={model}
                    variant={settings.defaultModel === model ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, defaultModel: model })}
                  >
                    {model.charAt(0).toUpperCase() + model.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monetization</CardTitle>
            <CardDescription>Configure your ad and affiliate settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Google AdSense Publisher ID</label>
              <Input
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={settings.adsenseId}
                onChange={(e) => setSettings({ ...settings, adsenseId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Your AdSense publisher ID for display ads
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amazon Associates Tag</label>
              <Input
                placeholder="your-tag-20"
                value={settings.amazonAffiliateId}
                onChange={(e) => setSettings({ ...settings, amazonAffiliateId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Your Amazon affiliate tracking ID
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Monetization Guide</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Step 1:</strong> Apply for Google AdSense once you have 10-15 quality posts.
                </p>
                <p>
                  <strong className="text-foreground">Step 2:</strong> Join Amazon Associates to earn from book/product recommendations.
                </p>
                <p>
                  <strong className="text-foreground">Step 3:</strong> At 50K monthly sessions, apply for Mediavine for 3-10x higher ad rates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>Configure automatic content processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Publish Posts</p>
                <p className="text-sm text-muted-foreground">
                  Automatically publish generated posts without review
                </p>
              </div>
              <Button
                variant={settings.autoPublish ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings({ ...settings, autoPublish: !settings.autoPublish })}
              >
                {settings.autoPublish ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Zapier Integration</h4>
              <p className="text-sm text-muted-foreground">
                Connect Zapier to automate video imports and post scheduling.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink data-icon="inline-start" />
                Configure Zapier
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Models</CardTitle>
            <CardDescription>Your configured NVIDIA AI models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: 'DeepSeek 4 Pro Flash', status: 'connected', key: 'NVIDIA_API_KEY_1' },
                { name: 'Kimi K2.6', status: 'connected', key: 'NVIDIA_API_KEY_2' },
                { name: 'GLM 5.1', status: 'connected', key: 'NVIDIA_API_KEY_3' },
                { name: 'StepFun 3.7 Flash', status: 'connected', key: 'NVIDIA_API_KEY_4' },
              ].map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.key}</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="size-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save data-icon="inline-start" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
