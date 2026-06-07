import { NextResponse } from "next/server";

/**
 * POST /api/setup
 * Generates Hermes config files based on provided API keys.
 * Returns downloadable config.yaml and .env content.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      installType = "local",
      deepseekKey = "",
      openrouterKey = "",
      upstashUrl = "",
      upstashToken = "",
      telegramToken = "",
    } = body;

    const timestamp = new Date().toISOString().split("T")[0];

    const configYaml = `# Hermes Agent Configuration — Aql Digital Dashboard
# Generated: ${timestamp}
# Installation type: ${installType}

model:
  default: deepseek-chat
  provider: deepseek
  base_url: https://api.deepseek.com/v1

agent:
  max_turns: 90

terminal:
  backend: local
  timeout: 180

tts:
  provider: edge
  voice: en-US-AvaNeural

stt:
  enabled: true
  provider: local
  local:
    model: base

memory:
  memory_enabled: true
  user_profile_enabled: true
  provider: built-in

delegation:
  model: deepseek-chat
  provider: deepseek
  max_iterations: 50

gateway:
  platforms:
    telegram:
      enabled: ${telegramToken ? "true" : "false"}
    web:
      enabled: true
      port: 8282

compression:
  enabled: true
  threshold: 0.50

display:
  skin: dark
  tool_progress: true
  show_cost: false

security:
  redact_secrets: true
  approvals:
    mode: smart
`;

    const envFile = `# Aql Digital Dashboard — Environment Variables
# Generated: ${timestamp}

# === LLM PROVIDERS ===
DEEPSEEK_API_KEY=${deepseekKey || "your-deepseek-key-here"}
OPENROUTER_API_KEY=${openrouterKey || "your-openrouter-key-here"}

# === UPSTASH REDIS (Dashboard Chat Bridge) ===
UPSTASH_REDIS_URL=${upstashUrl || "https://your-instance.upstash.io"}
UPSTASH_REDIS_TOKEN=${upstashToken || "your-upstash-token-here"}

# === TELEGRAM BOT ===
TELEGRAM_BOT_TOKEN=${telegramToken || "your-telegram-bot-token"}

# === OPTIONAL ===
# ELEVENLABS_API_KEY=*** # XAI_API_KEY=*** # ANTHROPIC_API_KEY=*** # HUGGINGFACE_TOKEN=*** # GOOGLE_API_KEY=*** `;

    const installCommands = installType === "vps"
      ? `# SSH into your VPS first, then:
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
mkdir -p ~/.hermes
# Upload config.yaml and .env to ~/.hermes/
hermes gateway setup
hermes gateway install
hermes gateway start
hermes doctor`
      : `# macOS / Linux:
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
mkdir -p ~/.hermes
# Place config.yaml and .env in ~/.hermes/
hermes gateway setup
hermes gateway start
hermes doctor`;

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      files: {
        "config.yaml": configYaml,
        ".env": envFile,
      },
      installCommands,
      installType,
      soulUrl: "/souls/business-soul.md",
      docsUrl: "https://hermes-agent.nousresearch.com/docs/",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate config" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup
 * Returns setup options and status.
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      options: {
        installTypes: [
          { id: "local", label: "Local Computer", cost: "Free", description: "Install on your Mac, Windows, or Linux machine" },
          { id: "vps", label: "Cloud VPS", cost: "~$5-10/month", description: "24/7 server, always online, handles overnight tasks" },
        ],
        providers: [
          { id: "deepseek", label: "DeepSeek", required: true, url: "https://platform.deepseek.com/api_keys" },
          { id: "openrouter", label: "OpenRouter", required: false, url: "https://openrouter.ai/keys" },
          { id: "upstash", label: "Upstash Redis", required: true, url: "https://console.upstash.com/redis" },
          { id: "telegram", label: "Telegram Bot", required: false, url: "https://t.me/BotFather" },
        ],
        steps: 5,
      },
      soulAvailable: true,
      soulUrl: "/souls/business-soul.md",
      docsUrl: "https://hermes-agent.nousresearch.com/docs/",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load setup options" },
      { status: 500 }
    );
  }
}
