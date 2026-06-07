import { NextResponse } from 'next/server'
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '@/lib/data'
import type { BlogPost } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const post = await getPostById(id)
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      return NextResponse.json(post)
    }

    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const post = await createPost(body as Omit<BlogPost, 'id'>)
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const body = await request.json()
    const updated = await updatePost(id, body)

    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const deleted = await deletePost(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
