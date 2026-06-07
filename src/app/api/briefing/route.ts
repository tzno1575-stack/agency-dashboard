import { NextResponse } from "next/server";

/**
 * GET /api/briefing — Daily briefing data
 * Falls back to computed defaults when no live data available.
 */
export async function GET() {
  try {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return NextResponse.json({
      date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      greeting,
      agents: { active: 0, queued: 0, completed: 0 },
      revenue: { thisMonth: 0, lastMonth: 0, pending: 0 },
      tasks: { due: 0, overdue: 0, completed: 0 },
      reviews: { pending: 0, approved: 0, rejected: 0 },
      social: { scheduled: 0, published: 0 },
      notifications: 0,
      suggestion: "Start your day by reviewing the task board and deploying an agent.",
    });
  } catch {
    return NextResponse.json({
      greeting: "Good morning",
      date: new Date().toISOString(),
      suggestion: "Welcome to your agency dashboard.",
    });
  }
}
