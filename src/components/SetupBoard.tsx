"use client";

import { useState } from "react";
import { Download, Copy, Check, Server, Monitor, Key, FileText, Terminal, Link2, Sparkles, Code, BookOpen } from "lucide-react";

type InstallType = "local" | "vps" | null;
type SetupStep = 1 | 2 | 3 | 4 | 5;

interface ApiKeys {
  openrouter: string;
  upstash_url: string;
  upstash_token: string;
  telegram_token: string;
  deepseek: string;
}

const STEPS: { step: SetupStep; label: string; icon: typeof Monitor }[] = [
  { step: 1, label: "Choose Setup", icon: Monitor },
  { step: 2, label: "API Keys", icon: Key },
  { step: 3, label: "Generate Config", icon: FileText },
  { step: 4, label: "Install Hermes", icon: Terminal },
  { step: 5, label: "Connect & Test", icon: Link2 },
];

export default function SetupBoard() {
  const [step, setStep] = useState<SetupStep>(1);
  const [installType, setInstallType] = useState<InstallType>(null);
  const [keys, setKeys] = useState<ApiKeys>({
    openrouter: "",
    upstash_url: "",
    upstash_token: "",
    telegram_token: "",
    deepseek: "",
  });
  const [generated, setGenerated] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const updateKey = (field: keyof ApiKeys, value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
  };

  const generateConfigYaml = () => `# Hermes Agent Configuration — Aql Digital Dashboard
# Generated: ${new Date().toISOString().split("T")[0]}

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
      enabled: ${keys.telegram_token ? "true" : "false"}
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

  const generateEnvFile = () => `# Aql Digital Dashboard — Environment Variables
# Generated: ${new Date().toISOString().split("T")[0]}

# === LLM PROVIDERS ===
DEEPSEEK_API_KEY=${keys.deepseek || "your-deepseek-key"}
OPENROUTER_API_KEY=${keys.openrouter || "your-openrouter-key"}

# === UPSTASH REDIS (Dashboard Chat Bridge) ===
UPSTASH_REDIS_URL=${keys.upstash_url || "https://your-instance.upstash.io"}
UPSTASH_REDIS_TOKEN=${keys.upstash_token || "your-upstash-token"}

# === TELEGRAM BOT ===
TELEGRAM_BOT_TOKEN=${keys.telegram_token || "your-telegram-bot-token"}

# === OPTIONAL ===
# ELEVENLABS_API_KEY=
# XAI_API_KEY=
# ANTHROPIC_API_KEY=
# HUGGINGFACE_TOKEN=
# GOOGLE_API_KEY=
`;

  const getInstallCommand = () => {
    if (installType === "vps") {
      return `# SSH into your VPS first, then run:
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Then set up the config:
mkdir -p ~/.hermes
# Upload config.yaml and .env to ~/.hermes/
# (use the files generated in Step 3)

# Start Hermes:
hermes gateway setup
hermes gateway install
hermes gateway start

# Verify:
hermes doctor
hermes status`;
    }
    return `# macOS / Linux:
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Windows (PowerShell as Admin):
# irm https://hermes-agent.nousresearch.com/install.ps1 | iex

# After install, copy config files:
mkdir -p ~/.hermes
# Place config.yaml and .env in ~/.hermes/

# Start Hermes:
hermes gateway setup
hermes gateway start

# Verify:
hermes doctor`;
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const openHermesDocs = () => {
    window.open("https://hermes-agent.nousresearch.com/docs/", "_blank");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-800">Hermes Setup Wizard</h2>
          <span className="text-[10px] text-gray-500 ml-auto">Step {step} of 5</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-[#FDFBF7] border-b border-[#1a1a1a] shrink-0">
        <div className="flex gap-1 md:gap-2">
          {STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setStep(s.step)}
              className={`flex-1 text-[10px] md:text-xs py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors ${
                step === s.step
                  ? "bg-[#3b82f6] text-white"
                  : step > s.step
                  ? "bg-[#1e293b] text-green-400"
                  : "bg-[#1e293b] text-gray-500"
              }`}
            >
              <s.icon size={12} />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* === STEP 1: Choose Setup === */}
        {step === 1 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How will Hermes run?</h3>
              <p className="text-sm text-gray-500">Hermes connects to your dashboard via Redis. Choose where it lives.</p>
            </div>

            <button
              onClick={() => { setInstallType("local"); setStep(2); }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                installType === "local"
                  ? "border-[#3b82f6] bg-[#1e293b]"
                  : "border-[#1a1a1a] hover:border-[#3b82f6]/50 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <Monitor size={24} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">Local Computer</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Install Hermes on your Mac, Windows, or Linux machine. Free, private, always under your control.
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-[#E8F5E9] text-blue-400 px-2 py-0.5 rounded">Free</span>
                    <span className="text-[10px] bg-[#E8F5E9] text-green-400 px-2 py-0.5 rounded">Private</span>
                    <span className="text-[10px] bg-[#E8F5E9] text-amber-400 px-2 py-0.5 rounded">No server costs</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => { setInstallType("vps"); setStep(2); }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                installType === "vps"
                  ? "border-[#3b82f6] bg-[#1e293b]"
                  : "border-[#1a1a1a] hover:border-[#3b82f6]/50 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <Server size={24} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">Cloud VPS</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Run Hermes 24/7 on a virtual server. No computer needed — always online, handles cron jobs and overnight tasks.
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-[#E8F5E9] text-purple-400 px-2 py-0.5 rounded">24/7 uptime</span>
                    <span className="text-[10px] bg-[#E8F5E9] text-green-400 px-2 py-0.5 rounded">Auto-scaling</span>
                    <span className="text-[10px] bg-[#E8F5E9] text-amber-400 px-2 py-0.5 rounded">~$5-10/mo</span>
                  </div>
                </div>
              </div>
            </button>

            <div className="p-3 bg-[#E8F5E9] border border-[#3b82f6]/20 rounded-lg">
              <div className="flex gap-2">
                <span className="text-sm mt-0.5">💡</span>
                <div>
                  <div className="text-xs font-medium text-gray-800">Not sure?</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Start with <strong className="text-gray-500">Local</strong> — it's free and takes 2 minutes. You can move to VPS later by copying your config files.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === STEP 2: API Keys === */}
        {step === 2 && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">API Keys</h3>
              <p className="text-sm text-gray-500">Hermes needs these to connect to your dashboard and AI providers.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  DeepSeek API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={keys.deepseek}
                  onChange={(e) => updateKey("deepseek", e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                  Get one at{" "}
                  <button onClick={() => window.open("https://platform.deepseek.com/api_keys", "_blank")} className="text-blue-400 hover:underline">
                    platform.deepseek.com
                  </button>
                  {" "}— cheap, excellent quality
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  OpenRouter API Key <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="password"
                  value={keys.openrouter}
                  onChange={(e) => updateKey("openrouter", e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Upstash Redis URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={keys.upstash_url}
                  onChange={(e) => updateKey("upstash_url", e.target.value)}
                  placeholder="https://your-instance.upstash.io"
                  className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                  Free tier at{" "}
                  <button onClick={() => window.open("https://console.upstash.com/redis", "_blank")} className="text-blue-400 hover:underline">
                    upstash.com
                  </button>
                  {" "}— this connects Hermes to your dashboard
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Upstash Redis Token <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={keys.upstash_token}
                  onChange={(e) => updateKey("upstash_token", e.target.value)}
                  placeholder="your-rest-token"
                  className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Telegram Bot Token <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="password"
                  value={keys.telegram_token}
                  onChange={(e) => updateKey("telegram_token", e.target.value)}
                  placeholder="123456:ABC-DEF..."
                  className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                  Create via @BotFather on Telegram — lets you talk to Hermes from your phone
                </div>
              </div>
            </div>

            <button
              onClick={() => { setGenerated(false); setStep(3); }}
              className="w-full py-2.5 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors mt-4"
            >
              Continue to Config Generation
            </button>
          </div>
        )}

        {/* === STEP 3: Generate Config === */}
        {step === 3 && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Config Files</h3>
              <p className="text-sm text-gray-500">Download these and place them in <code className="bg-[#1e293b] px-1.5 py-0.5 rounded text-xs">~/.hermes/</code></p>
            </div>

            <button
              onClick={() => { setGenerated(true); }}
              className="w-full py-3 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Generate My Config Files
            </button>

            {generated && (
              <div className="space-y-3 mt-4">
                {/* config.yaml download */}
                <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-blue-400" />
                      <span className="text-sm font-medium text-gray-800">config.yaml</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyToClipboard(generateConfigYaml(), "config")}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Copy"
                      >
                        {copiedCmd === "config" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => downloadFile(generateConfigYaml(), "config.yaml")}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[11px] text-gray-500 bg-[#FDFBF7] rounded p-3 overflow-x-auto max-h-60">
{generateConfigYaml()}</pre>
                </div>

                {/* .env download */}
                <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Key size={16} className="text-amber-400" />
                      <span className="text-sm font-medium text-gray-800">.env</span>
                      <span className="text-[10px] text-red-400">Keep this private!</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyToClipboard(generateEnvFile(), "env")}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Copy"
                      >
                        {copiedCmd === "env" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => downloadFile(generateEnvFile(), ".env")}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[11px] text-gray-500 bg-[#FDFBF7] rounded p-3 overflow-x-auto max-h-60">
{generateEnvFile()}</pre>
                </div>

                {/* Muslim SOUL download */}
                <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium text-gray-800">SOUL.md — Muslim Business Companion</span>
                      <span className="text-[10px] text-emerald-400">Recommended</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/souls/business-soul.md");
                            const text = await res.text();
                            await navigator.clipboard.writeText(text);
                            setCopiedCmd("soul");
                            setTimeout(() => setCopiedCmd(null), 2000);
                          } catch {}
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Copy"
                      >
                        {copiedCmd === "soul" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                      <a
                        href="/souls/business-soul.md"
                        download="SOUL.md"
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    An Islamic business companion personality for your Hermes. Halal-first, business-savvy, dashboard-aware. Place alongside config.yaml.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(4)}
              className="w-full py-2.5 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors mt-2"
              disabled={!generated}
            >
              Continue to Installation
            </button>
          </div>
        )}

        {/* === STEP 4: Install Hermes === */}
        {step === 4 && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {installType === "vps" ? "Install on VPS" : "Install on Your Computer"}
              </h3>
              <p className="text-sm text-gray-500">Run these commands in your terminal</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-green-400" />
                    <span className="text-sm font-medium text-gray-800">
                      {installType === "vps" ? "VPS Setup Commands" : "Installation Commands"}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getInstallCommand(), "install")}
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                    title="Copy all"
                  >
                    {copiedCmd === "install" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <pre className="text-[11px] text-gray-500 bg-[#FDFBF7] rounded p-3 overflow-x-auto whitespace-pre-wrap">
{getInstallCommand()}</pre>
              </div>

              {/* Walkthrough */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="text-sm text-gray-800">Install Hermes</div>
                    <div className="text-xs text-gray-500">Copy and paste the command above into your terminal</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="text-sm text-gray-800">Place config files</div>
                    <div className="text-xs text-gray-500">
                      Move <code className="bg-[#1e293b] px-1 rounded text-[10px]">config.yaml</code> and{" "}
                      <code className="bg-[#1e293b] px-1 rounded text-[10px]">.env</code> into{" "}
                      <code className="bg-[#1e293b] px-1 rounded text-[10px]">~/.hermes/</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="text-sm text-gray-800">(Optional) Install Muslim SOUL</div>
                    <div className="text-xs text-gray-500">
                      Place <code className="bg-[#1e293b] px-1 rounded text-[10px]">SOUL.md</code> in{" "}
                      <code className="bg-[#1e293b] px-1 rounded text-[10px]">~/.hermes/</code> and run{" "}
                      <code className="bg-[#1e293b] px-1 rounded text-[10px]">hermes setup agent</code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</div>
                  <div>
                    <div className="text-sm text-gray-800">Start Hermes</div>
                    <div className="text-xs text-gray-500">
                      <code className="bg-[#1e293b] px-1 rounded text-[10px]">hermes gateway start</code> — this runs Hermes as a background service
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#E8F5E9] border border-[#3b82f6]/20 rounded-lg">
                <div className="flex gap-2">
                  <span className="text-sm">📖</span>
                  <div>
                    <div className="text-xs font-medium text-gray-800">Full documentation</div>
                    <button onClick={openHermesDocs} className="text-xs text-blue-400 hover:underline mt-0.5">
                      hermes-agent.nousresearch.com/docs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-2.5 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Continue to Test Connection
            </button>
          </div>
        )}

        {/* === STEP 5: Connect & Test === */}
        {step === 5 && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect & Test</h3>
              <p className="text-sm text-gray-500">Verify Hermes can talk to your dashboard</p>
            </div>

            <div className="space-y-4">
              {/* Test commands */}
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">Run these in your terminal to verify:</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Check Hermes is running:</div>
                    <div className="flex items-center justify-between bg-[#FDFBF7] rounded px-3 py-1.5">
                      <code className="text-xs text-green-400">hermes status</code>
                      <button onClick={() => copyToClipboard("hermes status", "status")} className="p-1 text-gray-500 hover:text-gray-500">
                        {copiedCmd === "status" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Health check:</div>
                    <div className="flex items-center justify-between bg-[#FDFBF7] rounded px-3 py-1.5">
                      <code className="text-xs text-green-400">hermes doctor</code>
                      <button onClick={() => copyToClipboard("hermes doctor", "doctor")} className="p-1 text-gray-500 hover:text-gray-500">
                        {copiedCmd === "doctor" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Test chat (should respond):</div>
                    <div className="flex items-center justify-between bg-[#FDFBF7] rounded px-3 py-1.5">
                      <code className="text-xs text-green-400">hermes chat -q "hello"</code>
                      <button onClick={() => copyToClipboard('hermes chat -q "hello"', "chat")} className="p-1 text-gray-500 hover:text-gray-500">
                        {copiedCmd === "chat" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Check Redis connection:</div>
                    <div className="flex items-center justify-between bg-[#FDFBF7] rounded px-3 py-1.5">
                      <code className="text-xs text-green-400">hermes gateway status</code>
                      <button onClick={() => copyToClipboard("hermes gateway status", "gw")} className="p-1 text-gray-500 hover:text-gray-500">
                        {copiedCmd === "gw" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">What success looks like:</div>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><code className="bg-[#FDFBF7] px-1 rounded">hermes status</code> shows all components green</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span><code className="bg-[#FDFBF7] px-1 rounded">hermes chat -q "hello"</code> returns a response</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Dashboard AutoPilot board shows Hermes as "online"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>You can message Hermes from Telegram (if configured)</span>
                  </div>
                </div>
              </div>

              {/* Dashboard connection info */}
              <div className="p-3 bg-[#E8F5E9] border border-[#3b82f6]/20 rounded-lg">
                <div className="flex gap-2">
                  <Code size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-gray-800">How Hermes talks to your dashboard</div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      Hermes ↔ Upstash Redis ↔ Dashboard<br />
                      The chat bridge syncs every 60 seconds. Your dashboard's Messages board is the live chat interface.
                      Hermes is the brain — the dashboard is the face.
                    </div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting guide */}
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-400" />
                    <span className="text-sm font-medium text-gray-800">Troubleshooting Guide</span>
                  </div>
                  <a
                    href="/troubleshooting.md"
                    download="troubleshooting.md"
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                </div>
                <p className="text-xs text-gray-500">
                  Covers all known issues: blank screens, connection problems, API errors, voice setup, mobile fixes, and more. Each issue includes the exact prompt to give your Hermes agent to auto-fix it.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.open("https://hermes-agent.nousresearch.com/docs/user-guide/messaging/", "_blank")}
              className="w-full py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              🎉 Setup Complete — Open Hermes Docs
            </button>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="px-4 py-3 border-t border-[#1a1a1a] bg-white shrink-0 flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1) as SetupStep)}
          disabled={step === 1}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded"
        >
          ← Back
        </button>
        {step < 5 && (
          <button
            onClick={() => setStep((step + 1) as SetupStep)}
            className="px-3 py-1.5 text-xs bg-[#3b82f6] text-white rounded hover:bg-[#2563eb]"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
