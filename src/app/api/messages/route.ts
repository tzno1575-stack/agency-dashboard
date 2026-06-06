import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after") || "0";

    // Read all messages from outbox
    const messages = await redis.lrange("chat:outbox", 0, -1);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // Parse JSON strings and filter by timestamp
    const parsed = (messages as string[])
      .map((m) => {
        try { return JSON.parse(m); } catch { return null; }
      })
      .filter(Boolean)
      .filter((m: any) => parseInt(m.id) > parseInt(after));

    // Clear outbox after reading
    await redis.del("chat:outbox");

    return NextResponse.json({
      messages: parsed,
      lastId: parsed.length > 0 ? parsed[parsed.length - 1].id : after,
    });
  } catch (e) {
    return NextResponse.json({ messages: [] });
  }
}
