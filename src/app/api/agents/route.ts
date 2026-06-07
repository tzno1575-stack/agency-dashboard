import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// POST: Deploy a new agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, task, clientId } = body;

    if (!type || !task || !clientId) {
      return NextResponse.json({ error: "Type, task, and clientId required" }, { status: 400 });
    }

    const agent = {
      id: `agent-${Date.now()}`,
      type,
      name: name || type,
      task,
      clientId,
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    // Store in Upstash
    await redis.rpush("taskforce:agents", JSON.stringify(agent));

    // Forward to Telegram → Hermes
    try {
      const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const deployMsg = [
          `🤖 **TASKFORCE DEPLOY**`,
          `Agent: ${agent.name}`,
          `Type: ${agent.type}`,
          `Client: ${clientId}`,
          `Task: ${task}`,
          `ID: ${agent.id}`,
        ].join("\n");

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: deployMsg,
            parse_mode: "Markdown",
          }),
        });
      }
    } catch {}

    return NextResponse.json({ agent });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET: List all agents — falls back to sample data when Redis empty
export async function GET() {
  try {
    const raw = await redis.lrange("taskforce:agents", 0, -1);

    if (!raw || raw.length === 0) {
      const { sampleAgents } = await import("@/lib/data");
      return NextResponse.json({ agents: sampleAgents });
    }

    const agents = (raw as string[])
      .map((item) => {
        try { return JSON.parse(item); } catch { return null; }
      })
      .filter(Boolean);

    return NextResponse.json({ agents });
  } catch (e) {
    return NextResponse.json({ agents: [] });
  }
}
