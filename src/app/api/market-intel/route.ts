import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const raw = await redis.get("aqd:market_briefing");
    if (!raw) {
      return NextResponse.json({ date: "", topFind: null, ventures: [], tools: [], marketSignal: "", idea: "", stats: null });
    }
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ date: "", topFind: null, ventures: [], tools: [], marketSignal: "", idea: "", stats: null }, { status: 500 });
  }
}
