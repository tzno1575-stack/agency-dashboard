"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Zap, CheckCircle2, Clock, XCircle, Loader2, Activity } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Agent } from "@/lib/data";

interface Heartbeat {
  timestamp: string;
  gateway_pid: string;
  ollama_models: string[];
  bridges: Record<string, string>;
  cron_jobs: Record<string, string>;
}

export default function AutoPilotPage() {
  const [agents] = useLocalStorage<Agent[]>("aqd_agents", []);
  const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null);
  const [uptime, setUptime] = useState("--");
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchMonitor = async () => {
      try {
        const res = await fetch("/api/monitor");
        const data = await res.json();
        setHeartbeat(data);
        if (data.timestamp) {
          const diff = Date.now() - new Date(data.timestamp).getTime();
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(mins / 60);
          setUptime(hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`);
        }
      } catch {}
    };
    fetchMonitor();
    const interval = setInterval(fetchMonitor, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch("/api/review");
        const data = await res.json();
        setReviewCount(data.items?.filter((i: any) => i.status === "pending").length || 0);
      } catch {}
    };
    fetchReview();
    const interval = setInterval(fetchReview, 15000);
    return () => clearInterval(interval);
  }, []);

  const runningAgents = agents.filter((a) => a.status === "running" || a.status === "queued").length;
  const completedAgents = agents.filter((a) => a.status === "done").length;
  const failedAgents = agents.filter((a) => a.status === "failed").length;

  const bridges = heartbeat?.bridges || {};
  const bridgeCount = Object.keys(bridges).length;
  const bridgeOnline = Object.values(bridges).filter((v) => v === "alive").length;
  const ollamaModels = heartbeat?.ollama_models?.length || 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] bg-white sticky top-0 z-10">
        <a
          href="/"
          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </a>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">🤖 AutoPilot — 24/7 Operations</h1>
          <p className="text-xs text-gray-500">Agents run autonomously · You review in the morning</p>
        </div>
        <a
          href="/"
          target="_blank"
          className="ml-auto text-xs text-[#3b82f6] hover:underline"
        >
          Open Dashboard →
        </a>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        {/* Status grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-green-400" />
              <span className="text-xs text-gray-500">Gateway</span>
            </div>
            <p className="text-lg font-semibold text-green-400">Online</p>
            <p className="text-[10px] text-gray-500">Uptime: {uptime}</p>
          </div>
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-blue-400" />
              <span className="text-xs text-gray-500">Agents</span>
            </div>
            <p className="text-lg font-semibold text-black">{runningAgents}</p>
            <p className="text-[10px] text-gray-500">{completedAgents} done · {failedAgents} failed</p>
          </div>
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-yellow-400" />
              <span className="text-xs text-gray-500">Review Queue</span>
            </div>
            <p className="text-lg font-semibold text-yellow-400">{reviewCount}</p>
            <p className="text-[10px] text-gray-500">pending approval</p>
          </div>
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🧠</span>
              <span className="text-xs text-gray-500">Ollama</span>
            </div>
            <p className="text-lg font-semibold text-black">{ollamaModels}</p>
            <p className="text-[10px] text-gray-500">models loaded</p>
          </div>
        </div>

        {/* Bridges */}
        {heartbeat && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Bridges ({bridgeOnline}/{bridgeCount} online)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(bridges).map(([name, status]) => (
                <div
                  key={name}
                  className={`bg-white border rounded-lg p-2 flex items-center gap-2 ${
                    status === "alive" ? "border-green-500/30" : "border-red-500/30"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === "alive" ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  <span className="text-xs text-gray-800 truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cron jobs */}
        {heartbeat?.cron_jobs && Object.keys(heartbeat.cron_jobs).length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cron Jobs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(heartbeat.cron_jobs).map(([name, status]) => (
                <div
                  key={name}
                  className={`bg-white border rounded-lg p-2 flex items-center gap-2 ${
                    status === "running" || status === "ok" ? "border-green-500/30" : "border-red-500/30"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    status === "running" || status === "ok" ? "bg-green-400" : "bg-red-400"
                  }`} />
                  <span className="text-xs text-gray-800 flex-1 truncate">{name}</span>
                  <span className="text-[10px] text-gray-500">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No heartbeat */}
        {!heartbeat && (
          <div className="text-center text-gray-500 py-12">
            <Loader2 size={24} className="animate-spin mx-auto mb-3" />
            <p className="text-sm">Connecting to monitor...</p>
          </div>
        )}
      </div>
    </div>
  );
}
