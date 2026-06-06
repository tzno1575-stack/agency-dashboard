"use client";

import { Home, Briefcase, MessageSquare, Settings } from "lucide-react";
import type { Client } from "@/lib/data";

interface SidebarProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
}

const modules = [
  { name: "Dashboard", icon: Home, id: "dashboard" },
  { name: "Clients", icon: Briefcase, id: "clients" },
  { name: "Messages", icon: MessageSquare, id: "messages" },
  { name: "Settings", icon: Settings, id: "settings" },
];

export default function Sidebar({ clients, selectedClientId, onSelectClient }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1e293b] flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-[#1e293b]">
        <h1 className="text-lg font-bold text-white">
          <span className="text-[#3b82f6]">Aql</span> Digital
        </h1>
        <p className="text-xs text-gray-500 mt-1">Agency OS</p>
      </div>

      {/* Modules */}
      <nav className="p-3 space-y-1">
        {modules.map((mod) => (
          <button
            key={mod.id}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1a1f2e] transition-colors"
          >
            <mod.icon size={18} />
            {mod.name}
          </button>
        ))}
      </nav>

      {/* Clients */}
      <div className="p-3 border-t border-[#1e293b] flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Clients
          </span>
          <button className="text-[#3b82f6] text-xs hover:underline">+ Add</button>
        </div>
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => onSelectClient(client.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
              selectedClientId === client.id
                ? "bg-[#1a1f2e] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1a1f2e]"
            }`}
          >
            <div className="font-medium truncate">{client.name}</div>
            <div className="text-xs text-gray-500 truncate">{client.website}</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e293b] text-xs text-gray-600">
        Hermes Agent connected
      </div>
    </aside>
  );
}
