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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-[9999]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-[68px] px-0">
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
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[56px] transition-all duration-150 ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 active:bg-gray-50"
              }`}
              title={item.label}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active top bar */}
              {isActive && (
                <div className="absolute top-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
              )}

              {/* Icon + badge */}
              <div className="relative flex items-center justify-center">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold leading-none"
                    style={{ minWidth: '18px', minHeight: '18px' }}
                  >
                    {item.id === "taskforce" ? agentCount : reviewCount}
                  </span>
                )}
              </div>

              {/* Label — 13px, readable */}
              <span
                className="text-[12px] font-semibold leading-none"
                style={{ letterSpacing: '0.01em' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}