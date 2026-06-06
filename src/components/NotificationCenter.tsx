"use client";

import { useState, useEffect } from "react";
import { Bell, Bot, CheckCircle, XCircle, Send, AlertTriangle, Lightbulb, ArrowRight, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: "success" | "error" | "info" | "warning";
}

const iconMap: Record<string, typeof Bell> = {
  agent_output: Bot,
  review_approved: CheckCircle,
  review_rejected: XCircle,
  post_published: Send,
  post_failed: AlertTriangle,
  task_moved: ArrowRight,
  idea_generated: Lightbulb,
};

const statusColors: Record<string, string> = {
  success: "text-green-400 bg-green-500/10",
  error: "text-red-400 bg-red-500/10",
  warning: "text-yellow-400 bg-yellow-500/10",
  info: "text-blue-400 bg-blue-500/10",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const items: Notification[] = [];

    try {
      // Review queue
      const rRes = await fetch("/api/review");
      const rData = await rRes.json();
      (rData.items || []).forEach((item: any) => {
        items.push({
          id: item.id,
          type: item.status === "approved" ? "review_approved" : item.status === "rejected" ? "review_rejected" : "agent_output",
          title: item.title || "Review item",
          description: item.description || "",
          time: item.timestamp || item.reviewedAt || new Date().toISOString(),
          status: item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "info",
        });
      });
    } catch {}

    try {
      // Agents
      const aRes = await fetch("/api/agents");
      const aData = await aRes.json();
      (aData.agents || []).forEach((agent: any) => {
        if (agent.status === "done" || agent.status === "failed") {
          items.push({
            id: agent.id,
            type: "agent_output",
            title: `${agent.name} completed`,
            description: agent.task?.slice(0, 100) || "",
            time: agent.completedAt || agent.createdAt || new Date().toISOString(),
            status: agent.status === "done" ? "success" : "error",
          });
        }
      });
    } catch {}

    // Sort by time, newest first
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(items.slice(0, 50));
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
      <div className="px-4 py-4 border-b border-[#1e293b] bg-[#0f1320] shrink-0 flex items-center gap-2">
        <Bell size={18} className="text-blue-400" />
        <div>
          <h2 className="text-sm font-semibold text-gray-300">Notifications</h2>
          <p className="text-[10px] text-gray-500">{notifications.length} recent events</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-[#0f1320] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#0f1320] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Agent outputs and review items will appear here</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div key={n.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3 flex items-start gap-3 hover:border-[#2a3441] transition-colors">
                  <div className={`p-1.5 rounded-lg shrink-0 ${statusColors[n.status]}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-200 font-medium truncate">{n.title}</p>
                      <span className="text-[10px] text-gray-600 shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(n.time)}
                      </span>
                    </div>
                    {n.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
