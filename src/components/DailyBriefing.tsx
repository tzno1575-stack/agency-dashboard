"use client";

import { useState, useEffect } from "react";
import { Sun, TrendingUp, CheckCircle2, Clock, AlertTriangle, MessageSquare, Send, Users, Zap, PenLine, DollarSign, Loader2 } from "lucide-react";

interface BriefingData {
  date: string;
  greeting: string;
  agents: { active: number; queued: number; completed: number };
  revenue: { thisMonth: number; lastMonth: number; pending: number };
  tasks: { due: number; overdue: number; completed: number };
  reviews: { pending: number; approved: number; rejected: number };
  social: { scheduled: number; published: number };
  notifications: number;
  suggestion: string;
}

export default function DailyBriefing() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      // Try to get live briefing from API
      const res = await fetch("/api/briefing");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error("API not ready");
      }
    } catch {
      // Fallback: compute from localStorage
      computeLocalBriefing();
    }
    setLoading(false);
  };

  const computeLocalBriefing = () => {
    try {
      const agents = JSON.parse(localStorage.getItem("aqd_agents") || "[]");
      const tasks = JSON.parse(localStorage.getItem("aqd_tasks") || "[]");
      const posts = JSON.parse(localStorage.getItem("aqd_posts") || "[]");
      const clients = JSON.parse(localStorage.getItem("aqd_clients") || "[]");

      const now = new Date();
      const hour = now.getHours();
      const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

      const activeAgents = agents.filter((a: any) => a.status === "running").length;
      const queuedAgents = agents.filter((a: any) => a.status === "queued").length;
      const completedAgents = agents.filter((a: any) => a.status === "completed").length;

      const todayStr = now.toISOString().split("T")[0];
      const dueToday = tasks.filter((t: any) => t.dueDate?.startsWith(todayStr) && t.status !== "done").length;
      const overdueTasks = tasks.filter((t: any) => t.dueDate && t.dueDate < todayStr && t.status !== "done").length;
      const completedTasks = tasks.filter((t: any) => t.status === "done").length;

      const pendingBilling = clients.reduce((sum: number, c: any) => {
        if (c.billing?.status === "pending" || c.billing?.status === "overdue") {
          return sum + (c.billing?.lineItems?.reduce((s: number, li: any) => s + (li.amount || 0), 0) || 0);
        }
        return sum;
      }, 0);

      const scheduledPosts = posts.filter((p: any) => p.status === "scheduled").length;
      const publishedPosts = posts.filter((p: any) => p.status === "published").length;

      setData({
        date: now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        greeting,
        agents: { active: activeAgents, queued: queuedAgents, completed: completedAgents },
        revenue: { thisMonth: 0, lastMonth: 0, pending: pendingBilling },
        tasks: { due: dueToday, overdue: overdueTasks, completed: completedTasks },
        reviews: { pending: 0, approved: 0, rejected: 0 },
        social: { scheduled: scheduledPosts, published: publishedPosts },
        notifications: 0,
        suggestion: generateSuggestion({ activeAgents, overdueTasks, scheduledPosts, pendingBilling }),
      });
    } catch {
      setData(null);
    }
  };

  const generateSuggestion = (ctx: any) => {
    const suggestions: string[] = [];
    if (ctx.overdueTasks > 0) suggestions.push(`${ctx.overdueTasks} task${ctx.overdueTasks > 1 ? "s" : ""} overdue — review your Kanban`);
    if (ctx.scheduledPosts === 0) suggestions.push("No posts scheduled — create one in Content Studio");
    if (ctx.pendingBilling > 0) suggestions.push(`£${ctx.pendingBilling} in pending invoices — check Billing`);
    if (ctx.activeAgents === 0) suggestions.push("No active agents — deploy one in TaskForce");
    if (suggestions.length === 0) suggestions.push("All clear! Consider generating a business idea in IdeaGen");
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/briefing/generate", { method: "POST" });
      if (res.ok) {
        const aiData = await res.json();
        // Merge AI suggestion into current data
        setData(prev => prev ? { ...prev, suggestion: aiData.suggestion } : prev);
      }
    } catch {}
    setGenerating(false);
  };

  useEffect(() => { fetchBriefing(); }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Unable to load briefing
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#3b82f6] mb-1">
          <Sun size={20} />
          <span className="text-xs font-semibold uppercase tracking-widest">Daily Briefing</span>
        </div>
        <h2 className="text-xl font-bold text-white">{data.greeting}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{data.date}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          icon={<Zap size={16} />}
          label="Agents"
          value={`${data.agents.active} active`}
          sub={`${data.agents.queued} queued`}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <MetricCard
          icon={<CheckCircle2 size={16} />}
          label="Tasks"
          value={`${data.tasks.due} due`}
          sub={data.tasks.overdue > 0 ? `${data.tasks.overdue} overdue` : `${data.tasks.completed} done`}
          color={data.tasks.overdue > 0 ? "text-red-400" : "text-green-400"}
          bg={data.tasks.overdue > 0 ? "bg-red-500/10" : "bg-green-500/10"}
        />
        <MetricCard
          icon={<PenLine size={16} />}
          label="Posts"
          value={`${data.social.scheduled} scheduled`}
          sub={`${data.social.published} published`}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <MetricCard
          icon={<DollarSign size={16} />}
          label="Billing"
          value={`£${data.revenue.pending}`}
          sub="pending"
          color={data.revenue.pending > 0 ? "text-yellow-400" : "text-green-400"}
          bg={data.revenue.pending > 0 ? "bg-yellow-500/10" : "bg-green-500/10"}
        />
      </div>

      {/* AI Suggestion */}
      <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#2a3050] rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare size={16} className="text-[#3b82f6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 mb-1">AI SUGGESTION</p>
            <p className="text-sm text-gray-200 leading-relaxed">{data.suggestion}</p>
          </div>
          <button
            onClick={handleGenerateAI}
            disabled={generating}
            className="shrink-0 px-2.5 py-1.5 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <QuickAction icon={<Zap size={14} />} label="Deploy Agent" href="?board=taskforce" />
          <QuickAction icon={<PenLine size={14} />} label="Create Post" href="?board=content" />
          <QuickAction icon={<Users size={14} />} label="Add Client" href="?board=clients" />
          <QuickAction icon={<DollarSign size={14} />} label="New Invoice" href="?board=billing" />
        </div>
      </div>

      {/* Refresh */}
      <button
        onClick={fetchBriefing}
        className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Refresh briefing
      </button>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3 border border-[#1e293b]`}>
      <div className={`${color} mb-1.5`}>{icon}</div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-gray-600">{sub}</p>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-3 py-2.5 bg-[#1a1f2e] border border-[#1e293b] rounded-lg text-xs text-gray-300 hover:text-white hover:border-[#3b82f6]/50 transition-all"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </a>
  );
}
