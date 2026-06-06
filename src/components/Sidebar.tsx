"use client";

import { Home, Briefcase, MessageSquare, Settings, Users, Zap, Activity } from "lucide-react";
import type { Client } from "@/lib/data";

type NavBoard = "dashboard" | "taskforce" | "autopilot" | "clients" | "messages" | "settings";

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

const boards: { id: NavBoard; name: string; icon: typeof Home; desc: string; color?: string }[] = [
  { id: "dashboard", name: "Dashboard", icon: Home, desc: "Tasks & overview" },
  { id: "taskforce", name: "TaskForce", icon: Users, desc: "Hire & direct agents", color: "text-amber-400" },
  { id: "autopilot", name: "AutoPilot", icon: Zap, desc: "24/7 operations", color: "text-purple-400" },
  { id: "clients", name: "Clients", icon: Briefcase, desc: "CRM & billing" },
  { id: "messages", name: "Messages", icon: MessageSquare, desc: "Ayla chat" },
  { id: "settings", name: "Settings", icon: Settings, desc: "Config & integrations" },
];

export default function Sidebar({ clients, selectedClientId, onSelectClient, onAddClient, onNavigate, activeBoard, agentCount = 0, reviewCount = 0 }: SidebarProps) {
  const getBillingBadge = (status: Client["billing"]["status"]) => {
    const colors = { paid: "text-green-400", pending: "text-yellow-400", overdue: "text-red-400" };
    return <span className={`text-[10px] ${colors[status]}`}>●</span>;
  };

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1e293b] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-[#1e293b]">
        <h1 className="text-lg font-bold text-white">
          <span className="text-[#3b82f6]">Aql</span> Digital
        </h1>
        <p className="text-xs text-gray-500 mt-1">Agency OS</p>
      </div>

      {/* Boards */}
      <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 block">Boards</span>
        {boards.map((board) => {
          const isActive = activeBoard === board.id;
          const Icon = board.icon;
          return (
            <button
              key={board.id}
              onClick={() => onNavigate(board.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1f2e]"
              }`}
              title={board.desc}
            >
              <Icon size={18} className={isActive ? board.color || "" : ""} />
              <div className="text-left flex-1">
                <div className="font-medium flex items-center gap-2">
                  {board.name}
                  {board.id === "taskforce" && agentCount > 0 && (
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                      {agentCount}
                    </span>
                  )}
                  {board.id === "autopilot" && reviewCount > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                      {reviewCount}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-600">{board.desc}</div>
              </div>
            </button>
          );
        })}

        {/* Clients section */}
        <div className="mt-4 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Clients ({clients.length})
            </span>
            <button onClick={onAddClient} className="text-[#3b82f6] text-xs hover:underline">
              + Add
            </button>
          </div>
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                selectedClientId === client.id
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1f2e]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{client.name}</span>
                {getBillingBadge(client.billing?.status || "pending")}
              </div>
              <div className="text-xs text-gray-500 truncate">{client.website}</div>
            </button>
          ))}
          {clients.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-2">No clients yet</p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e293b] text-xs text-gray-600 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Hermes Agent connected
      </div>
    </aside>
  );
}
