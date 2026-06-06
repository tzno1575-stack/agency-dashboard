"use client";

import { LayoutDashboard, Users, MessageCircle, Bot } from "lucide-react";

interface BottomNavProps {
  activeView: string;
  agentCount: number;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: "kanban", label: "Tasks", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

export default function BottomNav({ activeView, agentCount, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1e293b] z-50 safe-area-pb">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id || (item.id === "chat" && activeView === "messages");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-[#3b82f6]" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.id === "agents" && agentCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {agentCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
