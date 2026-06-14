"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Clock, Eye, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { BlogPost } from "@/lib/types"

interface HoverRevealCardProps {
  post: BlogPost
  className?: string
  featured?: boolean
}

function HoverRevealCard({ post, className, featured = false }: HoverRevealCardProps) {
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-500",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        featured && "md:col-span-2 lg:col-span-2",
        className
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "relative overflow-hidden",
          featured ? "md:w-1/2" : "aspect-video"
        )}
      >
        <img
          src={post.thumbnail}
          alt={post.title}
          className={cn(
            "size-full object-cover transition-transform duration-700 ease-out",
            "group-hover:scale-110"
          )}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content wrapper */}
      <div
        className={cn(
          "relative flex flex-col p-6",
          featured && "md:w-1/2 md:flex md:flex-col md:justify-center"
        )}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors duration-300 group-hover:bg-primary/20 group-hover:text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-bold text-card-foreground transition-colors duration-300 group-hover:text-primary",
            featured ? "text-2xl" : "text-lg"
          )}
        >
          {post.title}
        </h3>

        {/* Excerpt - always visible */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        {/* Hidden content that reveals on hover */}
        <div
          className={cn(
            "mt-4 flex items-center gap-4 text-xs text-muted-foreground",
            "max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out",
            "group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-4"
          )}
        >
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {post.views.toLocaleString()} views
          </span>
        </div>

        {/* Read more link - reveals on hover */}
        <div
          className={cn(
            "mt-4 flex items-center gap-2 text-sm font-medium text-primary",
            "max-h-0 overflow-hidden opacity-0 transition-all duration-500 delay-100 ease-out",
            "group-hover:max-h-10 group-hover:opacity-100"
          )}
        >
          <span>Read Article</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Subtle border glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-primary/5 via-transparent to-primary/5",
          "group-hover:opacity-100 pointer-events-none"
        )}
      />
    </article>
  )
}

export { HoverRevealCard }
export type { HoverRevealCardProps }
