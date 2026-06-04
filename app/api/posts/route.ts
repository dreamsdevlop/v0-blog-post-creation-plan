import { NextResponse } from 'next/server'
import { getPosts, createPost, updatePost, deletePost, getPostById } from '@/lib/data'
import type { BlogPost } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (id) {
    const post = getPostById(id)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  }
  
  const posts = getPosts()
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const post = createPost(body as Omit<BlogPost, 'id'>)
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
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
    const updated = updatePost(id, body)
    
    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
  }
  
  const deleted = deletePost(id)
  
  if (!deleted) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true })
}
