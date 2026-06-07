"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/data";

type RemoteMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hi my dear. Dashboard is live. Two-way chat is active.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set(["0"]));
  const lastPollId = useRef(0);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages from Telegram/Hermes
  const pollMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?after=${lastPollId.current}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.messages?.length) return;

      const newMsgs: ChatMessage[] = [];
      for (const msg of data.messages as RemoteMessage[]) {
        if (seenIds.current.has(msg.id)) continue;
        seenIds.current.add(msg.id);
        // Only show assistant (Hermes) responses in dashboard
        if (msg.role !== "assistant") continue;
        newMsgs.push({
          id: msg.id,
          role: "assistant",
          content: msg.content,
          timestamp: msg.timestamp,
        });
      }

      if (newMsgs.length > 0) {
        setMessages((prev) => {
          // Avoid adding duplicates
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = newMsgs.filter((m) => !existingIds.has(m.id));
          return [...prev, ...unique];
        });
      }

      if (data.lastId) lastPollId.current = data.lastId;
    } catch {
      // Silently ignore poll errors
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    seenIds.current.add(userMsg.id);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();

      // Show sending confirmation
      const confirmMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Sent. Hermes is responding...",
        timestamp: new Date().toISOString(),
      };
      seenIds.current.add(confirmMsg.id);
      setMessages((prev) => [...prev, confirmMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Couldn't reach Hermes. Try Telegram.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-[#1a1a1a] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center gap-2">
        <Bot size={18} className="text-[#3b82f6]" />
        <span className="text-sm font-semibold text-black">Ayla</span>
        <span className="w-2 h-2 rounded-full bg-green-500 ml-auto animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#3b82f6] text-white"
                  : "bg-white text-gray-800 border border-[#1a1a1a]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 text-sm px-3 py-2 rounded-lg border border-[#1a1a1a] animate-pulse">
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#1a1a1a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Talk to Ayla..."
            className="flex-1 bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-[#3b82f6] text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
