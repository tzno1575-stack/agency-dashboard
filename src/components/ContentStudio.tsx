"use client";

import { useState } from "react";
import { Send, Calendar, Hash, Sparkles, Clock, Trash2, Plus, X, ChevronDown } from "lucide-react";
import { socialPlatforms, hashtagGroups } from "@/lib/data";
import type { ScheduledPost, SocialAccount, SocialPlatform } from "@/lib/data";

interface ContentStudioProps {
  posts: ScheduledPost[];
  accounts: SocialAccount[];
  clientId: string;
  onSave: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
  onBack?: () => void;
}

export default function ContentStudio({ posts, accounts, clientId, onSave, onDelete, onBack }: ContentStudioProps) {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [showHashtagPicker, setShowHashtagPicker] = useState(false);
  const [showPosts, setShowPosts] = useState(false);

  const clientPosts = posts
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const connectedAccounts = accounts.filter((a) => a.clientId === clientId && a.status === "connected");
  const allAccounts = accounts.filter((a) => a.clientId === clientId);

  const handleCreatePost = () => {
    if (!content.trim()) return;
    const scheduledAt = scheduleDate ? `${scheduleDate}T${scheduleTime}:00Z` : new Date().toISOString();
    const post: ScheduledPost = {
      id: `post-${Date.now()}`,
      clientId,
      platform,
      content: content.trim(),
      hashtags: selectedHashtags,
      scheduledAt,
      status: scheduleDate ? "scheduled" : "draft",
      aiPrompt: aiPrompt.trim() || undefined,
    };
    onSave(post);
    setContent("");
    setSelectedHashtags([]);
    setAiPrompt("");
    setScheduleDate("");
    setScheduleTime("09:00");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `AI: ${aiPrompt.trim().slice(0, 60)}`,
          description: aiPrompt.trim(),
          agent: "Content Agent",
          type: "content",
          clientId,
          output: `[Generating: "${aiPrompt.trim()}"]`,
        }),
      });
    } catch {}
    setAiPrompt("");
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addHashtagGroup = (tags: string[]) => {
    setSelectedHashtags((prev) => {
      const newTags = tags.filter((t) => !prev.includes(t));
      return [...prev, ...newTags];
    });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      scheduled: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      posted: "bg-green-500/10 text-green-400 border-green-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return map[status] || map.draft;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
        {onBack && (
          <button onClick={onBack} className="p-1 text-gray-400 hover:text-white md:hidden">
            <X size={20} />
          </button>
        )}
        <h2 className="text-sm font-semibold text-gray-300">Content Studio</h2>
        <button
          onClick={() => setShowPosts(!showPosts)}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#1a1f2e] px-3 py-1.5 rounded-lg border border-[#1e293b]"
        >
          Posts ({clientPosts.length})
          <ChevronDown size={12} className={showPosts ? "rotate-180" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          {/* === PLATFORM SELECTOR === */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Platform
            </label>
            <div className="flex gap-2 flex-wrap">
              {socialPlatforms.map((p) => {
                const hasAccount = allAccounts.some((a) => a.platform === p.id);
                const isConnected = connectedAccounts.some((a) => a.platform === p.id);
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20"
                        : "bg-[#1a1f2e] border border-[#1e293b] text-gray-400 hover:border-[#3b82f6]/50 hover:text-gray-200"
                    } ${!hasAccount ? "opacity-40" : ""}`}
                    disabled={!hasAccount}
                  >
                    <span className="text-lg">{p.icon}</span>
                    {p.label}
                    {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  </button>
                );
              })}
            </div>
            {allAccounts.length === 0 && (
              <p className="text-xs text-gray-600 mt-2">Add a social account in Social Accounts first</p>
            )}
          </div>

          {/* === CONTENT TEXTAREA === */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share? Include emojis, hashtags, and a call to action..."
              className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-xl px-5 py-4 text-sm text-gray-200 h-40 resize-none focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30 placeholder:text-gray-600 transition-all"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-600">{content.length} characters</span>
            </div>
          </div>

          {/* === AI GENERATOR === */}
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Sparkles size={14} className="text-yellow-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-200">AI Generator</span>
                <p className="text-[10px] text-gray-500">Describe what to write — agent does the rest</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
                placeholder='e.g. "Write a warm post about our sensory-friendly taxi service..."'
                className="flex-1 bg-[#0f1320] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-yellow-500/50 placeholder:text-gray-600"
              />
              <button
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim()}
                className="px-5 py-2.5 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
              >
                Generate
              </button>
            </div>
          </div>

          {/* === HASHTAGS === */}
          <div>
            <button
              onClick={() => setShowHashtagPicker(!showHashtagPicker)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-2"
            >
              <Hash size={14} />
              Hashtags
              {selectedHashtags.length > 0 && (
                <span className="bg-[#3b82f6]/20 text-[#3b82f6] text-[11px] px-1.5 py-0.5 rounded-full">
                  {selectedHashtags.length}
                </span>
              )}
              <ChevronDown size={12} className={showHashtagPicker ? "rotate-180" : ""} />
            </button>

            {selectedHashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedHashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleHashtag(tag)}
                    className="text-xs bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 px-2.5 py-1 rounded-full hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            )}

            {showHashtagPicker && (
              <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Quick Add</p>
                {hashtagGroups.map((group) => (
                  <button
                    key={group.name}
                    onClick={() => addHashtagGroup(group.tags)}
                    className="w-full text-left text-sm text-gray-400 hover:text-white py-2 px-3 rounded-lg hover:bg-[#0f1320] transition-colors flex items-center gap-2"
                  >
                    <Plus size={12} className="text-[#3b82f6]" />
                    {group.name}
                    <span className="text-[10px] text-gray-600 ml-auto">{group.tags.length} tags</span>
                  </button>
                ))}
                <div className="border-t border-[#1e293b] pt-2 mt-2">
                  <input
                    type="text"
                    placeholder="Type a custom hashtag and press Enter..."
                    className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6] placeholder:text-gray-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          const tag = val.startsWith("#") ? val : `#${val}`;
                          if (!selectedHashtags.includes(tag)) {
                            setSelectedHashtags([...selectedHashtags, tag]);
                          }
                        }
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* === SCHEDULE === */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Schedule (optional)
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
                  <Calendar size={12} /> Date
                </div>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="w-32">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
                  <Clock size={12} /> Time
                </div>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
            {!scheduleDate && (
              <p className="text-[10px] text-gray-600 mt-1.5">Leave empty to save as draft</p>
            )}
          </div>

          {/* === CREATE BUTTON === */}
          <button
            onClick={handleCreatePost}
            disabled={!content.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white font-medium py-3 rounded-xl hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3b82f6]/10"
          >
            <Send size={16} />
            {scheduleDate ? "Schedule Post" : "Save as Draft"}
          </button>

          {/* === POSTS LIST (expandable) === */}
          {showPosts && (
            <div className="border-t border-[#1e293b] pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Your Posts ({clientPosts.length})
              </h3>
              {clientPosts.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No posts yet. Create your first one above.</p>
              ) : (
                <div className="space-y-2">
                  {clientPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4 hover:border-[#2a3441] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{socialPlatforms.find((p) => p.id === post.platform)?.icon}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <button
                          onClick={() => onDelete(post.id)}
                          className="p-1 text-gray-600 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.map((tag) => (
                            <span key={tag} className="text-[10px] text-[#3b82f6]">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                        <span>{new Date(post.scheduledAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}</span>
                      </div>
                      {post.errorMessage && (
                        <p className="text-red-400 mt-2 text-xs bg-red-500/10 rounded-lg p-2">{post.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
