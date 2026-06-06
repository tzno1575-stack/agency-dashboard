import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// POST: Save/create a post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = {
      id: body.id || `post-${Date.now()}`,
      clientId: body.clientId,
      platform: body.platform,
      content: body.content,
      imageUrl: body.imageUrl,
      hashtags: body.hashtags || [],
      scheduledAt: body.scheduledAt || new Date().toISOString(),
      status: body.status || "draft",
      aiPrompt: body.aiPrompt,
    };

    // Store in Upstash
    await redis.rpush("social:posts", JSON.stringify(post));

    // If it's scheduled (not draft), notify via Telegram
    if (post.status === "scheduled") {
      try {
        const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: `📅 **Post Scheduled**\nPlatform: ${post.platform}\nWhen: ${post.scheduledAt}\nContent: ${post.content.slice(0, 100)}...`,
              parse_mode: "Markdown",
            }),
          });
        }
      } catch {}
    }

    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET: List all posts
export async function GET() {
  try {
    const raw = await redis.lrange("social:posts", 0, -1);
    if (!raw || raw.length === 0) return NextResponse.json({ posts: [] });

    const posts = (raw as string[])
      .map((item) => {
        try { return JSON.parse(item); } catch { return null; }
      })
      .filter(Boolean);

    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json({ posts: [] });
  }
}
