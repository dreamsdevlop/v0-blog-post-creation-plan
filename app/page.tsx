import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Sparkles, 
  Video, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Video,
      title: 'YouTube Import',
      description: 'Import videos from your partner channel with just a URL. We extract transcripts automatically.',
    },
    {
      icon: Sparkles,
      title: 'AI Content Generation',
      description: '4 powerful NVIDIA AI models transform transcripts into SEO-optimized blog posts.',
    },
    {
      icon: Zap,
      title: 'Fully Automated',
      description: 'Set up once and let the system automatically generate posts from new videos.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Built-in',
      description: 'Track views, engagement, and earnings with our integrated analytics dashboard.',
    },
  ]

  const steps = [
    { step: '01', title: 'Connect Channel', description: 'Link your partner YouTube channel' },
    { step: '02', title: 'Import Video', description: 'Paste URL or auto-sync new uploads' },
    { step: '03', title: 'AI Transform', description: 'Generate engaging blog content' },
    { step: '04', title: 'Publish & Earn', description: 'Monetize with ads and affiliates' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Dark Chronicles</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm">Blog</Button>
            </Link>
            <Link href="/admin">
              <Button size="sm">Admin Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="secondary" className="mb-6">
            Powered by NVIDIA AI Models
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
            Turn YouTube Videos Into
            <span className="block text-primary">Automated Blog Income</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Transform your partner channel&apos;s videos into SEO-optimized blog posts using AI. 
            Build passive income through ads and affiliate marketing, completely automated.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/admin">
              <Button size="lg">
                Get Started Free
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View Sample Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="mt-2 text-muted-foreground">
              A complete system for automated content creation and monetization
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Four simple steps to automated blog income
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex size-16 items-center justify-center rounded-full border-2 border-primary text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold">Multiple Revenue Streams</h2>
              <p className="mt-4 text-muted-foreground">
                Build sustainable income through diversified monetization strategies.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Display Advertising</h4>
                    <p className="text-sm text-muted-foreground">
                      Start with AdSense, graduate to Mediavine at 50K sessions for 3-10x higher RPM.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Affiliate Marketing</h4>
                    <p className="text-sm text-muted-foreground">
                      Recommend books, documentaries, and courses. Earn 4-8% commission per sale.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sponsored Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Once established, earn $200-2000 per sponsored post from relevant brands.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-8">
              <h3 className="text-xl font-bold mb-6">Potential Monthly Earnings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">10K views/month</span>
                  <span className="font-semibold">$50 - $150</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">50K views/month</span>
                  <span className="font-semibold">$300 - $1,000</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">100K views/month</span>
                  <span className="font-semibold">$800 - $3,000</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">500K+ views/month</span>
                  <span className="font-semibold text-primary">$5,000+</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                * Estimates based on typical AdSense/Mediavine RPM rates + affiliate income
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-t from-primary/10 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Start Your Blog Empire?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join the automated content revolution. Transform videos into income while you sleep.
          </p>
          <div className="mt-8">
            <Link href="/admin">
              <Button size="lg">
                Launch Your Blog Now
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="size-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Dark Chronicles</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Dark Chronicles. Built for creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
