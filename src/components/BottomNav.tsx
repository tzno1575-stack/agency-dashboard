"use client";

import { Sunrise, LayoutDashboard, Users, PenLine, Zap, Briefcase, MessageCircle, Settings } from "lucide-react";
import type { NavBoard } from "@/components/Sidebar";

interface BottomNavProps {
  activeView: string;
  agentCount: number;
  reviewCount: number;
  onNavigate: (id: string) => void;
}

const navItems: { id: NavBoard; label: string; icon: typeof Sunrise; badge?: string }[] = [
  { id: "briefing", label: "Home", icon: Sunrise },
  { id: "dashboard", label: "Tasks", icon: LayoutDashboard },
  { id: "taskforce", label: "Team", icon: Users },
  { id: "content", label: "Content", icon: PenLine },
  { id: "aichat", label: "AI Chat", icon: Zap },
  { id: "clients", label: "Clients", icon: Briefcase },
  { id: "messages", label: "Chat", icon: MessageCircle },
  { id: "settings", label: "More", icon: Settings },
];

export default function BottomNav({ activeView, agentCount, reviewCount, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#1a1a1a] z-[9999]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center h-16 px-1">
        {navItems.map((item, index) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          const showBadge =
            (item.id === "taskforce" && agentCount > 0) ||
            (item.id === "dashboard" && reviewCount > 0);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-h-[48px] min-w-[44px] transition-colors ${
                isActive
                  ? "text-[#3b82f6]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title={item.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#3b82f6] rounded-full" />
              )}

              {/* Icon with optional badge */}
              <div className="relative">
                <Icon size={22} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#3b82f6] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {item.id === "taskforce" ? agentCount : reviewCount}
                  </span>
                )}
              </div>

              {/* Label — 13px minimum */}
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}