"use client";

import { Home, Briefcase, MessageSquare, Settings, Users, Zap, ClipboardCheck, Share2, PenLine, ChevronLeft, ChevronRight, Menu, Lightbulb, Bell, DollarSign, Sunrise, Film, Link, BookOpen, FileText, Sparkles, Globe } from "lucide-react";
import type { Client } from "@/lib/data";

export type NavBoard = "briefing" | "dashboard" | "setup" | "sitebuilder" | "videostudio" | "taskforce" | "autopilot" | "ideagen" | "standards" | "review" | "social" | "content" | "affiliates" | "kdp" | "clients" | "billing" | "notifications" | "messages" | "settings";

interface SidebarProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: () => void;
  onNavigate: (board: NavBoard) => void;
  activeBoard: NavBoard;
  agentCount?: number;
  reviewCount?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileExpand: () => void;
  mobileExpanded: boolean;
}

const boards: { id: NavBoard; section: string; name: string; icon: typeof Home; color?: string }[] = [
  { id: "setup", section: "system", name: "Hermes Setup", icon: Sparkles, color: "text-amber-400" },
  { id: "briefing", section: "boards", name: "Briefing", icon: Sunrise, color: "text-orange-400" },
  { id: "dashboard", section: "boards", name: "Dashboard", icon: Home },
  { id: "videostudio", section: "boards", name: "Video Studio", icon: Film, color: "text-purple-400" },
  { id: "taskforce", section: "boards", name: "TaskForce", icon: Users, color: "text-amber-400" },
  { id: "autopilot", section: "boards", name: "AutoPilot", icon: Zap, color: "text-purple-400" },
  { id: "ideagen", section: "boards", name: "IdeaGen", icon: Lightbulb, color: "text-yellow-400" },
  { id: "standards", section: "boards", name: "Standards", icon: FileText, color: "text-indigo-400" },
  { id: "review", section: "workspace", name: "Review Queue", icon: ClipboardCheck, color: "text-yellow-400" },
  { id: "social", section: "workspace", name: "Social", icon: Share2, color: "text-blue-400" },
  { id: "content", section: "workspace", name: "Content", icon: PenLine, color: "text-green-400" },
  { id: "clients", section: "workspace", name: "Clients", icon: Briefcase },
  { id: "affiliates", section: "workspace", name: "Affiliates", icon: Link, color: "text-green-400" },
  { id: "sitebuilder", section: "workspace", name: "Site Builder", icon: Globe, color: "text-emerald-400" },
  { id: "kdp", section: "workspace", name: "KDP Books", icon: BookOpen, color: "text-amber-400" },
  { id: "billing", section: "workspace", name: "Billing", icon: DollarSign, color: "text-green-400" },
  { id: "notifications", section: "system", name: "Notifications", icon: Bell, color: "text-blue-400" },
  { id: "messages", section: "system", name: "Messages", icon: MessageSquare },
  { id: "settings", section: "system", name: "Settings", icon: Settings },
];

export default function Sidebar({
  clients, selectedClientId, onSelectClient, onAddClient, onNavigate,
  activeBoard, agentCount = 0, reviewCount = 0,
  collapsed, onToggleCollapse, onMobileExpand, mobileExpanded,
}: SidebarProps) {
  const getBillingBadge = (status: Client["billing"]["status"]) => {
    const colors = { paid: "text-green-400", pending: "text-yellow-400", overdue: "text-red-400" };
    return <span className={`text-[10px] ${colors[status]}`}>●</span>;
  };

  const sections = [
    { key: "boards", label: "Boards", items: boards.filter(b => b.section === "boards") },
    { key: "workspace", label: "Workspace", items: boards.filter(b => b.section === "workspace") },
    { key: "system", label: "System", items: boards.filter(b => b.section === "system") },
  ];

  return (
    <>
      {/* Logo */}
      <div className="p-3 md:p-3 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2.5 shrink-0 min-h-[52px]">
        {/* Mobile: menu icon to expand */}
        <button
          onClick={onMobileExpand}
          className="md:hidden text-gray-500 hover:text-gray-900 p-1 -ml-0.5"
          title="Expand menu"
        >
          <Menu size={22} />
        </button>

        {/* Desktop: collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="sidebar-collapse-btn hidden md:flex text-gray-500 hover:text-gray-800 p-0.5 shrink-0"
          title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <h1 className="text-base font-bold text-black sidebar-logo-text truncate">
          <span className="text-[#3b82f6]">Aql</span> <span className="sidebar-logo-text">Digital</span>
        </h1>

        {/* Show just "A" when collapsed */}
        {collapsed && (
          <span className="hidden md:block text-[#3b82f6] font-bold text-lg">A</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section, si) => (
          <div key={section.key} className={si > 0 ? "mt-1 pt-1 border-t border-[#1a1a1a]/50" : ""}>
            <span className="sidebar-section-label text-[9px] font-semibold text-gray-500 uppercase tracking-widest px-3 py-1.5 block">
              {section.label}
            </span>
            {section.items.map((board) => {
              const isActive = activeBoard === board.id;
              const Icon = board.icon;
              return (
                <button
                  key={board.id}
                  onClick={() => onNavigate(board.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-white text-black border-r-2 border-[#3b82f6]"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white border-r-2 border-transparent"
                  }`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? board.color || "text-black" : ""}`} />
                  <span className="sidebar-label text-xs font-medium truncate flex items-center gap-1.5">
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
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Client selector */}
        <div className="sidebar-client-list mt-2 pt-2 border-t border-[#1a1a1a]">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="sidebar-section-label text-[9px] font-semibold text-gray-500 uppercase tracking-widest">
              Clients ({clients.length})
            </span>
            <button onClick={onAddClient} className="sidebar-label text-[#3b82f6] text-[10px] hover:underline shrink-0">
              + Add
            </button>
          </div>
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors border-r-2 ${
                selectedClientId === client.id
                  ? "bg-white text-black border-[#3b82f6]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="sidebar-label font-medium truncate">{client.name}</span>
                <span className="sidebar-label">{getBillingBadge(client.billing?.status || "pending")}</span>
              </div>
            </button>
          ))}
          {clients.length === 0 && (
            <p className="sidebar-label text-[10px] text-gray-500 text-center py-2">No clients</p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#1a1a1a] shrink-0 space-y-1">
        <div className="sidebar-footer-text text-[10px] text-gray-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          Hermes
        </div>
        <div className="sidebar-footer-text text-[9px] text-amber-500/70 italic">
          Demo Mode — sample data
        </div>
      </div>
    </>
  );
}
