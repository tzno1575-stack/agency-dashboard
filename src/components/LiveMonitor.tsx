"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Server, Cpu, Zap, Clock, Wifi, WifiOff, CheckCircle2, AlertCircle, XCircle, Circle } from "lucide-react";

interface GatewayStatus {
  running: boolean;
  pid?: number;
  uptime?: string;
  platforms?: string[];
}

interface OllamaStatus {
  running: boolean;
  loaded: string[];
  available: string[];
}

interface ServiceStatus {
  name: string;
  label: string;
  status: "running" | "ok" | "stale" | "down" | "pending";
  running: boolean;
  last_beat_s: number | null;
  max_ok_s: number;
}

interface LiveStatus {
  ts: string;
  host: string;
  gateway: GatewayStatus;
  ollama: OllamaStatus;
  services: ServiceStatus[];
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  running:    { color: "#22c55e", bg: "bg-green-500/10", icon: Activity, label: "Running" },
  ok:         { color: "#22c55e", bg: "bg-green-500/10", icon: CheckCircle2, label: "Healthy" },
  stale:      { color: "#eab308", bg: "bg-yellow-500/10", icon: AlertCircle, label: "Stale" },
  down:       { color: "#ef4444", bg: "bg-red-500/10", icon: XCircle, label: "Down" },
  pending:    { color: "#6b7280", bg: "bg-gray-500/10", icon: Circle, label: "Pending" },
};

function StatusDot({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  const isRunning = status === "running";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg}`} style={{ color: cfg.color }}>
      <span className={`relative flex h-2 w-2 ${isRunning ? "" : ""}`}>
        {isRunning && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: cfg.color }} />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: cfg.color }} />
      </span>
      {cfg.label}
    </span>
  );
}

function Card({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#1a1a1a] rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs uppercase tracking-wider">
        <Icon size={14} />
        {title}
      </div>
      {children}
    </div>
  );
}

export default function LiveMonitor() {
  const [data, setData] = useState<LiveStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/monitor");
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else if (json.message === "No heartbeat yet") {
        setData(null);
        setError("Waiting for first heartbeat...");
      } else {
        setData(json);
        setError(null);
        setLastFetch(new Date().toLocaleTimeString());
      }
    } catch {
      setError("Cannot reach monitor API");
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center text-gray-500">
          <Activity size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-gray-500">Reporter pushes every 60s to Upstash</p>
        </div>
      </div>
    );
  }

  const gateway = data?.gateway;
  const ollama = data?.ollama;
  const services = data?.services || [];

  const runningCount = services.filter(s => s.status === "running" || s.status === "ok").length;
  const totalCount = services.length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-800">Live Monitor</h2>
          {data && (
            <span className="text-[10px] text-gray-500 ml-2">
              {runningCount}/{totalCount} healthy
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <Clock size={10} />
          {lastFetch || (data?.ts || "—")}
        </div>
      </div>

      {/* Gateway Card */}
      <Card title="Hermes Gateway" icon={Server}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {gateway?.running ? (
              <Wifi size={16} className="text-green-400" />
            ) : (
              <WifiOff size={16} className="text-red-400" />
            )}
            <span className={`text-sm font-medium ${gateway?.running ? "text-green-400" : "text-red-400"}`}>
              {gateway?.running ? "Connected" : "Disconnected"}
            </span>
          </div>
          {gateway?.running && (
            <div className="text-right text-xs text-gray-500">
              <div>PID {gateway.pid}</div>
              <div>Uptime {gateway.uptime}</div>
            </div>
          )}
        </div>
        {gateway?.platforms && gateway.platforms.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {gateway.platforms.map(p => (
              <span key={p} className="px-2 py-0.5 bg-white text-[10px] rounded text-gray-500 uppercase">{p}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Ollama Card */}
      <Card title="Ollama LLM" icon={Cpu}>
        <div className="flex items-center gap-2 mb-2">
          <StatusDot status={ollama?.running ? "running" : "down"} />
          <span className="text-xs text-gray-500">
            {ollama?.loaded.length || 0} loaded · {ollama?.available.length || 0} available
          </span>
        </div>
        {ollama?.loaded.length ? (
          <div className="flex flex-wrap gap-1">
            {ollama.loaded.map(m => (
              <span key={m} className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full border border-green-500/20">{m}</span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500">No models loaded in memory</p>
        )}
        {(ollama?.available?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ollama!.available.slice(0, 5).map(m => (
              <span key={m} className="px-2 py-0.5 bg-white text-gray-500 text-[10px] rounded">{m}</span>
            ))}
            {ollama!.available.length > 5 && (
              <span className="px-2 py-0.5 text-[10px] text-gray-500">+{ollama!.available.length - 5} more</span>
            )}
          </div>
        )}
      </Card>

      {/* Services Grid */}
      <Card title={`Services (${runningCount}/${totalCount})`} icon={Zap}>
        <div className="space-y-2">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-white border border-[#1a1a1a] hover:border-[#2a3441] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <StatusDot status={svc.status} />
                <div>
                  <div className="text-xs font-medium text-gray-800 truncate">{svc.label}</div>
                  <div className="text-[10px] text-gray-500">
                    {svc.last_beat_s !== null ? `${svc.last_beat_s}s ago` : "no beat"}
                    {" · "}max ok: {svc.max_ok_s}s
                  </div>
                </div>
              </div>
              {svc.running && (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full animate-pulse">LIVE</span>
              )}
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">No services tracked yet</p>
          )}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] text-gray-500 justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Running</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Healthy</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Stale</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Down</span>
      </div>
    </div>
  );
}
