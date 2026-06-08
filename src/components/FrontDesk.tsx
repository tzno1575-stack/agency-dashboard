"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DoorOpen, Activity, FileText, Bell, MessageSquare, ListTodo,
  Code2, Lightbulb, Receipt, Loader2, ChevronDown, ChevronUp,
  ArrowRight, Check, PenLine, Zap, RefreshCw, PartyPopper,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface FrontDeskItem {
  id: string;
  title: string;
  summary?: string;
  agent?: string;
  type?: string;
  timestamp?: string;
  href?: string;
}

interface FrontDeskResponse {
  counts: { total: number; urgent: number };
  categories: {
    content: FrontDeskItem[]; tasks: FrontDeskItem[]; code: FrontDeskItem[];
    ideas: FrontDeskItem[]; messages: FrontDeskItem[]; reminders: FrontDeskItem[];
    billing: FrontDeskItem[]; health: FrontDeskItem[];
  };
  updatedAt: string;
}

type CategoryKey = keyof FrontDeskResponse["categories"];

interface CatDef {
  k: CategoryKey; l: string; I: typeof Activity; c: string; b: string; o: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────

function timeAgo(ts?: string): string {
  if (!ts) return "";
  const d = Date.now() - new Date(ts).getTime();
  if (Number.isNaN(d) || d < 0) return "";
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Order: health first when present, then high-traffic categories, then low-priority collapsed-by-default
const CATS: CatDef[] = [
  { k: "health",    l: "Health",    I: Activity,      c: "text-red-600",    b: "bg-red-50",    o: true  },
  { k: "content",   l: "Content",   I: FileText,      c: "text-purple-600", b: "bg-purple-50", o: true  },
  { k: "reminders", l: "Reminders", I: Bell,          c: "text-amber-600",  b: "bg-amber-50",  o: true  },
  { k: "messages",  l: "Messages",  I: MessageSquare, c: "text-blue-600",   b: "bg-blue-50",   o: true  },
  { k: "tasks",     l: "Tasks",     I: ListTodo,      c: "text-green-600",  b: "bg-green-50",  o: true  },
  { k: "code",      l: "Code",      I: Code2,         c: "text-slate-600",  b: "bg-slate-50",  o: false },
  { k: "ideas",     l: "Ideas",     I: Lightbulb,     c: "text-yellow-600", b: "bg-yellow-50", o: false },
  { k: "billing",   l: "Billing",   I: Receipt,       c: "text-slate-600",  b: "bg-slate-50",  o: false },
];

// ── Component ──────────────────────────────────────────────────────────

export default function FrontDesk() {
  const [data, setData] = useState<FrontDeskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<number>(Date.now());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/frontdesk", { cache: "no-store" });
      if (res.ok) {
        const json: FrontDeskResponse = await res.json();
        setData(json);
        setOpen((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const n: Record<string, boolean> = {};
          CATS.forEach((c) => { n[c.k] = c.o || (json.categories[c.k]?.length ?? 0) > 0; });
          return n;
        });
      }
    } catch { /* keep last good data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const p = setInterval(fetchData, 60_000); return () => clearInterval(p); }, [fetchData]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);

  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const total = data?.counts.total ?? 0;
  const urgent = data?.counts.urgent ?? 0;

  // Skeleton
  if (loading && !data) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-sm text-gray-500">Loading front desk…</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-white border border-[#1a1a1a] mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && total === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-4">
            <PartyPopper className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">🎉 All clear</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Nothing needs you right now. Auto-refreshes every 60 seconds.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors min-h-[44px] px-3"
          >
            <RefreshCw size={12} /> Refresh now
          </button>
        </div>
      </div>
    );
  }

  const updatedLabel = data ? timeAgo(data.updatedAt) : "";

  return (
    <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
      {/* Sticky header + quick actions */}
      <div className="sticky top-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="px-4 md:px-6 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <DoorOpen size={18} className="text-[#1a1a1a]" />
            <h1 className="text-base font-bold text-[#1a1a1a]">Front Desk</h1>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              total === 0 ? "bg-gray-100 text-gray-500"
              : urgent > 0 ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
            }`}>
              {total} {total === 1 ? "thing" : "things"} need you
            </span>
            {loading && <Loader2 size={12} className="ml-1 text-gray-400 animate-spin" />}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>Last updated: {updatedLabel || "—"}</span>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 hover:text-gray-800 transition-colors min-h-[44px] -my-3 px-1"
              aria-label="Refresh"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>

        {/* Quick action row — touch-target ≥44px, scrolls horizontally on narrow screens */}
        <div className="px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto">
          <a href="?board=content&tab=approvals"
            className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold whitespace-nowrap transition-colors">
            <Check size={14} /> Approve All Content
          </a>
          <a href="?board=content&tab=composer"
            className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-white border border-[#1a1a1a] hover:border-amber-500 text-xs font-medium whitespace-nowrap transition-colors">
            <PenLine size={14} /> Open Composer
          </a>
          <a href="?board=autopilot"
            className="flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-white border border-[#1a1a1a] hover:border-amber-500 text-xs font-medium whitespace-nowrap transition-colors">
            <Zap size={14} /> Open AutoPilot
          </a>
        </div>
      </div>

      {/* Category accordion */}
      <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto w-full space-y-2">
        {CATS.map((cat) => {
          const items = data?.categories[cat.k] ?? [];
          const isOpen = open[cat.k] ?? cat.o;
          const isHealth = cat.k === "health";
          const Icon = cat.I;
          const has = items.length > 0;
          if (!has && !cat.o) return null; // hide empty, low-priority categories

          return (
            <div key={cat.k}
              className={`rounded-xl border bg-white overflow-hidden ${
                isHealth && has ? "border-red-300 shadow-[3px_3px_0_#ef4444]" : "border-[#1a1a1a]"
              }`}
            >
              <button
                onClick={() => toggle(cat.k)}
                className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] hover:bg-gray-50 transition-colors text-left"
                aria-expanded={isOpen}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${has ? cat.b : "bg-gray-50"}`}>
                  <Icon size={16} className={has ? cat.c : "text-gray-400"} />
                </div>
                <p className={`flex-1 text-sm font-semibold ${has ? "text-[#1a1a1a]" : "text-gray-500"}`}>{cat.l}</p>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  has ? (isHealth ? "bg-red-500 text-white" : `${cat.b} ${cat.c}`)
                       : "bg-gray-100 text-gray-400"
                }`}>{items.length}</span>
                {isOpen
                  ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </button>

              {isOpen && has && (
                <ul className="border-t border-[#1a1a1a]/10 divide-y divide-[#1a1a1a]/5">
                  {items.map((it) => (
                    <li key={it.id}>
                      <a href={it.href || "#"}
                        className="flex items-start gap-3 px-3 py-3 min-h-[44px] hover:bg-amber-50/50 transition-colors group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-[#1a1a1a] truncate">{it.title}</p>
                            {it.agent && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-[#1a1a1a]/10">
                                {it.agent}
                              </span>
                            )}
                          </div>
                          {it.summary && <p className="text-xs text-gray-500 line-clamp-1">{it.summary}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {it.timestamp && <span className="text-[10px] text-gray-400">{timeAgo(it.timestamp)}</span>}
                          <span className="flex items-center gap-0.5 text-[11px] text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ArrowRight size={10} />
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {isOpen && !has && (
                <div className="border-t border-[#1a1a1a]/10 px-4 py-3 text-xs text-gray-400 text-center">
                  Nothing in {cat.l.toLowerCase()} 🎉
                </div>
              )}
            </div>
          );
        })}

        <p className="text-center text-[10px] text-gray-400 pt-2">
          Auto-refreshes every 60s · last tick {new Date(now).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
