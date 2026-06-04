import type { GenerationSettings } from './types'

const NVIDIA_API_KEYS = [
  process.env.NVIDIA_API_KEY_1,
  process.env.NVIDIA_API_KEY_2,
  process.env.NVIDIA_API_KEY_3,
  process.env.NVIDIA_API_KEY_4,
]

const MODEL_ENDPOINTS: Record<string, string> = {
  deepseek: 'https://integrate.api.nvidia.com/v1/chat/completions',
  kimi: 'https://integrate.api.nvidia.com/v1/chat/completions',
  glm: 'https://integrate.api.nvidia.com/v1/chat/completions',
  stepfun: 'https://integrate.api.nvidia.com/v1/chat/completions',
}

const MODEL_IDS: Record<string, string> = {
  deepseek: 'deepseek-ai/deepseek-r1',
  kimi: 'moonshot-ai/kimi-k2-instruct',
  glm: 'thudm/glm-4',
  stepfun: 'stepfun-ai/step-2-16k',
}

function getApiKey(modelIndex: number): string {
  const key = NVIDIA_API_KEYS[modelIndex % NVIDIA_API_KEYS.length]
  if (!key) {
    throw new Error('NVIDIA API key not configured')
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
  const modelIndex = ['deepseek', 'kimi', 'glm', 'stepfun'].indexOf(settings.model)
  const apiKey = getApiKey(modelIndex)
  const modelId = MODEL_IDS[settings.model]
  const endpoint = MODEL_ENDPOINTS[settings.model]

  const systemPrompt = `You are an expert blog writer specializing in history, mysteries, dark truths, and cult-related content. Your writing style is captivating and SEO-optimized.

${getTonePrompt(settings.tone)}
${getLengthPrompt(settings.length)}

Your task is to transform video transcripts into engaging, well-structured blog posts. Include:
- An attention-grabbing headline
- A compelling introduction
- Well-organized sections with subheadings (use HTML h2, h3 tags)
- A thought-provoking conclusion
${settings.includeCallToAction ? '- A call-to-action encouraging readers to subscribe/comment' : ''}
${settings.addAffiliateLinks ? '- Natural places to insert affiliate links (mark with [AFFILIATE_LINK: product_type])' : ''}

Format your response as JSON with the following structure:
{
  "title": "SEO-optimized blog post title",
  "content": "Full HTML content with proper formatting",
  "excerpt": "2-3 sentence excerpt for previews",
  "seoTitle": "60-character SEO title",
  "seoDescription": "155-character meta description",
  "tags": ["relevant", "tags", "array"]
}`

  const userPrompt = `Transform this video transcript into an engaging blog post.

Video Title: ${videoTitle}

Transcript:
${transcript}

Generate a captivating blog post that reveals the dark truths and mysteries discussed in this video.`

  try {
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

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`NVIDIA API error: ${error}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

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
  const modelIndex = ['deepseek', 'kimi', 'glm', 'stepfun'].indexOf(model)
  const apiKey = getApiKey(modelIndex)
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
