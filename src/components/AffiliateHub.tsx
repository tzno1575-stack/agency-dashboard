"use client";

import { useState } from "react";
import { Link, TrendingUp, DollarSign, ExternalLink, Plus, Trash2, BarChart3 } from "lucide-react";

interface AffiliateProgram {
  id: string;
  name: string;
  platform: string;
  commissionRate: string;
  cookieDuration: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  links: AffiliateLink[];
}

interface AffiliateLink {
  id: string;
  url: string;
  label: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export default function AffiliateHub() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([
    {
      id: "prog-1",
      name: "Tesla Accessories",
      platform: "Amazon Associates",
      commissionRate: "4%",
      cookieDuration: "24h",
      totalClicks: 1240,
      totalConversions: 38,
      totalRevenue: 186.50,
      links: [
        { id: "link-1", url: "https://amzn.to/example1", label: "Tesla floor mats review", clicks: 520, conversions: 18, revenue: 92.00 },
        { id: "link-2", url: "https://amzn.to/example2", label: "Best Tesla accessories 2026", clicks: 720, conversions: 20, revenue: 94.50 },
      ],
    },
    {
      id: "prog-2",
      name: "AI Course Bundle",
      platform: "ClickBank",
      commissionRate: "50%",
      cookieDuration: "60 days",
      totalClicks: 340,
      totalConversions: 7,
      totalRevenue: 245.00,
      links: [
        { id: "link-3", url: "https://clickbank.com/example", label: "AI side hustle course", clicks: 340, conversions: 7, revenue: 245.00 },
      ],
    },
  ]);

  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: "", platform: "", commissionRate: "", cookieDuration: "" });
  const [expandedProg, setExpandedProg] = useState<string | null>(null);

  const totalClicks = programs.reduce((s, p) => s + p.totalClicks, 0);
  const totalRevenue = programs.reduce((s, p) => s + p.totalRevenue, 0);
  const totalConversions = programs.reduce((s, p) => s + p.totalConversions, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  const handleAddProgram = () => {
    if (!newProgram.name.trim()) return;
    const program: AffiliateProgram = {
      id: `prog-${Date.now()}`,
      ...newProgram,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      links: [],
    };
    setPrograms([program, ...programs]);
    setNewProgram({ name: "", platform: "", commissionRate: "", cookieDuration: "" });
    setShowAddProgram(false);
  };

  const handleDeleteProgram = (id: string) => setPrograms(programs.filter(p => p.id !== id));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Affiliate Hub</h2>
          <p className="text-xs text-gray-500">Track programs, links & commissions</p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Clicks</p>
          <p className="text-lg font-bold text-white">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Conv</p>
          <p className="text-lg font-bold text-white">{conversionRate}%</p>
        </div>
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Revenue</p>
          <p className="text-lg font-bold text-green-400">£{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Add Program */}
      <button onClick={() => setShowAddProgram(!showAddProgram)}
        className="flex items-center gap-2 w-full py-2.5 bg-[#1a1f2e] border border-dashed border-[#2a3050] rounded-xl text-xs text-gray-500 hover:text-gray-300 hover:border-[#3b82f6]/50 transition-all mb-4">
        <Plus size={14} /> Add Affiliate Program
      </button>

      {showAddProgram && (
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4 mb-4 space-y-3">
          <input placeholder="Program name" value={newProgram.name} onChange={e => setNewProgram({...newProgram, name: e.target.value})}
            className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
          <input placeholder="Platform (Amazon, ClickBank, etc.)" value={newProgram.platform} onChange={e => setNewProgram({...newProgram, platform: e.target.value})}
            className="w-full bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
          <div className="flex gap-2">
            <input placeholder="Commission %" value={newProgram.commissionRate} onChange={e => setNewProgram({...newProgram, commissionRate: e.target.value})}
              className="flex-1 bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
            <input placeholder="Cookie duration" value={newProgram.cookieDuration} onChange={e => setNewProgram({...newProgram, cookieDuration: e.target.value})}
              className="flex-1 bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
          </div>
          <button onClick={handleAddProgram}
            className="w-full py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs rounded-lg transition-colors">
            Add Program
          </button>
        </div>
      )}

      {/* Program list */}
      <div className="space-y-3">
        {programs.map(prog => (
          <div key={prog.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl overflow-hidden">
            <button onClick={() => setExpandedProg(expandedProg === prog.id ? null : prog.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1e2440]/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <Link size={18} className="text-green-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{prog.name}</h4>
                  <p className="text-[10px] text-gray-500">{prog.platform} · {prog.commissionRate} · {prog.cookieDuration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{prog.totalClicks} clicks</p>
                  <p className="text-xs font-semibold text-green-400">£{prog.totalRevenue.toFixed(2)}</p>
                </div>
                <span className="text-gray-600 text-xs">{expandedProg === prog.id ? "▲" : "▼"}</span>
              </div>
            </button>

            {expandedProg === prog.id && (
              <div className="px-4 pb-4 border-t border-[#1e293b]">
                {/* Link stats */}
                <div className="mt-3 space-y-2">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Links</p>
                  {prog.links.map(link => (
                    <div key={link.id} className="bg-[#0f1320] rounded-lg p-3 flex items-center justify-between">
                      <div className="min-w-0 mr-2">
                        <p className="text-xs font-medium text-gray-300 truncate">{link.label}</p>
                        <p className="text-[10px] text-gray-600 truncate">{link.url}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[10px] text-gray-500">{link.clicks} clicks</span>
                          <span className="text-[10px] text-gray-500">{link.conversions} sales</span>
                          <span className="text-[10px] text-green-400">£{link.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-gray-600 hover:text-[#3b82f6] transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>

                <button onClick={() => handleDeleteProgram(prog.id)}
                  className="mt-3 flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={12} /> Remove program
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {programs.length === 0 && (
        <p className="text-xs text-gray-600 text-center py-8">No affiliate programs yet. Add one above.</p>
      )}
    </div>
  );
}
