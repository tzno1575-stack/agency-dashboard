"use client";

import { useState, useEffect } from "react";
import { Sun, TrendingUp, CheckCircle2, Clock, AlertTriangle, MessageSquare, Send, Users, Zap, PenLine, DollarSign, Loader2, Globe, Lightbulb, ArrowRight } from "lucide-react";

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

interface MarketIntel {
  date: string;
  topFind: { title: string; summary: string; action: string } | null;
  ventures: { name: string; description: string; relevance: string }[];
  tools: { name: string; description: string; pricing: string }[];
  marketSignal: string;
  idea: string;
  stats: { sourcesScraped: number; itemsFiltered: number; halalPassed: number } | null;
}

export default function DailyBriefing() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [marketIntel, setMarketIntel] = useState<MarketIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/briefing");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        throw new Error("API not ready");
      }
    } catch {
      computeLocalBriefing();
    }
    // Also fetch market intel
    try {
      const mi = await fetch("/api/market-intel");
      if (mi.ok) {
        const miData = await mi.json();
        if (miData.topFind) setMarketIntel(miData);
      }
    } catch {}
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
        <h2 className="text-xl font-bold text-black">{data.greeting}</h2>
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
      <div className="bg-gradient-to-r from-[#ffffff] to-[#1e2440] border border-[#1a1a1a] rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare size={16} className="text-[#3b82f6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 mb-1">AI SUGGESTION</p>
            <p className="text-sm text-gray-800 leading-relaxed">{data.suggestion}</p>
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

      {/* Market Pulse */}
      {marketIntel && (
        <div className="mb-6 bg-gradient-to-br from-[#0f172a] to-[#ffffff] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
            <Globe size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Market Pulse</span>
            {marketIntel.stats && (
              <span className="ml-auto text-xs text-slate-400">
                {marketIntel.stats.sourcesScraped} sources · {marketIntel.stats.halalPassed} halal
              </span>
            )}
          </div>

          {/* Top Find */}
          {marketIntel.topFind && (
            <div className="px-4 py-3 bg-emerald-500/5 border-b border-[#1a1a1a]">
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-emerald-300">{marketIntel.topFind.title}</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{marketIntel.topFind.summary}</p>
                  {marketIntel.topFind.action && (
                    <p className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
                      <ArrowRight size={10} />
                      {marketIntel.topFind.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-3 space-y-3">
            {/* Ventures */}
            {marketIntel.ventures.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">New Ventures</p>
                <ul className="space-y-1">
                  {marketIntel.ventures.slice(0, 3).map((v, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                      <span><span className="text-white font-medium">{v.name}</span> — {v.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tools */}
            {marketIntel.tools.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tools Found</p>
                <ul className="space-y-1">
                  {marketIntel.tools.map((t, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                      <span><span className="text-white font-medium">{t.name}</span> — {t.description} <span className="text-slate-500">({t.pricing})</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Market Signal */}
            {marketIntel.marketSignal && (
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Signal</p>
                <p className="text-xs text-slate-300 leading-relaxed">{marketIntel.marketSignal}</p>
              </div>
            )}

            {/* Idea */}
            {marketIntel.idea && (
              <div className="bg-white/5 rounded-lg px-3 py-2 border-l-2 border-amber-500/50">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Lightbulb size={12} className="text-amber-400" />
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Idea for Aql</p>
                </div>
                <p className="text-xs text-slate-200">{marketIntel.idea}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
        className="w-full py-2 text-xs text-gray-500 hover:text-gray-500 transition-colors"
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
    <div className={`${bg} rounded-xl p-4 border border-[#1a1a1a]`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-bold text-black">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#1a1a1a] rounded-lg text-xs text-gray-800 hover:text-gray-900 hover:border-[#3b82f6]/50 transition-all"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </a>
  );
}
