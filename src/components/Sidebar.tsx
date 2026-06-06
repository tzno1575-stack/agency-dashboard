"use client";

import { Home, Briefcase, MessageSquare, Settings, Users, Zap, ClipboardCheck, Share2, PenLine } from "lucide-react";
import type { Client } from "@/lib/data";

export type NavBoard = "dashboard" | "taskforce" | "autopilot" | "review" | "social" | "content" | "clients" | "messages" | "settings";

interface SidebarProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: () => void;
  onNavigate: (board: NavBoard) => void;
  activeBoard: NavBoard;
  agentCount?: number;
  reviewCount?: number;
}

const boards: { id: NavBoard; section: string; name: string; icon: typeof Home; desc: string; color?: string }[] = [
  // ── BOARDS ──
  { id: "dashboard", section: "boards", name: "Dashboard", icon: Home, desc: "Tasks & kanban" },
  { id: "taskforce", section: "boards", name: "TaskForce", icon: Users, desc: "Hire & direct agents", color: "text-amber-400" },
  { id: "autopilot", section: "boards", name: "AutoPilot", icon: Zap, desc: "24/7 operations", color: "text-purple-400" },

  // ── WORKSPACE ──
  { id: "review", section: "workspace", name: "Review Queue", icon: ClipboardCheck, desc: "Approve agent output", color: "text-yellow-400" },
  { id: "social", section: "workspace", name: "Social Accounts", icon: Share2, desc: "Facebook, IG, TikTok, X", color: "text-blue-400" },
  { id: "content", section: "workspace", name: "Content Studio", icon: PenLine, desc: "Create & schedule posts", color: "text-green-400" },
  { id: "clients", section: "workspace", name: "Clients", icon: Briefcase, desc: "CRM & billing" },

  // ── SYSTEM ──
  { id: "messages", section: "system", name: "Messages", icon: MessageSquare, desc: "Ayla chat" },
  { id: "settings", section: "system", name: "Settings", icon: Settings, desc: "Config & integrations" },
];

export default function Sidebar({ clients, selectedClientId, onSelectClient, onAddClient, onNavigate, activeBoard, agentCount = 0, reviewCount = 0 }: SidebarProps) {
  const getBillingBadge = (status: Client["billing"]["status"]) => {
    const colors = { paid: "text-green-400", pending: "text-yellow-400", overdue: "text-red-400" };
    return <span className={`text-[10px] ${colors[status]}`}>●</span>;
  };

  const sections: { key: string; label: string; items: typeof boards }[] = [
    { key: "boards", label: "Boards", items: boards.filter(b => b.section === "boards") },
    { key: "workspace", label: "Workspace", items: boards.filter(b => b.section === "workspace") },
    { key: "system", label: "System", items: boards.filter(b => b.section === "system") },
  ];

  return (
    <aside className="w-60 bg-[#111827] border-r border-[#1e293b] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-3 border-b border-[#1e293b]">
        <h1 className="text-base font-bold text-white">
          <span className="text-[#3b82f6]">Aql</span> Digital
        </h1>
        <p className="text-[10px] text-gray-500 mt-0.5">Agency OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section, si) => (
          <div key={section.key} className={si > 0 ? "mt-1 pt-1 border-t border-[#1e293b]/50" : ""}>
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest px-3 py-1.5 block">
              {section.label}
            </span>
            {section.items.map((board) => {
              const isActive = activeBoard === board.id;
              const Icon = board.icon;
              return (
                <button
                  key={board.id}
                  onClick={() => onNavigate(board.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#1a1f2e] text-white border-r-2 border-[#3b82f6]"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1f2e] border-r-2 border-transparent"
                  }`}
                  title={board.desc}
                >
                  <Icon size={16} className={isActive ? board.color || "" : ""} />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-xs flex items-center gap-1.5 truncate">
                      {board.name}
                      {board.id === "taskforce" && agentCount > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full leading-none shrink-0">
                          {agentCount}
                        </span>
                      )}
                      {board.id === "review" && reviewCount > 0 && (
                        <span className="bg-yellow-500/20 text-yellow-400 text-[9px] px-1.5 py-0.5 rounded-full leading-none shrink-0">
                          {reviewCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {/* Client selector — compact, at bottom of nav */}
        <div className="mt-2 pt-2 border-t border-[#1e293b]">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">
              Clients ({clients.length})
            </span>
            <button onClick={onAddClient} className="text-[#3b82f6] text-[10px] hover:underline">+ Add</button>
          </div>
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors border-r-2 ${
                selectedClientId === client.id
                  ? "bg-[#1a1f2e] text-white border-[#3b82f6]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1f2e] border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{client.name}</span>
                {getBillingBadge(client.billing?.status || "pending")}
              </div>
            </button>
          ))}
          {clients.length === 0 && (
            <p className="text-[10px] text-gray-600 text-center py-2">No clients yet</p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#1e293b] text-[10px] text-gray-600 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
        Hermes connected
      </div>
    </aside>
  );
}
