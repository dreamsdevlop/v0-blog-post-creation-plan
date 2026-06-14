// NVIDIA Image Generation Library
// Supports SDXL, Stable Diffusion, and other NVIDIA-hosted models

const NVIDIA_IMAGE_API_URL = "https://integrate.api.nvidia.com/v1/images/generations";

export type ImageStyle = 
  | "cinematic" 
  | "dark_artistic" 
  | "noir_mystery" 
  | "historical_realistic"
  | "auto";

interface ImageGenerationOptions {
  prompt: string;
  style?: ImageStyle;
  width?: number;
  height?: number;
  negativePrompt?: string;
}

const NVIDIA_IMAGE_API_KEYS = [
  process.env.NVIDIA_IMAGE_API_KEY,
  process.env.NVIDIA_IMAGE_API_KEY_2,
  process.env.NVIDIA_IMAGE_API_KEY_3,
  process.env.NVIDIA_IMAGE_API_KEY_4,
].filter((key): key is string => Boolean(key))

let imageKeyIndex = 0

function getNextImageApiKey(): string {
  if (NVIDIA_IMAGE_API_KEYS.length === 0) {
    throw new Error('NVIDIA Image API key not configured')
  }
  const key = NVIDIA_IMAGE_API_KEYS[imageKeyIndex % NVIDIA_IMAGE_API_KEYS.length]
  imageKeyIndex++
  return key
}

// Style presets for history/mystery content
const STYLE_PRESETS: Record<ImageStyle, { prefix: string; suffix: string; negative: string }> = {
  cinematic: {
    prefix: "Cinematic film still, dramatic lighting, historical scene,",
    suffix: "8k, ultra detailed, movie quality, epic composition, volumetric lighting",
    negative: "cartoon, anime, text, watermark, low quality, blurry"
  },
  dark_artistic: {
    prefix: "Dark moody illustration, artistic style, mysterious atmosphere,",
    suffix: "detailed artwork, professional illustration, dramatic shadows, ethereal glow",
    negative: "bright colors, cheerful, cartoon, text, watermark"
  },
  noir_mystery: {
    prefix: "Film noir style, high contrast, mysterious,",
    suffix: "dramatic shadows, black and white tones, vintage aesthetic, atmospheric fog",
    negative: "colorful, bright, modern, text, watermark"
  },
  historical_realistic: {
    prefix: "Historical photograph style, authentic period details,",
    suffix: "photorealistic, archival quality, sepia tones, aged texture, documentary style",
    negative: "modern elements, fantasy, cartoon, text, watermark"
  },
  auto: {
    prefix: "",
    suffix: "highly detailed, professional quality, dramatic lighting",
    negative: "text, watermark, low quality, blurry, cartoon"
  }
};

// Keywords to detect appropriate style
const STYLE_KEYWORDS = {
  noir_mystery: ["murder", "crime", "detective", "noir", "gangster", "mafia", "assassination", "conspiracy"],
  dark_artistic: ["cult", "occult", "ritual", "supernatural", "paranormal", "haunted", "demon", "witch"],
  historical_realistic: ["war", "battle", "empire", "civilization", "ancient", "medieval", "king", "queen", "dynasty"],
  cinematic: ["disaster", "catastrophe", "epic", "legendary", "myth", "saga", "expedition", "discovery"]
};

function detectBestStyle(title: string, content: string): ImageStyle {
  const text = `${title} ${content}`.toLowerCase();
  
  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return style as ImageStyle;
      }
    }
  }
  
  // Default to cinematic for general history content
  return "cinematic";
}

function generateImagePrompt(title: string, content: string, style: ImageStyle): string {
  // Extract key visual elements from title
  const visualElements = title
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(", ");

  const preset = STYLE_PRESETS[style];
  
  return `${preset.prefix} ${visualElements}, ${preset.suffix}`;
}

export async function generateBlogImage(
  title: string,
  content: string,
  options: Partial<ImageGenerationOptions> = {}
): Promise<{ imageUrl: string; style: ImageStyle; prompt: string } | null> {
  let apiKey: string
  try {
    apiKey = getNextImageApiKey()
  } catch (error) {
    console.error("[v0] NVIDIA Image API key not configured:", error)
    return null
  }

  // Auto-detect style if not specified
  const style = options.style === "auto" || !options.style 
    ? detectBestStyle(title, content) 
    : options.style;

  const prompt = generateImagePrompt(title, content, style);
  const preset = STYLE_PRESETS[style];

  try {
    const response = await fetch(NVIDIA_IMAGE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "stabilityai/stable-diffusion-xl",
        prompt: prompt,
        negative_prompt: options.negativePrompt || preset.negative,
        width: options.width || 1024,
        height: options.height || 576, // 16:9 aspect ratio for blog thumbnails
        cfg_scale: 7,
        steps: 30,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] NVIDIA Image API error:", errorText);
      
      // Fallback: Try alternative endpoint format
      return await generateWithAlternativeEndpoint(prompt, preset.negative);
    }

    const data = await response.json();
    
    // Handle different response formats
    const imageUrl = data.data?.[0]?.url || 
                     data.artifacts?.[0]?.base64 ||
                     data.output?.[0]?.url ||
                     data.image;

    if (!imageUrl) {
      console.error("[v0] No image URL in response:", data);
      return null;
    }

    return {
      imageUrl: imageUrl.startsWith("data:") ? imageUrl : 
                imageUrl.startsWith("http") ? imageUrl :
                `data:image/png;base64,${imageUrl}`,
      style,
      prompt
    };
  } catch (error) {
    console.error("[v0] Image generation failed:", error);
    return null;
  }
}

// Alternative endpoint for different NVIDIA API versions
async function generateWithAlternativeEndpoint(
  prompt: string,
  negativePrompt: string
): Promise<{ imageUrl: string; style: ImageStyle; prompt: string } | null> {
  let apiKey: string
  try {
    apiKey = getNextImageApiKey()
  } catch {
    return null
  }
  try {
    // Try the NVIDIA AI Foundation endpoint
    const response = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        text_prompts: [
          { text: prompt, weight: 1 },
          { text: negativePrompt, weight: -1 }
        ],
        cfg_scale: 7,
        height: 576,
        width: 1024,
        steps: 30,
        samples: 1
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const base64Image = data.artifacts?.[0]?.base64;

    if (base64Image) {
      return {
        imageUrl: `data:image/png;base64,${base64Image}`,
        style: "auto",
        prompt
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Generate multiple image options for user to choose
export async function generateImageOptions(
  title: string,
  content: string,
  count: number = 3
): Promise<Array<{ imageUrl: string; style: ImageStyle; prompt: string }>> {
  const styles: ImageStyle[] = ["cinematic", "dark_artistic", "noir_mystery", "historical_realistic"];
  const detectedStyle = detectBestStyle(title, content);
  
  // Prioritize detected style, then add others
  const orderedStyles = [
    detectedStyle,
    ...styles.filter(s => s !== detectedStyle)
  ].slice(0, count);

  const results = await Promise.all(
    orderedStyles.map(style => generateBlogImage(title, content, { style }))
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}
