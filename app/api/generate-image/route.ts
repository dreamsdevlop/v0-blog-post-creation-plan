import { NextResponse } from "next/server";
import { generateBlogImage, generateImageOptions } from "@/lib/nvidia-image";

export async function POST(request: Request) {
  try {
    const { title, content, style = "auto", generateMultiple = false } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (generateMultiple) {
      const options = await generateImageOptions(title, content || "", 3);
      return NextResponse.json({ images: options });
    }

    const result = await generateBlogImage(title, content || "", { style });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate image. Check API key configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[v0] Image generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
