"use client";

import { useState } from "react";
import { Send, Calendar, Hash, Sparkles, Clock, Trash2, ExternalLink } from "lucide-react";
import { socialPlatforms, hashtagGroups } from "@/lib/data";
import type { ScheduledPost, SocialAccount, SocialPlatform } from "@/lib/data";

interface ContentStudioProps {
  posts: ScheduledPost[];
  accounts: SocialAccount[];
  clientId: string;
  onSave: (post: ScheduledPost) => void;
  onDelete: (id: string) => void;
}

export default function ContentStudio({ posts, accounts, clientId, onSave, onDelete }: ContentStudioProps) {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [showHashtagPicker, setShowHashtagPicker] = useState(false);

  const clientPosts = posts.filter((p) => p.clientId === clientId).sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );
  const connectedAccounts = accounts.filter(
    (a) => a.clientId === clientId && a.status === "connected"
  );
  const pendingAccounts = accounts.filter(
    (a) => a.clientId === clientId
  );

  const handleCreatePost = () => {
    if (!content.trim()) return;
    const scheduledAt = scheduleDate
      ? `${scheduleDate}T${scheduleTime}:00Z`
      : new Date().toISOString();

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
    // Push to review queue — user approves before it becomes a draft
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `AI Content: ${aiPrompt.trim().slice(0, 60)}...`,
          description: aiPrompt.trim(),
          agent: "Content Agent (AI)",
          type: "content",
          clientId,
          output: `[Generating content based on: "${aiPrompt.trim()}"]`,
        }),
      });
    } catch {}
    setAiPrompt("");
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addHashtagGroup = (tags: string[]) => {
    setSelectedHashtags((prev) => {
      const newTags = tags.filter((t) => !prev.includes(t));
      return [...prev, ...newTags];
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Post creator */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Content Studio
        </h2>

        {/* Platform picker */}
        <div className="flex gap-1.5 mb-3">
          {pendingAccounts.length > 0 ? (
            pendingAccounts.map((acc) => {
              const p = socialPlatforms.find((sp) => sp.id === acc.platform);
              return (
                <button
                  key={acc.id}
                  onClick={() => setPlatform(acc.platform)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    platform === acc.platform
                      ? "bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-white"
                      : "bg-[#1a1f2e] border border-[#1e293b] text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {p?.icon} {p?.label}
                  {acc.status !== "connected" && (
                    <span className="text-[10px] text-yellow-500 ml-1">●</span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-gray-600">Add a social account first (Social tab)</p>
          )}
        </div>

        {/* Content input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post... include emojis, hashtags, calls to action"
          className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-lg px-4 py-3 text-sm text-gray-200 h-32 resize-none focus:outline-none focus:border-[#3b82f6] mb-3"
        />

        {/* AI Prompt box */}
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-yellow-500" />
            <span className="text-xs text-gray-400">AI Content Generator</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='e.g. "Write 3 posts about sensory-friendly taxi rides for autistic children"'
              className="flex-1 bg-[#0f1320] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-[#3b82f6]"
            />
            <button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim()}
              className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-500/30 disabled:opacity-40 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Hashtag picker */}
        <div className="mb-3">
          <button
            onClick={() => setShowHashtagPicker(!showHashtagPicker)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 mb-2"
          >
            <Hash size={12} />
            Hashtags ({selectedHashtags.length})
          </button>
          {selectedHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedHashtags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => toggleHashtag(tag)}
                  className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-0.5 rounded-full cursor-pointer hover:bg-red-500/20 hover:text-red-400"
                >
                  {tag} ✕
                </span>
              ))}
            </div>
          )}
          {showHashtagPicker && (
            <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3 space-y-2">
              {/* Hashtag groups */}
              {hashtagGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => addHashtagGroup(group.tags)}
                  className="w-full text-left text-xs text-gray-400 hover:text-gray-200 py-1"
                >
                  + {group.name} ({group.tags.length} tags)
                </button>
              ))}
              <div className="border-t border-[#1e293b] pt-2">
                <input
                  type="text"
                  placeholder="Add custom tag..."
                  className="w-full bg-[#0f1320] border border-[#1e293b] rounded px-2 py-1 text-xs text-gray-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !selectedHashtags.includes(val)) {
                        setSelectedHashtags([...selectedHashtags, val.startsWith("#") ? val : `#${val}`]);
                      }
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Calendar size={12} /> Date
            </label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-gray-200"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Clock size={12} /> Time
            </label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-gray-200"
            />
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreatePost}
          disabled={!content.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white text-sm py-2.5 rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} />
          {scheduleDate ? "Schedule Post" : "Save as Draft"}
        </button>
      </div>

      {/* Scheduled posts sidebar */}
      <div className="w-72 border-l border-[#1e293b] overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
          Posts ({clientPosts.length})
        </h3>
        {clientPosts.length === 0 ? (
          <p className="text-xs text-gray-600">No posts yet</p>
        ) : (
          <div className="space-y-2">
            {clientPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-[#1a1f2e] border rounded-lg p-2.5 text-xs ${
                  post.status === "posted"
                    ? "border-green-500/20 opacity-70"
                    : post.status === "failed"
                    ? "border-red-500/20"
                    : "border-[#1e293b]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      post.status === "scheduled"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : post.status === "posted"
                        ? "bg-green-500/20 text-green-400"
                        : post.status === "failed"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {post.status}
                  </span>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="text-gray-600 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-gray-300 line-clamp-3 mb-1">{post.content}</p>
                <div className="flex items-center gap-1 text-gray-600">
                  <span>{socialPlatforms.find((p) => p.id === post.platform)?.icon}</span>
                  <span>{new Date(post.scheduledAt).toLocaleDateString()}</span>
                </div>
                {post.errorMessage && (
                  <p className="text-red-400 mt-1 text-[10px]">{post.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
