import { NextResponse } from "next/server";

// Local Ollama proxy — runs AI chat through the user's own machine.
// No API key, no cloud, no cost. Streams the response back to the client.

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
// Default model — hermes3:latest is the recommended agentic model with native tool calling.
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "hermes3:latest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // List installed local models so the chat UI can show a dropdown.
  try {
    const r = await fetch(`${OLLAMA_BASE}/api/tags`, { cache: "no-store" });
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `Ollama not reachable at ${OLLAMA_BASE} (HTTP ${r.status})` },
        { status: 502 }
      );
    }
    const data = await r.json();
    return NextResponse.json({
      ok: true,
      base: OLLAMA_BASE,
      default_model: DEFAULT_MODEL,
      models: (data.models || []).map((m: any) => ({
        name: m.name,
        size: m.size,
        parameter_size: m.details?.parameter_size,
        family: m.details?.family,
        context_length: m.details?.context_length,
        modified_at: m.modified_at,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to reach Ollama" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      model = DEFAULT_MODEL,
      history = [],
      system,
    } = body || {};

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Build messages array — system prompt (if any) + history + current user message.
    const messages: Array<{ role: string; content: string }> = [];
    if (system && typeof system === "string") {
      messages.push({ role: "system", content: system });
    }
    if (Array.isArray(history)) {
      for (const m of history) {
        if (m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant")) {
          messages.push({ role: m.role, content: m.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    const r = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        { error: `Ollama chat failed: ${text || r.statusText}` },
        { status: 502 }
      );
    }

    const data = await r.json();
    const reply: string =
      data?.message?.content ||
      data?.response ||
      data?.message ||
      "";

    return NextResponse.json({
      ok: true,
      model: data?.model || model,
      reply,
      total_duration: data?.total_duration,
      eval_count: data?.eval_count,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Ollama proxy error" },
      { status: 500 }
    );
  }
}
