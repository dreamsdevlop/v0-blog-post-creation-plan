import type { GenerationSettings } from './types'

const NVIDIA_API_KEYS = [
  process.env.NVIDIA_API_KEY_1,
  process.env.NVIDIA_API_KEY_2,
  process.env.NVIDIA_API_KEY_3,
  process.env.NVIDIA_API_KEY_4,
  process.env.NVIDIA_API_KEY_5,
  process.env.NVIDIA_API_KEY_6,
  process.env.NVIDIA_API_KEY_7,
  process.env.NVIDIA_API_KEY_8,
  process.env.NVIDIA_API_KEY_9,
].filter((key): key is string => Boolean(key))

const MODEL_ENDPOINTS: Record<string, string> = {
  deepseek: 'https://integrate.api.nvidia.com/v1/chat/completions',
  kimi: 'https://integrate.api.nvidia.com/v1/chat/completions',
  glm: 'https://integrate.api.nvidia.com/v1/chat/completions',
  stepfun: 'https://integrate.api.nvidia.com/v1/chat/completions',
  flux: 'https://integrate.api.nvidia.com/v1/chat/completions',
  sd: 'https://integrate.api.nvidia.com/v1/chat/completions',
  llama: 'https://integrate.api.nvidia.com/v1/chat/completions',
}

const MODEL_IDS: Record<string, string> = {
  deepseek: 'deepseek-ai/deepseek-r1',
  kimi: 'kimi-v1',
  glm: 'glm-4',
  stepfun: 'stepfun-1',
  flux: 'flux-v1',
  sd: 'stable-diffusion-xl-base-1.0',
  llama: 'meta/llama-2-7b-chat',
}

const MODEL_KEY_MAP: Record<string, number> = {
  deepseek: 0,  // NVIDIA_API_KEY_1
  kimi: 1,      // NVIDIA_API_KEY_2
  glm: 2,       // NVIDIA_API_KEY_3
  stepfun: 3,   // NVIDIA_API_KEY_4
  flux: 4,      // NVIDIA_API_KEY_5
  sd: 5,        // NVIDIA_API_KEY_6
  llama: 6,     // NVIDIA_API_KEY_7
}

function getApiKey(model: string): string {
  const index = MODEL_KEY_MAP[model] ?? 0
  const key = NVIDIA_API_KEYS[index]
  if (!key) {
    throw new Error(`NVIDIA API key not configured for model: ${model}`)
  }
  return key
}

function getTonePrompt(tone: GenerationSettings['tone']): string {
  const tones = {
    mysterious: 'Write in a mysterious, suspenseful tone that keeps readers on the edge of their seats. Use atmospheric language and hint at deeper secrets.',
    dramatic: 'Write in a dramatic, impactful style with powerful statements and emotional resonance. Build tension and deliver revelations.',
    educational: 'Write in an educational yet engaging style, explaining complex historical concepts clearly while maintaining reader interest.',
    storytelling: 'Write as a master storyteller, weaving narrative threads that captivate readers and transport them to another time.',
  }
  return tones[tone]
}

function getLengthPrompt(length: GenerationSettings['length']): string {
  const lengths = {
    short: 'Keep the article concise, around 800-1000 words.',
    medium: 'Write a medium-length article, around 1500-2000 words.',
    long: 'Write a comprehensive, in-depth article, around 2500-3500 words.',
  }
  return lengths[length]
}

export async function generateBlogPost(
  transcript: string,
  videoTitle: string,
  settings: GenerationSettings
): Promise<{ title: string; content: string; excerpt: string; seoTitle: string; seoDescription: string; tags: string[] }> {
  const apiKey = getApiKey(settings.model)
  const endpoint = MODEL_ENDPOINTS[settings.model]
  const modelId = MODEL_IDS[settings.model]

  const systemPrompt = `You are an expert blog writer specializing in history, mysteries, dark truths, and cult-related content. Your writing style is captivating and SEO-optimized.

${getTonePrompt(settings.tone)}
${getLengthPrompt(settings.length)}

SEO REQUIREMENTS (CRITICAL):
1. The "title" must be under 60 characters and include the main keyword naturally
2. The "seoTitle" must be exactly 50-60 characters, include primary keyword, and be compelling for search results
3. The "seoDescription" must be exactly 150-155 characters, include primary and secondary keywords, and have a clear call-to-action
4. The "excerpt" should be 2-3 sentences (40-60 words) summarizing the article
5. The "tags" must include 5-8 relevant keywords mixing broad and long-tail terms
6. Content must use proper HTML: h2 for main sections, h3 for subsections, p for paragraphs, ul/ol for lists, strong for emphasis
7. First paragraph should hook readers and include primary keyword
8. Include internal linking suggestions marked as [INTERNAL_LINK: topic]
9. Add schema-friendly structure with clear headings

Your task is to transform video transcripts into engaging, well-structured blog posts. Include:
- An attention-grabbing headline (under 60 chars)
- A compelling introduction with primary keyword
- Well-organized sections with subheadings (use HTML h2, h3 tags)
- A thought-provoking conclusion with call-to-action
${settings.includeCallToAction ? '- A call-to-action encouraging readers to subscribe/comment' : ''}
${settings.addAffiliateLinks ? '- Natural places to insert affiliate links (mark with [AFFILIATE_LINK: product_type])' : ''}

Format your response as JSON with the following structure:
{
  "title": "SEO-optimized blog post title (under 60 chars)",
  "content": "Full HTML content with proper formatting",
  "excerpt": "2-3 sentence excerpt for previews (40-60 words)",
  "seoTitle": "50-60 character SEO title with primary keyword",
  "seoDescription": "150-155 character meta description with keywords and CTA",
  "tags": ["5-8", "relevant", "keywords", "mixing", "broad", "and", "long-tail", "terms"]
}`

  const userPrompt = `Transform this video transcript into an engaging blog post.

Video Title: ${videoTitle}

Transcript:
${transcript}

Generate a captivating blog post that reveals the dark truths and mysteries discussed in this video.`

  try {
    console.log('[NVIDIA AI] Calling model:', settings.model, 'endpoint:', endpoint)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    console.log('[NVIDIA AI] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[NVIDIA AI] Error response:', errorText)
      throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('[NVIDIA AI] Response data keys:', Object.keys(data))
    const content = data.choices?.[0]?.message?.content
    console.log('[NVIDIA AI] Content preview:', content?.slice(0, 200))

    // Try to parse as JSON, or extract content
    try {
      const parsed = JSON.parse(content)
      return parsed
    } catch {
      // If not valid JSON, return formatted content
      return {
        title: videoTitle,
        content: `<article>${content}</article>`,
        excerpt: content.slice(0, 200) + '...',
        seoTitle: videoTitle.slice(0, 60),
        seoDescription: content.slice(0, 155),
        tags: ['history', 'mystery'],
      }
    }
  } catch (error) {
    console.error('Error generating blog post:', error)
    throw error
  }
}

export async function improveContent(
  content: string,
  instruction: string,
  model: GenerationSettings['model'] = 'deepseek'
): Promise<string> {
  const apiKey = getApiKey(model)
  const modelId = MODEL_IDS[model]
  const endpoint = MODEL_ENDPOINTS[model]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: 'You are an expert editor for history and mystery content. Improve the given content based on the user\'s instructions. Return only the improved content, no explanations.',
        },
        {
          role: 'user',
          content: `Instruction: ${instruction}\n\nContent to improve:\n${content}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to improve content')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || content
}
