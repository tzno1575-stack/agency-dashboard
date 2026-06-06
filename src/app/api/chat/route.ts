import { NextResponse } from "next/server";
import fs from "fs";

const INBOX = "/tmp/ayla-inbox.json";
const OUTBOX = "/tmp/ayla-outbox.json";

function readJson(p: string): any[] {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {}
  return [];
}

function writeJson(p: string, d: any[]) {
  fs.writeFileSync(p, JSON.stringify(d), "utf-8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const cfg = JSON.parse(fs.readFileSync("src/lib/config.json", "utf-8"));
    const tok = cfg.telegram_bot_token;
    const chatId = cfg.chat_id;

    // Write to inbox
    const inbox = readJson(INBOX);
    inbox.push({ id: Date.now().toString(), role: "user", content: message, timestamp: new Date().toISOString() });
    writeJson(INBOX, inbox);

    // Send to Telegram
    if (tok) {
      try {
        await fetch("https://api.telegram.org/bot" + tok + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: "🖥️ **Dashboard**: " + message, parse_mode: "Markdown" }),
        });
      } catch {}
    }

    // Check outbox for immediate response
    const out = readJson(OUTBOX);
    if (out.length > 0) {
      const r = out.shift();
      writeJson(OUTBOX, out);
      return NextResponse.json({ reply: r.content });
    }

    return NextResponse.json({ reply: "Sent. Ayla will respond shortly." });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
