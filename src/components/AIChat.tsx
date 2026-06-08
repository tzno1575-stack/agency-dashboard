"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, RefreshCw, Zap, Cpu, Cloud, Server } from "lucide-react";

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: any) => Promise<any>;
      };
    };
  }
}

type Provider = "local" | "puter";

interface LocalModel {
  name: string;
  size: number;
  parameter_size?: string;
  family?: string;
  context_length?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: Provider;
  model?: string;
}

// Cloud (Puter.js) fallback models — only used when user explicitly switches.
const CLOUD_MODELS = [
  { id: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano", emoji: "🧠" },
  { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6", emoji: "🎯" },
  { id: "deepseek/deepseek-r1-0528", label: "DeepSeek R1", emoji: "🔮" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", emoji: "⚡" },
];

function formatBytes(b?: number) {
  if (!b) return "";
  const gb = b / 1024 / 1024 / 1024;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(b / 1024 / 1024).toFixed(0)} MB`;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<Provider>("local");
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [localModel, setLocalModel] = useState<string>("");
  const [cloudModel, setCloudModel] = useState(CLOUD_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "ok" | "down">("checking");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Puter.js script (only if user switches to cloud)
  useEffect(() => {
    if (provider !== "puter") return;
    if (document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);
  }, [provider]);

  // Probe local Ollama on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/ollama", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (cancelled) return;
        if (data.ok) {
          setOllamaStatus("ok");
          setLocalModels(data.models || []);
          if (data.default_model && !localModel) {
            // Prefer local default if installed, else first available.
            const match = (data.models || []).find((m: LocalModel) => m.name === data.default_model);
            setLocalModel(match?.name || data.models?.[0]?.name || "");
          } else if (!localModel && data.models?.[0]) {
            setLocalModel(data.models[0].name);
          }
        } else {
          setOllamaStatus("down");
        }
      } catch {
        if (!cancelled) setOllamaStatus("down");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (provider === "local" && ollamaStatus !== "ok") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Local Ollama isn't reachable. Start it with `ollama serve` or switch to Cloud in the dropdown.",
          provider: "local",
        },
      ]);
      return;
    }
    if (provider === "puter" && (!scriptLoaded || !window.puter)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Cloud provider still loading. Try again in a second.",
          provider: "puter",
        },
      ]);
      return;
    }

    const userMsg: Message = { role: "user", content: trimmed, provider };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (provider === "local") {
        // Build history for context
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        const r = await fetch("/api/ollama", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            model: localModel,
            history,
          }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, provider: "local", model: data.model },
        ]);
      } else {
        // Cloud via Puter
        const response = await window.puter!.ai.chat(trimmed, {
          model: cloudModel,
          stream: false,
        });
        const text =
          typeof response === "string"
            ? response
            : response?.message?.content?.[0]?.text ||
              response?.message?.content ||
              response?.text ||
              JSON.stringify(response);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: text, provider: "puter", model: cloudModel },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e.message || "Failed to get response"}`,
          provider,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1a1a1a] bg-white flex-wrap">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-[#C8E6C9]" />
          <h2 className="text-[15px] font-semibold text-gray-900">AI Chat</h2>
          {provider === "local" && ollamaStatus === "ok" && (
            <span
              className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"
              title="Local Ollama — free, runs on this machine"
            >
              <Server size={10} /> Local · free
            </span>
          )}
          {provider === "local" && ollamaStatus === "down" && (
            <span
              className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
              title="Ollama not reachable — start it with `ollama serve`"
            >
              <Server size={10} /> Ollama offline
            </span>
          )}
          {provider === "puter" && scriptError && (
            <span className="text-[11px] text-red-500 ml-2">Cloud load failed</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Provider toggle */}
          <div className="flex border border-[#1a1a1a] rounded-lg overflow-hidden text-[11px]">
            <button
              onClick={() => setProvider("local")}
              className={`px-2 py-1.5 flex items-center gap-1 ${
                provider === "local" ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-700"
              }`}
              title="Local Ollama — zero cost, private"
            >
              <Cpu size={11} /> Local
            </button>
            <button
              onClick={() => setProvider("puter")}
              className={`px-2 py-1.5 flex items-center gap-1 ${
                provider === "puter" ? "bg-[#1a1a1a] text-white" : "bg-white text-gray-700"
              }`}
              title="Cloud (Puter.js) — free tier, slower"
            >
              <Cloud size={11} /> Cloud
            </button>
          </div>

          {/* Model selector */}
          {provider === "local" ? (
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              disabled={ollamaStatus !== "ok" || localModels.length === 0}
              className="text-[12px] bg-white border border-[#1a1a1a] rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none focus:border-[#C8E6C9] max-w-[180px]"
            >
              {localModels.length === 0 && <option value="">No models</option>}
              {localModels.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} {m.parameter_size ? `(${m.parameter_size})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={cloudModel}
              onChange={(e) => setCloudModel(e.target.value)}
              className="text-[12px] bg-white border border-[#1a1a1a] rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none focus:border-[#C8E6C9]"
            >
              {CLOUD_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[13px] gap-2">
            <Zap size={32} className="text-[#C8E6C9]" />
            <p className="font-medium text-gray-500">
              {provider === "local" ? "Local LLM — free, private" : "Cloud LLM — Puter.js"}
            </p>
            <p className="text-[11px] text-gray-400 max-w-[260px] text-center">
              {provider === "local" ? (
                <>
                  Powered by your machine&apos;s Ollama. Zero API keys. Zero cost.
                  <br />
                  Model: {localModel || "loading…"} {formatBytes(localModels.find((m) => m.name === localModel)?.size)}
                </>
              ) : (
                <>
                  Powered by Puter.js. Free tier.
                  <br />
                  {CLOUD_MODELS.find((m) => m.id === cloudModel)?.label} selected.
                </>
              )}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#C8E6C9] flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-gray-900" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 max-w-[80%]">
              <div
                className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-white border border-[#1a1a1a] text-gray-900"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && msg.model && (
                <span className="text-[10px] text-gray-400 px-1">
                  {msg.provider === "local" ? "🖥️" : "☁️"} {msg.model}
                </span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C8E6C9] flex items-center justify-center shrink-0">
              <Bot size={14} className="text-gray-900" />
            </div>
            <div className="bg-white border border-[#1a1a1a] rounded-xl px-3 py-2">
              <RefreshCw size={14} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1a1a1a] bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              provider === "local"
                ? ollamaStatus === "ok"
                  ? `Ask ${localModel || "local model"}...`
                  : "Start Ollama to chat locally"
                : scriptLoaded
                ? "Ask the cloud..."
                : "Loading cloud..."
            }
            disabled={loading || (provider === "local" && ollamaStatus !== "ok")}
            className="flex-1 text-[13px] bg-white border border-[#1a1a1a] rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C8E6C9] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={
              loading ||
              !input.trim() ||
              (provider === "local" && ollamaStatus !== "ok") ||
              (provider === "puter" && (!scriptLoaded || !window.puter))
            }
            className="w-10 h-10 bg-[#1a1a1a] text-white rounded-lg flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
