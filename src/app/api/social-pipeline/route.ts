import { NextResponse } from "next/server";

/**
 * Social Media Pipeline — AI generation + optional image
 * POST { prompt, platform, clientId, imagePrompt? }
 * → Calls local Ollama for content → returns generated post
 */
export async function POST(request: Request) {
  try {
    const { prompt, platform, clientId, imagePrompt } = await request.json();

    if (!prompt || !platform) {
      return NextResponse.json({ error: "prompt and platform required" }, { status: 400 });
    }

    // 1. Generate content via local Ollama
    let content = "";
    let hashtags: string[] = [];
    try {
      const systemPrompt = `You are a social media manager for a UK business. Write an engaging ${platform} post based on the prompt. 
Return the output as JSON: {"content": "the post text with emojis", "hashtags": ["#tag1", "#tag2", "#tag3"]}
Keep it warm, professional, and concise. Maximum 280 characters for the content.`;

      const ollamaRes = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1:latest",
          prompt: `${systemPrompt}\n\nPrompt: ${prompt}\n\nJSON Response:`,
          stream: false,
          options: { temperature: 0.7, num_predict: 512 },
        }),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const response = data.response || "";
        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          content = parsed.content || response;
          hashtags = parsed.hashtags || [];
        } else {
          content = response;
        }
      }
    } catch (e) {
      content = `[AI generation failed: ${e}. Using prompt as content.]`;
    }

    // 2. Generate image via pollinations.ai (free, no API key)
    let imageUrl = "";
    if (imagePrompt) {
      const encoded = encodeURIComponent(imagePrompt);
      imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true`;
    }

    const result = {
      id: `sp-${Date.now()}`,
      platform,
      clientId: clientId || "",
      content: content || prompt,
      hashtags,
      imageUrl,
      imagePrompt: imagePrompt || null,
      status: "generated",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Pipeline failed" }, { status: 500 });
  }
}
