"use client";

import { useState } from "react";
import { Film, Video, Music, Calendar, Wand2, Send, Plus, Trash2 } from "lucide-react";

interface VideoScript {
  id: string;
  title: string;
  platform: "youtube" | "tiktok";
  description: string;
  hashtags: string;
  thumbnailIdea: string;
  status: "draft" | "scheduled" | "published";
  scheduledDate: string;
}

export default function VideoStudio() {
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"youtube" | "tiktok">("youtube");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"scripts" | "schedule" | "voice">("scripts");
  const [voiceText, setVoiceText] = useState("");
  const [voiceGenerating, setVoiceGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    // Simulated AI generation — will connect to local LLM via API
    await new Promise(r => setTimeout(r, 800));
    const newScript: VideoScript = {
      id: `vid-${Date.now()}`,
      title: topic,
      platform,
      description: `Full ${platform === "youtube" ? "video script" : "TikTok script"} for: ${topic}\n\nHook: [Generated hook here]\nBody: [Key points]\nCTA: [Call to action]`,
      hashtags: platform === "youtube" ? "#content #creator #tips" : "#fyp #viral #trending",
      thumbnailIdea: `Thumbnail concept for "${topic}": bold text overlay, high-contrast colors, face reaction shot`,
      status: "draft",
      scheduledDate: "",
    };
    setScripts([newScript, ...scripts]);
    setTopic("");
    setGenerating(false);
  };

  const handleDelete = (id: string) => setScripts(scripts.filter(s => s.id !== id));

  const handleSchedule = (id: string, date: string) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, scheduledDate: date, status: "scheduled" } : s));
  };

  const scheduled = scripts.filter(s => s.status === "scheduled");
  const drafts = scripts.filter(s => s.status === "draft");

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Film size={18} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Video Studio</h2>
          <p className="text-xs text-gray-500">YouTube & TikTok content production</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-[#1a1a1a]">
        <button onClick={() => setActiveTab("scripts")}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${activeTab === "scripts" ? "bg-white text-black" : "text-gray-500 hover:text-gray-800"}`}>
          ✍️ Scripts ({scripts.length})
        </button>
        <button onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${activeTab === "schedule" ? "bg-white text-black" : "text-gray-500 hover:text-gray-800"}`}>
          📅 Schedule ({scheduled.length})
        </button>
        <button onClick={() => setActiveTab("voice")}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${activeTab === "voice" ? "bg-white text-black" : "text-gray-500 hover:text-gray-800"}`}>
          🎙️ Voiceover
        </button>
      </div>

      {/* AI Generator */}
      <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#1a1a1a] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 size={16} className="text-purple-400" />
          <span className="text-xs font-semibold text-gray-800">AI SCRIPT GENERATOR</span>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPlatform("youtube")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${platform === "youtube" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white text-gray-500 border border-[#1a1a1a]"}`}>
            <Video size={14} /> YouTube
          </button>
          <button onClick={() => setPlatform("tiktok")}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${platform === "tiktok" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-white text-gray-500 border border-[#1a1a1a]"}`}>
            <Music size={14} /> TikTok
          </button>
        </div>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`What's your ${platform === "youtube" ? "video" : "TikTok"} about? (e.g., "5 AI tools for small business")`}
          className="w-full bg-white border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-800 placeholder-gray-600 resize-none h-20 focus:outline-none focus:border-[#3b82f6]/50 mb-3"
        />
        <button onClick={handleGenerate} disabled={!topic.trim() || generating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-black text-xs rounded-lg transition-colors">
          {generating ? "Generating..." : <><Send size={14} /> Generate Script</>}
        </button>
      </div>

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Upcoming</h3>
          {scheduled.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-6">No scheduled videos. Generate a script first.</p>
          )}
          {scheduled.map(s => (
            <div key={s.id} className="bg-white border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {s.platform === "youtube" ? <Video size={14} className="text-red-400" /> : <Music size={14} className="text-pink-400" />}
                <span className="text-sm font-medium text-black truncate">{s.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{new Date(s.scheduledDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scripts Tab */}
      {activeTab === "scripts" && (
        <div className="space-y-4">
          {scripts.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-8">No scripts yet. Describe your video topic above.</p>
          )}
          {scripts.map(s => (
            <div key={s.id} className="bg-white border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {s.platform === "youtube" ? <Video size={16} className="text-red-400" /> : <Music size={16} className="text-pink-400" />}
                  <div>
                    <h4 className="text-sm font-semibold text-black">{s.title}</h4>
                    <span className="text-[10px] text-gray-500">{s.status}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-4">{s.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {s.hashtags.split(" ").map((tag, i) => (
                  <span key={i} className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <span className="text-purple-400">🖼️</span>
                <span className="truncate">{s.thumbnailIdea}</span>
              </div>

              {s.status === "draft" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    onChange={(e) => handleSchedule(s.id, e.target.value)}
                    className="bg-white border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#3b82f6]/50"
                  />
                  <button
                    onClick={() => s.scheduledDate && handleSchedule(s.id, s.scheduledDate)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-xs rounded-lg transition-colors">
                    <Calendar size={12} /> Schedule
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voice Tab — VoxCPM voice cloning */}
      {activeTab === "voice" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🎙️</span>
              <span className="text-xs font-semibold text-gray-800">VOXCPM VOICE CLONING</span>
              <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full ml-auto">Free · Local</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Clone your voice once, generate unlimited voiceovers for YouTube videos. Runs locally — no API costs.</p>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              placeholder="Paste your video script here to generate voiceover..."
              className="w-full bg-white border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-800 placeholder-gray-600 resize-none h-24 focus:outline-none focus:border-[#3b82f6]/50 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!voiceText.trim()) return;
                  setVoiceGenerating(true);
                  // Placeholder — will call VoxCPM API when integrated
                  await new Promise(r => setTimeout(r, 1500));
                  setVoiceGenerating(false);
                  setVoiceText("");
                }}
                disabled={!voiceText.trim() || voiceGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-black text-xs rounded-lg transition-colors">
                {voiceGenerating ? "Generating..." : "🎤 Generate Voiceover"}
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#1a1a1a] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-800 mb-3">Setup (one-time)</h4>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">1.</span>
                <span>Install <code className="text-[10px] bg-white px-1.5 py-0.5 rounded">VoxCPM.cpp</code> — <a href="https://github.com/bluryar/VoxCPM.cpp" target="_blank" className="text-[#3b82f6] hover:underline">github.com/bluryar/VoxCPM.cpp</a> (CPU-only, no GPU)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">2.</span>
                <span>Record 30 seconds of your voice → clone with VoxCPM zero-shot</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 shrink-0 mt-0.5">3.</span>
                <span>For better quality: fine-tune with <code className="text-[10px] bg-white px-1.5 py-0.5 rounded">ComfyUI-VoxCPM2</code> + LoRA training (30 languages, 48kHz)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
