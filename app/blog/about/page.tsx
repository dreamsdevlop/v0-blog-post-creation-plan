import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Dark Chronicles</span>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft data-icon="inline-start" />
                All Posts
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">About Dark Chronicles</h1>
          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Dark Chronicles is a blog dedicated to uncovering the hidden truths, mysteries,
              and forgotten stories that shaped our world. From ancient cults to secret societies,
              from unexplained disappearances to dark historical truths &mdash; we explore it all.
            </p>
            <p>
              Every story has a shadow side. The history we learn in school often glosses over
              the strange, the mysterious, and the deeply unsettling. Our mission is to bring
              those stories to light, with careful research and a passion for the unknown.
            </p>
            <p>
              Powered by cutting-edge AI technology, we transform in-depth video research into
              comprehensive, SEO-optimized blog posts that reach readers around the world. Our
              content is generated using multiple AI models including DeepSeek, Kimi, GLM, and
              StepFun, each bringing unique strengths to different types of storytelling.
            </p>
            <p>
              Whether you&apos;re a history enthusiast, a mystery lover, or simply someone who
              believes there&apos;s more to the story than what we&apos;re told &mdash; Dark
              Chronicles is for you.
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">What We Cover</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>Mysterious historical disappearances and unsolved cases</li>
              <li>Secret societies and their influence on world events</li>
              <li>Ancient cults, rituals, and forbidden knowledge</li>
              <li>Conspiracy theories and the evidence behind them</li>
              <li>Dark chapters of history that textbooks left out</li>
              <li>Paranormal phenomena and unexplained events</li>
            </ul>
          </div>

          <div className="mt-8">
            <Link href="/blog">
              <Button size="lg">
                Explore Our Stories
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Dark Chronicles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
