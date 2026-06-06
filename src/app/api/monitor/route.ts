import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    const raw = await redis.get("live_status");
    if (!raw) {
      return NextResponse.json({ status: "waiting", message: "No heartbeat yet" });
    }
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
