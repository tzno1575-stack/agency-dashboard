"use client";

import { Home, Briefcase, MessageSquare, Settings, Palette, Key, Server } from "lucide-react";
import type { Client } from "@/lib/data";

interface SidebarProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: () => void;
  onNavigate: (module: "dashboard" | "clients" | "messages" | "settings") => void;
  activeModule: string;
}

const modules = [
  { name: "Dashboard", icon: Home, id: "dashboard" as const, desc: "Tasks & overview" },
  { name: "Clients", icon: Briefcase, id: "clients" as const, desc: "CRM & billing" },
  { name: "Messages", icon: MessageSquare, id: "messages" as const, desc: "Ayla chat" },
  { name: "Settings", icon: Settings, id: "settings" as const, desc: "Config & integrations" },
];

export default function Sidebar({ clients, selectedClientId, onSelectClient, onAddClient, onNavigate, activeModule }: SidebarProps) {
  const getBillingBadge = (status: Client["billing"]["status"]) => {
    const colors = {
      paid: "text-green-400",
      pending: "text-yellow-400",
      overdue: "text-red-400",
    };
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

      {/* Modules */}
      <nav className="p-3 space-y-1">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onNavigate(mod.id)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
              activeModule === mod.id
                ? "bg-[#1a1f2e] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1a1f2e]"
            }`}
            title={mod.desc}
          >
            <mod.icon size={18} />
            <div className="text-left">
              <div className="font-medium">{mod.name}</div>
              <div className="text-[10px] text-gray-600">{mod.desc}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Clients */}
      <div className="p-3 border-t border-[#1e293b] flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Clients ({clients.length})
          </span>
          <button
            onClick={onAddClient}
            className="text-[#3b82f6] text-xs hover:underline"
          >
            + Add
          </button>
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
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{client.name}</span>
              {getBillingBadge(client.billing.status)}
            </div>
            <div className="text-xs text-gray-500 truncate">{client.website}</div>
          </button>
        ))}
        {clients.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No clients yet</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e293b] text-xs text-gray-600">
        Hermes Agent connected
      </div>
    </aside>
  );
}
