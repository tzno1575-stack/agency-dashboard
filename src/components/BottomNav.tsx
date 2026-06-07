"use client";

import { Sunrise, LayoutDashboard, PenLine, MessageCircle, Settings } from "lucide-react";
import type { NavBoard } from "@/components/Sidebar";

interface BottomNavProps {
  activeView: string;
  agentCount: number;
  reviewCount: number;
  onNavigate: (id: string) => void;
}

const navItems: { id: NavBoard; label: string; icon: typeof Sunrise }[] = [
  { id: "briefing", label: "Home", icon: Sunrise },
  { id: "dashboard", label: "Tasks", icon: LayoutDashboard },
  { id: "content", label: "Content", icon: PenLine },
  { id: "messages", label: "Chat", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ activeView, agentCount, reviewCount, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#1a1a1a] z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] min-w-[44px] transition-colors rounded-lg mx-0.5 ${
                isActive
                  ? "text-[#3b82f6] bg-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {item.id === "dashboard" && agentCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {agentCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
