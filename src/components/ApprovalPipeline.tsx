"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Send, Eye, Image, HardDrive, AlertTriangle, MessageCircle, RefreshCw, Zap, ZapOff, Settings } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [autoAuth, setAutoAuth] = useState(false);
  const [autoAuthLimit, setAutoAuthLimit] = useState<typeof AUTO_AUTH_LIMITS[number]>(5);
  const [dailyAutoCount, setDailyAutoCount] = useState(0);
  const [showLimitPicker, setShowLimitPicker] = useState(false);

  // Load auto-auth state on mount
  useEffect(() => {
    const saved = loadAutoAuthState();
    setAutoAuth(saved.enabled);
    setAutoAuthLimit(saved.limit);
    setDailyAutoCount(loadDailyCount());
  }, []);

  // Persist auto-auth state
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
  const rejected = approvals.filter(a => a.status === "rejected");

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" as const } : a));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, status: "rejected" as const, feedback: feedback || "Needs revision" } : a
    ));
    setFeedback("");
  };

  const handlePublish = async (id: string) => {
    setPublishing(id);
    // Simulate publishing delay
    await new Promise(r => setTimeout(r, 1500));
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "published" as const } : a));
    setPublishing(null);
  };

  const handleSendToReview = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "pending" as const, feedback: undefined } : a));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Approval Queue */}
      <div className="w-72 border-r border-[#1e293b] flex flex-col shrink-0">
        {/* Auto-Authorize Controls */}
        <div className="px-3 py-2 border-b border-[#1e293b] bg-[#0a0e17]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => updateAutoAuth(!autoAuth)}
              className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg transition-colors ${
                autoAuth 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-gray-500/10 text-gray-500 border border-gray-500/10 hover:text-gray-400"
              }`}
            >
              {autoAuth ? <Zap size={12} /> : <ZapOff size={12} />}
              Auto {autoAuth && `(${dailyAutoCount}/${autoAuthLimit})`}
            </button>
            
            {autoAuth && (
              <div className="relative">
                <button
                  onClick={() => setShowLimitPicker(!showLimitPicker)}
                  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 px-1.5 py-1 rounded"
                >
                  <Settings size={11} />
                  {autoAuthLimit}x
                </button>
                {showLimitPicker && (
                  <div className="absolute right-0 top-7 bg-[#1a1f2e] border border-[#2a3050] rounded-lg py-1 z-20 shadow-xl">
                    {AUTO_AUTH_LIMITS.map(limit => (
                      <button
                        key={limit}
                        onClick={() => {
                          updateAutoAuth(true, limit);
                          setShowLimitPicker(false);
                        }}
                        className={`block w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#2a3050] ${
                          autoAuthLimit === limit ? "text-emerald-400" : "text-gray-400"
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
            <div className="mt-1.5 text-[9px] text-gray-600 leading-tight">
              {dailyAutoCount >= autoAuthLimit 
                ? `⚠️ Limit reached (${autoAuthLimit}/${autoAuthLimit}). New posts need manual approval.`
                : `Next ${autoAuthLimit - dailyAutoCount} posts auto-approved.`
              }
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e293b]">
          {[
            { key: "pending", label: "Pending", count: pending.length, color: "text-amber-400" },
            { key: "approved", label: "Approved", count: approved.length, color: "text-green-400" },
            { key: "published", label: "Published", count: approvals.filter(a => a.status === "published").length, color: "text-blue-400" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedItem(null)}
              className={`flex-1 py-2 text-[10px] font-medium border-b-2 transition-colors ${
                selectedItem ? "border-transparent text-gray-600" : `border-${tab.color.replace("text-", "")} ${tab.color}`
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {pending.length === 0 && approved.length === 0 && (
            <div className="p-4 text-center text-xs text-gray-600">
              <CheckCircle2 size={20} className="mx-auto mb-2 text-gray-700" />
              No items to review
            </div>
          )}

          {[...pending, ...approved].map(item => (
            <button
              key={item.id}
              onClick={() => { setSelectedItem(item); setShowPreview(false); }}
              className={`w-full text-left p-3 border-b border-[#1e293b] hover:bg-[#1a1f2e] transition-colors ${
                selectedItem?.id === item.id ? "bg-[#1a2436] border-l-2 border-l-[#3b82f6]" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  item.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                  item.status === "approved" ? "bg-green-500/10 text-green-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {item.status}
                  {(item as any).autoApproved && " ⚡"}
                </span>
                <span className="text-[10px] text-gray-600">{item.platform}</span>
              </div>
              <div className="text-xs text-gray-400 line-clamp-2">{item.content}</div>
              <div className="text-[10px] text-gray-600 mt-1">{formatDate(item.createdAt)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Preview / Actions */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedItem ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            <div className="text-center">
              <Eye size={24} className="mx-auto mb-2 text-gray-700" />
              Select an item to review
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  selectedItem.status === "pending" ? "bg-amber-400" :
                  selectedItem.status === "approved" ? "bg-green-400" :
                  "bg-red-400"
                }`} />
                <span className="text-sm font-medium text-gray-200">
                  {selectedItem.platform.toUpperCase()} Post
                </span>
                <span className="text-[10px] text-gray-600">{formatDate(selectedItem.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-1 text-[10px] rounded ${showPreview ? "bg-[#3b82f6] text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-4">
              {showPreview ? (
                /* Preview mode — shows what the post will look like */
                <div className="max-w-md mx-auto">
                  <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl overflow-hidden">
                    {/* Mock social post header */}
                    <div className="p-3 flex items-center gap-2 border-b border-[#1e293b]">
                      <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold">A</div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">Aql Digital</div>
                        <div className="text-[10px] text-gray-500">Just now</div>
                      </div>
                    </div>
                    {/* Post content */}
                    <div className="p-3">
                      <p className="text-sm text-gray-300 leading-relaxed">{selectedItem.content}</p>
                    </div>
                    {/* Post image */}
                    {selectedItem.imageUrl && (
                      <div className="aspect-square bg-[#0a0e17] flex items-center justify-center">
                        <img src={selectedItem.imageUrl} alt="Post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* Mock engagement bar */}
                    <div className="p-3 flex gap-4 text-[10px] text-gray-600 border-t border-[#1e293b]">
                      <span>❤️ 0</span>
                      <span>💬 0</span>
                      <span>🔄 0</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit/Review mode */
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Content</div>
                    <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedItem.content}</p>
                    </div>
                  </div>

                  {selectedItem.imageUrl && (
                    <div>
                      <div className="text-[10px] text-gray-500 mb-1">Image</div>
                      <img src={selectedItem.imageUrl} alt="Post" className="w-48 h-48 object-cover rounded-lg border border-[#1e293b]" />
                    </div>
                  )}

                  {selectedItem.feedback && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle size={12} className="text-red-400" />
                        <span className="text-[10px] font-medium text-red-400">Feedback</span>
                      </div>
                      <p className="text-xs text-red-300">{selectedItem.feedback}</p>
                    </div>
                  )}

                  {/* Google Drive backup status */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-600 bg-[#0a0e17] rounded-lg p-2 border border-[#1e293b]">
                    <HardDrive size={12} />
                    <span>Backed up to Google Drive</span>
                    <span className="text-green-500 ml-auto">✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f1320] shrink-0">
              {selectedItem.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    className="flex-1 py-2 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional feedback..."
                    className="flex-[2] bg-[#0a0e17] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 resize-none h-8"
                  />
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    className="flex-1 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </div>
              )}

              {selectedItem.status === "approved" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    className="py-2 px-4 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                  >
                    Reject Anyway
                  </button>
                  <button
                    onClick={() => handlePublish(selectedItem.id)}
                    disabled={publishing === selectedItem.id}
                    className="flex-1 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {publishing === selectedItem.id ? (
                      <><RefreshCw size={14} className="animate-spin" /> Publishing...</>
                    ) : (
                      <><Send size={14} /> Publish Now</>
                    )}
                  </button>
                </div>
              )}

              {selectedItem.status === "rejected" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendToReview(selectedItem.id)}
                    className="flex-1 py-2 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Resubmit for Review
                  </button>
                </div>
              )}

              {selectedItem.status === "published" && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 size={14} />
                  Published to {selectedItem.platform}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
