import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after") || "0";

    // Read all messages from outbox, then clear
    const messages = await kv.lrange("chat:outbox", 0, -1);

    if (messages.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // Filter to only show messages after the last seen
    const newMessages = (messages as any[]).filter(
      (m) => parseInt(m.id) > parseInt(after)
    );

    // Clear outbox after reading
    await kv.del("chat:outbox");

    return NextResponse.json({
      messages: newMessages,
      lastId: newMessages.length > 0 ? newMessages[newMessages.length - 1].id : after,
    });
  } catch (e) {
    return NextResponse.json({ messages: [] });
  }
}
