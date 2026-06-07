"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, RefreshCw, Zap } from "lucide-react";

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, options?: any) => Promise<any>;
      };
    };
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODELS = [
  { id: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano", emoji: "🧠" },
  { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6", emoji: "🎯" },
  { id: "deepseek/deepseek-r1-0528", label: "DeepSeek R1", emoji: "🔮" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", emoji: "⚡" },
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Puter.js script
  useEffect(() => {
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
    return () => {
      // Don't remove — other components may use it
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !scriptLoaded || !window.puter) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await window.puter.ai.chat(trimmed, {
        model,
        stream: false,
      });
      const text =
        typeof response === "string"
          ? response
          : response?.message?.content?.[0]?.text ||
            response?.message?.content ||
            response?.text ||
            JSON.stringify(response);
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message || "Failed to get response"}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-white">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-[#C8E6C9]" />
          <h2 className="text-[15px] font-semibold text-gray-900">AI Chat</h2>
          {!scriptLoaded && !scriptError && (
            <span className="text-[11px] text-gray-400 ml-2">Loading Puter.js...</span>
          )}
          {scriptError && (
            <span className="text-[11px] text-red-500 ml-2">Failed to load. Refresh.</span>
          )}
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="text-[12px] bg-white border border-[#1a1a1a] rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none focus:border-[#C8E6C9]"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[13px] gap-2">
            <Zap size={32} className="text-[#C8E6C9]" />
            <p className="font-medium text-gray-500">Free LLM — 500+ models</p>
            <p className="text-[11px] text-gray-400 max-w-[240px] text-center">
              Powered by Puter.js. Zero API keys. Zero cost to Aql Digital.
              <br />
              {MODELS.find((m) => m.id === model)?.label || model} selected.
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
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white border border-[#1a1a1a] text-gray-900"
              }`}
            >
              {msg.content}
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
            placeholder={scriptLoaded ? "Ask anything... (500+ free models)" : "Loading LLM..."}
            disabled={!scriptLoaded || loading}
            className="flex-1 text-[13px] bg-white border border-[#1a1a1a] rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C8E6C9] disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!scriptLoaded || loading || !input.trim()}
            className="w-10 h-10 bg-[#1a1a1a] text-white rounded-lg flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
