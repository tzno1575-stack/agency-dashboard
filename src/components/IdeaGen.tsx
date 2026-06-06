"use client";

import { useState } from "react";
import { Lightbulb, Sparkles, TrendingUp, PoundSterling } from "lucide-react";
import type { Idea } from "@/lib/data";

export default function IdeaGen() {
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-500/10 text-green-400 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Hard: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Expert: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const handleGenerate = async () => {
    if (!skills.trim() || !budget) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skills.trim(), budget, location: location.trim() }),
      });
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch {}
    setLoading(false);
    setHasSearched(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Lightbulb size={18} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-300">Idea Generator</h2>
            <p className="text-[10px] text-gray-500">Enter your skills and budget — get business ideas</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Form */}
          <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                  Your Skills *
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. web dev, marketing, writing"
                  autoFocus
                  className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6] placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                  Budget *
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6]"
                >
                  <option value="">Select budget...</option>
                  <option value="100">£100</option>
                  <option value="500">£500</option>
                  <option value="1000">£1,000</option>
                  <option value="5000">£5,000</option>
                  <option value="10000">£10,000</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Birmingham, UK"
                  className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#3b82f6] placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !skills.trim() || !budget}
              className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-black font-medium py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/10"
            >
              <Sparkles size={16} />
              {loading ? "Generating..." : "Generate Ideas"}
            </button>
          </div>

          {/* Results */}
          {hasSearched && (
            <>
              {ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-5 hover:border-[#3b82f6]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-200">{idea.businessName}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            difficultyColors[idea.difficulty]
                          }`}
                        >
                          {idea.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">{idea.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-[#1e293b] pt-3">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp size={12} className="text-green-400" />
                          {idea.estimatedRevenue}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <PoundSterling size={12} className="text-blue-400" />
                          {idea.startupCost}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <Lightbulb size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No ideas match that budget. Try a higher one.</p>
                </div>
              )}
            </>
          )}

          {!hasSearched && (
            <div className="text-center text-gray-600 py-16">
              <Lightbulb size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Enter your skills and budget above to generate business ideas</p>
              <p className="text-xs mt-1">Ideas are filtered by your startup budget</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
