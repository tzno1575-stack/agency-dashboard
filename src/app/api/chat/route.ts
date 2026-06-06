import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const msg = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Push to Upstash Redis inbox
    await redis.rpush("chat:inbox", JSON.stringify(msg));

    // Notify via Telegram so Hermes sees it
    try {
      const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🖥️ Dashboard: ${message}`,
          }),
        });
      }
    } catch {}

    return NextResponse.json({ reply: "Sent. Ayla will respond shortly." });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
