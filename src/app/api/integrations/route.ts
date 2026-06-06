import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// POST: Queue an integration action
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { integration, action, params } = body;

    if (!integration || !action) {
      return NextResponse.json({ error: "integration and action required" }, { status: 400 });
    }

    const job = {
      id: `int-${Date.now()}`,
      integration,
      action,
      params: params || {},
      status: "queued",
      createdAt: new Date().toISOString(),
      completedAt: null,
      result: null,
      error: null,
    };

    await redis.rpush("integrations:queue", JSON.stringify(job));

    return NextResponse.json({ job });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET: Poll for completed integration results
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after") || "0";

    const raw = await redis.lrange("integrations:results", 0, -1);
    if (!raw || raw.length === 0) return NextResponse.json({ results: [] });

    const results = (raw as string[])
      .map((item) => {
        try { return JSON.parse(item); } catch { return null; }
      })
      .filter(Boolean)
      .filter((r: any) => parseInt(r.id.split("-")[1]) > parseInt(after));

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
