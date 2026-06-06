"use client";

import { Users, GitMerge, Zap } from "lucide-react";

type Mode = "paperclip" | "hybrid" | "polsia";

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const modes: { id: Mode; label: string; icon: typeof Users; desc: string }[] = [
  {
    id: "paperclip",
    label: "Paperclip",
    icon: Users,
    desc: "You direct agents",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    icon: GitMerge,
    desc: "Best of both",
  },
  {
    id: "polsia",
    label: "Polsia",
    icon: Zap,
    desc: "Full autonomy",
  },
];

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0f1320] rounded-lg p-1 border border-[#1e293b]">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === m.id
              ? "bg-[#3b82f6] text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          title={m.desc}
        >
          <m.icon size={14} />
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
