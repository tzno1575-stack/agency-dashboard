"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Clock, Send, Eye, AlertTriangle, RefreshCw, Zap, ZapOff, Settings, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import type { ScheduledPost, SocialAccount } from "@/lib/data";

interface ApprovalItem {
  id: string;
  content: string;
  platform: string;
  status: "pending" | "approved" | "rejected" | "published";
  imageUrl?: string;
  scheduledAt?: string;
  createdAt: string;
  feedback?: string;
  title?: string;
  agent?: string;
  output?: string;
}

interface ApprovalPipelineProps {
  posts: ScheduledPost[];
  accounts: SocialAccount[];
  clientId: string;
  onDelete: (id: string) => void;
}

const SAMPLE_APPROVALS: ApprovalItem[] = [
  {
    id: "ap-1",
    content: "Silent. Smooth. Sensory-friendly. Our Tesla was designed with sensitive children in mind. No engine noise, dimmable lights, sensory toys, and no rush. £20 for 30-min calm rides. Book now: calendly.com/teslaglowrides",
    platform: "facebook",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ap-2",
    content: "Your night starts the moment we pick you up. Disco lights, karaoke mics, premium sound in a Tesla. Birthday? Hen do? Night out? Book your disco ride.",
    platform: "instagram",
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const AUTO_AUTH_LIMITS = [5, 10, 15] as const;

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadAutoAuthState() {
  try {
    const raw = localStorage.getItem("aqd_auto_auth");
    if (!raw) return { enabled: false, limit: 5 as typeof AUTO_AUTH_LIMITS[number] };
    return JSON.parse(raw);
  } catch {
    return { enabled: false, limit: 5 as typeof AUTO_AUTH_LIMITS[number] };
  }
}

function loadDailyCount() {
  try {
    const raw = localStorage.getItem("aqd_auto_auth_daily");
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data?.date === getTodayKey()) return data.count;
  } catch {}
  return 0;
}

function saveDailyCount(count: number) {
  localStorage.setItem("aqd_auto_auth_daily", JSON.stringify({ date: getTodayKey(), count }));
}

export default function ApprovalPipeline({ posts, accounts, clientId, onDelete }: ApprovalPipelineProps) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [autoAuth, setAutoAuth] = useState(false);
  const [autoAuthLimit, setAutoAuthLimit] = useState<typeof AUTO_AUTH_LIMITS[number]>(5);
  const [dailyAutoCount, setDailyAutoCount] = useState(0);
  const [showLimitPicker, setShowLimitPicker] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved" | "published">("pending");

  // Load auto-auth state on mount
  useEffect(() => {
    const saved = loadAutoAuthState();
    setAutoAuth(saved.enabled);
    setAutoAuthLimit(saved.limit);
    setDailyAutoCount(loadDailyCount());
  }, []);

  const updateAutoAuth = (enabled: boolean, limit?: typeof AUTO_AUTH_LIMITS[number]) => {
    const newLimit = limit || autoAuthLimit;
    setAutoAuth(enabled);
    if (limit) setAutoAuthLimit(newLimit);
    localStorage.setItem("aqd_auto_auth", JSON.stringify({ enabled, limit: newLimit }));
  };

  // Fetch live approvals from Redis
  useEffect(() => {
    fetch("/api/review")
      .then(r => r.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          const loaded = data.items.map((item: any) => ({
            ...item,
            status: item.status || "pending",
            // Normalize content from output field if present
            content: item.output || item.content || "",
            title: item.title || "",
            agent: item.agent || "",
          }));
          
          // Auto-authorize if enabled and under limit
          const saved = loadAutoAuthState();
          if (saved.enabled) {
            let count = loadDailyCount();
            const updated = loaded.map((item: ApprovalItem) => {
              if (item.status === "pending" && count < saved.limit) {
                count++;
                return { ...item, status: "approved" as const, autoApproved: true };
              }
              return item;
            });
            saveDailyCount(count);
            setDailyAutoCount(count);
            setApprovals(updated);
          } else {
            setApprovals(loaded);
          }
        } else {
          setApprovals(SAMPLE_APPROVALS);
        }
      })
      .catch(() => setApprovals(SAMPLE_APPROVALS))
      .finally(() => setLoading(false));
  }, []);

  const pending = approvals.filter(a => a.status === "pending");
  const approved = approvals.filter(a => a.status === "approved");
  const published = approvals.filter(a => a.status === "published");
  const rejected = approvals.filter(a => a.status === "rejected");

  const filteredItems = filter === "pending" ? pending 
    : filter === "approved" ? approved 
    : published;

  const handleApprove = async (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" as const } : a));
    setExpandedId(null);
    // Call API to update status
    try {
      await fetch("/api/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
    } catch {}
  };

  const handleReject = (id: string) => {
    const reason = feedback || "Needs revision";
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: "rejected" as const, feedback: reason } : a
    ));
    setFeedback("");
    setExpandedId(null);
  };

  const handlePublish = async (id: string) => {
    setPublishing(id);
    await new Promise(r => setTimeout(r, 1500));
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "published" as const } : a));
    setPublishing(null);
  };

  const handleResubmit = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "pending" as const, feedback: undefined } : a));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const getPlatformBadge = (platform: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      facebook: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Facebook" },
      instagram: { bg: "bg-pink-500/10", text: "text-pink-400", label: "Instagram" },
      twitter: { bg: "bg-sky-500/10", text: "text-sky-400", label: "X" },
      tiktok: { bg: "bg-gray-500/10", text: "text-gray-500", label: "TikTok" },
    };
    return map[platform] || { bg: "bg-gray-500/10", text: "text-gray-500", label: platform };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-gray-500" />
      </div>
    );
  }

  // Full-screen overlay when a post is tapped — like opening a new tab
  const expandedItem = expandedId ? approvals.find(a => a.id === expandedId) : null;

  // List view
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a1a1a] bg-[#FDFBF7] shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => updateAutoAuth(!autoAuth)}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors ${
              autoAuth 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-gray-500/10 text-gray-500 border border-gray-500/10 hover:text-gray-500"
            }`}
          >
            {autoAuth ? <Zap size={13} /> : <ZapOff size={13} />}
            Auto {autoAuth && `(${dailyAutoCount}/${autoAuthLimit})`}
          </button>
          
          {autoAuth && (
            <div className="relative">
              <button
                onClick={() => setShowLimitPicker(!showLimitPicker)}
                className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
              >
                <Settings size={12} />
                {autoAuthLimit}x
              </button>
              {showLimitPicker && (
                <div className="absolute right-0 top-7 bg-white border border-[#1a1a1a] rounded-lg py-1 z-20 shadow-xl min-w-[100px]">
                  {AUTO_AUTH_LIMITS.map(limit => (
                    <button
                      key={limit}
                      onClick={() => {
                        updateAutoAuth(true, limit);
                        setShowLimitPicker(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-xs hover:bg-[#1a1a1a] ${
                        autoAuthLimit === limit ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {limit}x daily
                      {autoAuthLimit === limit && " ✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {autoAuth && (
          <div className="mt-1.5 text-[10px] text-gray-500 leading-tight">
            {dailyAutoCount >= autoAuthLimit 
              ? `⚠️ Limit reached. New posts need manual approval.`
              : `Next ${autoAuthLimit - dailyAutoCount} posts auto-approved.`
            }
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-[#1a1a1a] shrink-0">
        {[
          { key: "pending" as const, label: "Pending", count: pending.length, color: "border-amber-400 text-amber-400" },
          { key: "approved" as const, label: "Approved", count: approved.length, color: "border-green-400 text-green-400" },
          { key: "published" as const, label: "Published", count: published.length, color: "border-blue-400 text-blue-400" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setExpandedId(null); }}
            className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${
              filter === tab.key 
                ? tab.color
                : "border-transparent text-gray-500 hover:text-gray-500"
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            <CheckCircle2 size={28} className="mx-auto mb-3 text-gray-400" />
            No {filter} items
          </div>
        )}

        {filteredItems.map(item => {
          const badge = getPlatformBadge(item.platform);
          const isExpanded = expandedId === item.id;
          
          return (
            <div key={item.id} className="px-3 py-1.5">
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full text-left p-4 bg-white border-2 border-[#1a1a1a] rounded-xl hover:border-[#1a1a1a] active:bg-gray-100 transition-all"
              >
                {/* Status + platform badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    item.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                    item.status === "approved" ? "bg-green-500/10 text-green-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {item.status}
                    {(item as any).autoApproved && " ⚡"}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                  <span className="ml-auto text-[10px] text-gray-500">{formatDate(item.createdAt)}</span>
                </div>

                {/* Title — bold and prominent */}
                {item.title && (
                  <h4 className="text-sm font-semibold text-black mb-2 leading-snug">{item.title}</h4>
                )}

                {/* Content preview */}
                <div className="relative">
                  <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-3">
                    {item.content}
                  </p>
                  {item.content && item.content.length > 150 && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#ffffff] to-transparent" />
                  )}
                </div>

                {/* Tap to read */}
                {item.content && item.content.length > 150 && (
                  <div className="flex items-center gap-1.5 mt-2 text-[12px] text-blue-400 font-medium">
                    <span>Tap to read & review</span>
                    <ChevronDown size={14} />
                  </div>
                )}

                {/* Agent */}
                {item.agent && (
                  <div className="mt-2 text-[11px] text-gray-500">Drafted by {item.agent}</div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>

    {/* FULL-SCREEN OVERLAY — portaled to body, escapes all containers */}
    {expandedItem && createPortal(
      <div className="fixed inset-0 z-[60] bg-[#FDFBF7] flex flex-col" style={{ height: "100dvh" }}>
        {/* Top bar: back + meta */}
        <div className="px-4 py-3 border-b border-[#1a1a1a] bg-white shrink-0">
          <button
            onClick={() => setExpandedId(null)}
            className="flex items-center gap-2 text-sm text-gray-800 hover:text-gray-900 py-1"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              expandedItem.status === "pending" ? "bg-amber-500/10 text-amber-400" :
              expandedItem.status === "approved" ? "bg-green-500/10 text-green-400" :
              "bg-red-500/10 text-red-400"
            }`}>
              {expandedItem.status}
              {(expandedItem as any).autoApproved && " ⚡"}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${getPlatformBadge(expandedItem.platform).bg} ${getPlatformBadge(expandedItem.platform).text}`}>
              {getPlatformBadge(expandedItem.platform).label}
            </span>
            <span className="text-[11px] text-gray-500">{formatDate(expandedItem.createdAt)}</span>
          </div>
        </div>

        {/* Scrollable content — THE FULL POST */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {expandedItem.title && (
            <h2 className="text-lg font-bold text-black leading-snug">
              {expandedItem.title}
            </h2>
          )}

          {expandedItem.agent && (
            <div className="text-xs text-gray-500">Drafted by {expandedItem.agent}</div>
          )}

          <div className="bg-white border border-[#1a1a1a] rounded-xl p-5">
            <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
              {expandedItem.content}
            </p>
          </div>

          {expandedItem.imageUrl && (
            <img src={expandedItem.imageUrl} alt="Post" className="w-full rounded-xl border border-[#1a1a1a]" />
          )}

          {expandedItem.feedback && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs font-medium text-red-400">Feedback</span>
              </div>
              <p className="text-sm text-red-600">{expandedItem.feedback}</p>
            </div>
          )}

          <div className="h-24" />
        </div>

        {/* Bottom action bar */}
        <div className="px-4 py-4 border-t border-[#1a1a1a] bg-white shrink-0">
          {expandedItem.status === "pending" && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(expandedItem.id)}
                  className="flex-1 py-3.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                >
                  <CheckCircle2 size={18} /> Approve & Post
                </button>
                <button
                  onClick={() => handleReject(expandedItem.id)}
                  className="flex-1 py-3.5 text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback (optional)..."
                className="w-full bg-[#FDFBF7] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-600 resize-none"
                rows={2}
              />
            </div>
          )}

          {expandedItem.status === "approved" && (
            <button
              onClick={() => handlePublish(expandedItem.id)}
              disabled={publishing === expandedItem.id}
              className="w-full py-3.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.97] transition-transform"
            >
              {publishing === expandedItem.id ? (
                <><RefreshCw size={18} className="animate-spin" /> Publishing...</>
              ) : (
                <><Send size={18} /> Publish Now</>
              )}
            </button>
          )}

          {expandedItem.status === "rejected" && (
            <button
              onClick={() => handleResubmit(expandedItem.id)}
              className="w-full py-3.5 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <RefreshCw size={18} /> Resubmit for Review
            </button>
          )}

          {expandedItem.status === "published" && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400 py-3">
              <CheckCircle2 size={18} />
              Published to {expandedItem.platform}
            </div>
          )}
        </div>
      </div>
    , document.body)}
  </>
  );
}
