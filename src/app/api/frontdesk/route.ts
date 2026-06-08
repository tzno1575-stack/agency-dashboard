import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * GET /api/frontdesk — Single unified inbox for everything needing user attention.
 *
 * Returns categorized action items across the whole dashboard:
 * - content:    posts waiting for approval
 * - tasks:      TaskForce items needing review
 * - code:       code/config changes needing review
 * - ideas:      IdeaGen suggestions to look at
 * - messages:   unanswered inbound messages
 * - reminders:  prayer/scheduling/operational alerts
 * - billing:    invoices/payments outstanding
 * - health:     failing cron jobs / broken automations
 */
export async function GET() {
  const empty = {
    counts: { total: 0, urgent: 0 },
    categories: {
      content: [],
      tasks: [],
      code: [],
      ideas: [],
      messages: [],
      reminders: [],
      billing: [],
      health: [],
    },
    updatedAt: new Date().toISOString(),
  };

  if (!redis) {
    return NextResponse.json(empty);
  }

  try {
    // CONTENT — review queue
    let contentItems: any[] = [];
    try {
      const raw = await redis.lrange("review:queue", 0, -1);
      contentItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .filter((i: any) => i.status === "pending")
        .map((i: any) => ({
          id: i.id,
          title: i.title,
          summary: (i.output || i.description || "").slice(0, 140),
          agent: i.agent,
          type: i.type,
          timestamp: i.timestamp,
          href: "/?board=content&tab=approvals",
        }));
    } catch {}

    // PENDING APPROVALS — also from a separate key if used
    let pendingItems: any[] = [];
    try {
      const raw = await redis.lrange("pending_approval", 0, -1);
      pendingItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .map((i: any) => ({
          id: i.id || `pending-${Date.now()}`,
          title: i.title || "Pending post",
          summary: (i.content || i.body || "").slice(0, 140),
          agent: "Ayla",
          type: "content",
          timestamp: i.timestamp || new Date().toISOString(),
          href: "/?board=content&tab=approvals",
        }));
    } catch {}

    // Merge and dedupe content items
    const seenContent = new Set<string>();
    const content = [...contentItems, ...pendingItems].filter((c) => {
      if (seenContent.has(c.id)) return false;
      seenContent.add(c.id);
      return true;
    });

    // HEALTH — failing cron jobs (from status list if present)
    let healthItems: any[] = [];
    try {
      const raw = await redis.lrange("cron:status", 0, -1);
      healthItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .filter((c: any) => c.status === "error" || c.status === "failed")
        .map((c: any) => ({
          id: c.id || c.name,
          title: `Cron failing: ${c.name}`,
          summary: c.error || c.lastError || "Last run errored",
          agent: "System",
          type: "health",
          timestamp: c.lastRun,
          href: "/?board=autopilot",
        }));
    } catch {}

    // REMINDERS — anything in reminders queue
    let reminderItems: any[] = [];
    try {
      const raw = await redis.lrange("reminders:active", 0, -1);
      reminderItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .filter((r: any) => r.status !== "done")
        .map((r: any) => ({
          id: r.id,
          title: r.title,
          summary: r.body || r.message,
          agent: "System",
          type: "reminder",
          timestamp: r.dueAt || r.timestamp,
          href: "/?board=notifications",
        }));
    } catch {}

    // MESSAGES — unanswered inbound
    let messageItems: any[] = [];
    try {
      const raw = await redis.lrange("chat:inbox", 0, -1);
      messageItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .filter((m: any) => !m.read)
        .slice(0, 10)
        .map((m: any) => ({
          id: m.id,
          title: `Message from ${m.from || m.platform || "contact"}`,
          summary: (m.body || m.text || "").slice(0, 140),
          agent: "Inbox",
          type: "message",
          timestamp: m.timestamp,
          href: "/?board=messages",
        }));
    } catch {}

    // TASKS — TaskForce queue
    let taskItems: any[] = [];
    try {
      const raw = await redis.lrange("taskforce:queue", 0, -1);
      taskItems = (raw as string[])
        .map((s) => {
          try { return JSON.parse(s); } catch { return null; }
        })
        .filter(Boolean)
        .filter((t: any) => t.status === "review" || t.status === "needs-review")
        .map((t: any) => ({
          id: t.id,
          title: t.title || t.name,
          summary: (t.description || t.output || "").slice(0, 140),
          agent: t.agent,
          type: "task",
          timestamp: t.timestamp,
          href: "/?board=taskforce",
        }));
    } catch {}

    const total =
      content.length + taskItems.length + healthItems.length +
      reminderItems.length + messageItems.length;

    return NextResponse.json({
      counts: {
        total,
        urgent: healthItems.length, // failing crons = urgent
      },
      categories: {
        content,
        tasks: taskItems,
        code: [], // TODO: wire to codegen review queue if exists
        ideas: [], // TODO: wire to ideagen suggestions
        messages: messageItems,
        reminders: reminderItems,
        billing: [], // TODO: wire to billing/invoice queue
        health: healthItems,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ...empty, error: e?.message }, { status: 200 });
  }
}
