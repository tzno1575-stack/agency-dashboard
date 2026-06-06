import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task, action } = body;

    if (!task || typeof task !== "object") {
      return NextResponse.json({ error: "Missing or invalid task" }, { status: 400 });
    }
    if (!task.title || !task.status) {
      return NextResponse.json({ error: "Task must include title and status" }, { status: 400 });
    }

    console.log(`[Dashboard] Task ${action}:`, task.title, `→ ${task.status}`);

    if (action === "start" && task.status === "ready") {
      // Future: POST to Telegram Bot → Hermes picks up task
      console.log(`[Dashboard] Hermes would start: ${task.title}`);
    }

    return NextResponse.json({ ok: true, task, action });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
