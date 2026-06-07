import { NextResponse } from "next/server";
import { sampleReviews } from "@/lib/data";

// GET: List review items using Upstash REST API directly
export async function GET() {
  try {
    const url = `${process.env.UPSTASH_REDIS_REST_URL}/lrange/review:queue/0/-1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    const json = await res.json();
    const raw = json.result || [];

    const items = (raw as string[])
      .filter((item: string) => item && item.trim().startsWith("{"))
      .map((item: string) => {
        try { return JSON.parse(item); } catch { return null; }
      })
      .filter(Boolean);

    if (items.length === 0) {
      return NextResponse.json({ items: sampleReviews });
    }
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: [] });
  }
}

// POST: Submit item for review (from agents/content studio)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = {
      id: `review-${Date.now()}`,
      title: body.title || "Untitled",
      description: body.description || "",
      agent: body.agent || "System",
      type: body.type || "content", // content, task, report, idea
      clientId: body.clientId || null,
      status: "pending",
      output: body.output || null, // the actual content/output
      timestamp: new Date().toISOString(),
    };

    await redis.rpush("review:queue", JSON.stringify(item));
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH: Approve or reject an item
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action: "approve" | "reject"

    if (!id || !action) {
      return NextResponse.json({ error: "id and action required" }, { status: 400 });
    }

    // Read all, update the target, rebuild
    const raw = await redis.lrange("review:queue", 0, -1);
    const items = (raw as string[])
      .map((item) => {
        try { return JSON.parse(item); } catch { return null; }
      })
      .filter(Boolean);

    let updated: any = null;
    const newItems = items.map((item: any) => {
      if (item.id === id) {
        updated = {
          ...item,
          status: action === "approve" ? "approved" : "rejected",
          reviewedAt: new Date().toISOString(),
        };
        return updated;
      }
      return item;
    });

    // Rebuild the list
    await redis.del("review:queue");
    for (const item of newItems) {
      await redis.rpush("review:queue", JSON.stringify(item));
    }

    // If approved and has output, push to Content Studio as draft
    const finalItem: any = updated;
    if (action === "approve" && finalItem?.output && finalItem?.type === "content") {
      const draft = {
        id: `post-${Date.now()}`,
        clientId: finalItem.clientId,
        platform: "facebook",
        content: finalItem.output,
        hashtags: [],
        scheduledAt: new Date().toISOString(),
        status: "draft",
        aiPrompt: `Approved from review: ${finalItem.title}`,
      };
      await redis.rpush("social:posts", JSON.stringify(draft));
    }

    return NextResponse.json({ item: updated, pushedToContent: action === "approve" && finalItem?.type === "content" });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
