"use client";

import { useState } from "react";
import { Link, TrendingUp, DollarSign, ExternalLink, Plus, Trash2, Search, Wand2, Video, Image, Calendar, Send, BarChart3, Copy } from "lucide-react";

interface ProductIdea {
  id: string;
  name: string;
  niche: string;
  commission: string;
  viralScore: number;
  hook: string;
  platform: string;
}

interface ContentItem {
  id: string;
  productId: string;
  type: "video" | "carousel";
  platform: "pinterest" | "tiktok" | "instagram" | "youtube";
  status: "draft" | "scheduled" | "posted";
  scheduledDate: string;
}

export default function AffiliateHub() {
  const [activeTab, setActiveTab] = useState<"research" | "content" | "tracking">("research");
  const [products, setProducts] = useState<ProductIdea[]>([
    { id: "p1", name: "Magnesium Supplement", niche: "Health & Wellness", commission: "30%", viralScore: 9.5, hook: "I used to lay in bed for hours every night...", platform: "Amazon Associates" },
    { id: "p2", name: "Collagen Powder", niche: "Beauty", commission: "15%", viralScore: 8.8, hook: "My skin transformed in 30 days...", platform: "ClickBank" },
    { id: "p3", name: "Red Light Therapy", niche: "Wellness Tech", commission: "20%", viralScore: 8.2, hook: "Doctors don't want you to know...", platform: "Impact" },
    { id: "p4", name: "Creatine Gummies", niche: "Fitness", commission: "25%", viralScore: 9.0, hook: "I stopped taking powder and switched to...", platform: "Amazon Associates" },
  ]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [researchPrompt, setResearchPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const totalRevenue = 0; // placeholder for now
  const totalClicks = content.filter(c => c.status === "posted").length * 45; // mock avg
  const postedCount = content.filter(c => c.status === "posted").length;

  const handleResearch = async () => {
    if (!researchPrompt.trim()) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    // In production: call Claude/Higgsfield API
    setGenerating(false);
    setResearchPrompt("");
  };

  const handleAddContent = (productId: string, type: "video" | "carousel") => {
    const item: ContentItem = {
      id: `c-${Date.now()}`,
      productId,
      type,
      platform: "pinterest",
      status: "draft",
      scheduledDate: "",
    };
    setContent([item, ...content]);
  };

  const dailyGoal = { videos: 2, carousels: 1 };
  const todayVideos = content.filter(c => c.type === "video").length;
  const todayCarousels = content.filter(c => c.type === "carousel").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Affiliate Hub</h2>
          <p className="text-xs text-gray-500">Claude + Higgsfield workflow</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#0f1320] rounded-lg p-1 border border-[#1e293b]">
        {([
          { id: "research", label: "🔍 Research", count: products.length },
          { id: "content", label: "🎬 Content", count: content.length },
          { id: "tracking", label: "📊 Tracking", count: postedCount },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${activeTab === t.id ? "bg-[#1a1f2e] text-white" : "text-gray-500 hover:text-gray-300"}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* === RESEARCH TAB === */}
      {activeTab === "research" && (
        <div className="space-y-4">
          {/* AI Product Researcher */}
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#2a3050] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={16} className="text-green-400" />
              <span className="text-xs font-semibold text-gray-300">CLAUDE PRODUCT RESEARCHER</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Claude finds trending products with commission data, viral hooks, and content angles.
              Connects via Higgsfield MCP for video generation.
            </p>
            <textarea
              value={researchPrompt}
              onChange={e => setResearchPrompt(e.target.value)}
              placeholder="e.g., 'Find 5 trending health & wellness products with strong affiliate programs and viral short-form potential...'"
              className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 resize-none h-20 focus:outline-none focus:border-[#3b82f6]/50 mb-3"
            />
            <button onClick={handleResearch} disabled={!researchPrompt.trim() || generating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs rounded-lg transition-colors">
              {generating ? "Researching..." : <><Search size={14} /> Research Products</>}
            </button>
          </div>

          {/* Product List */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Product Ideas ({products.length})</h3>
          {products.map(p => (
            <div key={p.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full">{p.commission}</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full">🔥 {p.viralScore}/10</span>
                    <span className="text-[10px] text-gray-600">{p.platform}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f1320] rounded-lg p-3 mb-3">
                <p className="text-[10px] text-gray-500 uppercase mb-1">Viral Hook</p>
                <p className="text-xs text-gray-300 italic">"{p.hook}"</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleAddContent(p.id, "video")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs rounded-lg transition-colors">
                  <Video size={12} /> Generate Video
                </button>
                <button onClick={() => handleAddContent(p.id, "carousel")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs rounded-lg transition-colors">
                  <Image size={12} /> Carousel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === CONTENT TAB === */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {/* Daily Goal */}
          <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-3">📅 Daily Goal: 2 Videos + 1 Carousel</h4>
            <div className="flex gap-3">
              <div className="flex-1 bg-[#0f1320] rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Videos</p>
                <p className={`text-lg font-bold ${todayVideos >= dailyGoal.videos ? "text-green-400" : "text-gray-400"}`}>
                  {todayVideos}/{dailyGoal.videos}
                </p>
              </div>
              <div className="flex-1 bg-[#0f1320] rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Carousels</p>
                <p className={`text-lg font-bold ${todayCarousels >= dailyGoal.carousels ? "text-green-400" : "text-gray-400"}`}>
                  {todayCarousels}/{dailyGoal.carousels}
                </p>
              </div>
            </div>
          </div>

          {/* Multi-platform post template */}
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#2a3050] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Send size={14} className="text-blue-400" />
              <span className="text-xs font-semibold text-gray-300">POSTING WORKFLOW</span>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-green-400">1.</span>
                <span>Generate video/carousel in Claude via Higgsfield</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">2.</span>
                <span>Claude writes SEO title + description + hashtags</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">3.</span>
                <span>Post to <span className="text-red-400">Pinterest</span> → <span className="text-pink-400">TikTok</span> → <span className="text-purple-400">Instagram</span> → <span className="text-red-500">YouTube</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">4.</span>
                <span>Attach affiliate link (Amazon/ClickBank/Impact)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">5.</span>
                <span>Schedule: 6PM–10PM for best engagement</span>
              </div>
            </div>
          </div>

          {/* Content items */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Content Queue ({content.length})</h3>
          {content.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-6">Select a product above and Generate Video/Carousel to start.</p>
          )}
          {content.map(c => {
            const product = products.find(p => p.id === c.productId);
            return (
              <div key={c.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {c.type === "video" ? <Video size={14} className="text-green-400" /> : <Image size={14} className="text-blue-400" />}
                    <span className="text-xs font-medium text-white">{c.type === "video" ? "Video" : "Carousel"}</span>
                    <span className="text-[10px] bg-[#0f1320] text-gray-500 px-1.5 py-0.5 rounded-full">{c.platform}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      c.status === "posted" ? "bg-green-500/10 text-green-400" :
                      c.status === "scheduled" ? "bg-blue-500/10 text-blue-400" : "bg-gray-500/10 text-gray-500"
                    }`}>{c.status}</span>
                  </div>
                </div>
                {product && <p className="text-xs text-gray-500">{product.name} · {product.commission}</p>}
                <div className="flex gap-2 mt-3">
                  <select className="bg-[#0f1320] border border-[#1e293b] rounded-lg px-2 py-1 text-[10px] text-gray-400">
                    <option>pinterest</option>
                    <option>tiktok</option>
                    <option>instagram</option>
                    <option>youtube</option>
                  </select>
                  <input type="date"
                    className="bg-[#0f1320] border border-[#1e293b] rounded-lg px-2 py-1 text-[10px] text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === TRACKING TAB === */}
      {activeTab === "tracking" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">Est. Clicks</p>
              <p className="text-lg font-bold text-white">{totalClicks}</p>
            </div>
            <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">Posted</p>
              <p className="text-lg font-bold text-white">{postedCount}</p>
            </div>
            <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 mb-1">Revenue</p>
              <p className="text-lg font-bold text-green-400">£{totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-3">Affiliate Networks</h4>
            <div className="space-y-2">
              <a href="https://affiliate-program.amazon.com" target="_blank" className="flex items-center justify-between bg-[#0f1320] rounded-lg p-3 hover:bg-[#1a1f2e] transition-colors">
                <span className="text-xs text-gray-300">Amazon Associates</span>
                <ExternalLink size={12} className="text-gray-600" />
              </a>
              <a href="https://clickbank.com" target="_blank" className="flex items-center justify-between bg-[#0f1320] rounded-lg p-3 hover:bg-[#1a1f2e] transition-colors">
                <span className="text-xs text-gray-300">ClickBank</span>
                <ExternalLink size={12} className="text-gray-600" />
              </a>
              <a href="https://impact.com" target="_blank" className="flex items-center justify-between bg-[#0f1320] rounded-lg p-3 hover:bg-[#1a1f2e] transition-colors">
                <span className="text-xs text-gray-300">Impact</span>
                <ExternalLink size={12} className="text-gray-600" />
              </a>
            </div>
          </div>

          {/* Claude prompt templates */}
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#2a3050] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-300 mb-3">🎯 Claude Prompts</h4>
            <div className="space-y-2">
              {[
                { label: "Product Researcher", text: "Find 5 trending product categories for short-form affiliate content. Break down: commission potential, viral score, best hooks, saturation level." },
                { label: "Product Discovery", text: "Find 10 specific products in [NICHE] with affiliate programs, strong visual appeal, trending on TikTok/Pinterest." },
                { label: "Video Generator", text: "Use Higgsfield connector. Generate UGC ad: 15s, 9x16 vertical, Cance 2.0 model. Show [PERSONA] using [PRODUCT]." },
                { label: "Carousel Generator", text: "Generate 4-slide carousel: 1) Problem 2) Routine 3) Benefit 4) Result. GPT Image 2, clean modern style." },
                { label: "SEO Writer", text: "Write SEO-optimized Pinterest title, description, hashtags, and CTA for [PRODUCT]. Include affiliate disclosure." },
              ].map(p => (
                <div key={p.label} className="bg-[#0f1320] rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0 mr-2">
                    <p className="text-xs font-medium text-gray-300">{p.label}</p>
                    <p className="text-[10px] text-gray-600 truncate">{p.text}</p>
                  </div>
                  <button onClick={() => navigator.clipboard?.writeText(p.text)}
                    className="shrink-0 text-gray-600 hover:text-[#3b82f6] transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
