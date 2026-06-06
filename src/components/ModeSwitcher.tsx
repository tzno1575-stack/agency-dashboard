"use client";

import { Users, GitMerge, Zap, ExternalLink } from "lucide-react";

type Mode = "taskforce" | "hybrid" | "autopilot";

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const modes: { id: Mode; label: string; icon: typeof Users; desc: string; newTab?: boolean; route?: string }[] = [
  {
    id: "taskforce",
    label: "TaskForce",
    icon: Users,
    desc: "Hire & direct agents",
    newTab: true,
    route: "/taskforce",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    icon: GitMerge,
    desc: "Best of both",
  },
  {
    id: "autopilot",
    label: "AutoPilot",
    icon: Zap,
    desc: "24/7 autonomy",
    newTab: true,
    route: "/autopilot",
  },
];

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0f1320] rounded-lg p-1 border border-[#1e293b]">
      {modes.map((m) => {
        const isActive = mode === m.id;

        if (m.newTab && m.route) {
          return (
            <a
              key={m.id}
              href={m.route}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onChange(m.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#3b82f6] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              title={`${m.desc} (opens in new tab)`}
            >
              <m.icon size={14} />
              <span className="hidden sm:inline">{m.label}</span>
              <ExternalLink size={10} className="hidden sm:inline opacity-50" />
            </a>
          );
        }

        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? "bg-[#3b82f6] text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
            title={m.desc}
          >
            <m.icon size={14} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
