// Shared message queue — dashboard reads Hermes responses from here
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OUTBOX = "/tmp/ayla-outbox.json";

export async function GET() {
  try {
    if (!fs.existsSync(OUTBOX)) {
      return NextResponse.json({ messages: [] });
    }

    const raw = fs.readFileSync(OUTBOX, "utf-8");
    const messages = JSON.parse(raw);

    // Clear after reading (messages consumed)
    fs.writeFileSync(OUTBOX, "[]", "utf-8");

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
