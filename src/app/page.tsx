"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ChatWidget from "@/components/ChatWidget";
import ModeSwitcher from "@/components/ModeSwitcher";
import ReviewQueue from "@/components/ReviewQueue";
import { sampleClients, sampleTasks } from "@/lib/data";
import type { Task } from "@/lib/data";

type Mode = "paperclip" | "hybrid" | "polsia";
type View = "kanban" | "review";

export default function Dashboard() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    sampleClients[0]?.id ?? null
  );
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [view, setView] = useState<View>("kanban");

  return (
    <div className="flex h-screen bg-[#0a0e17] text-gray-200 overflow-hidden">
      <Sidebar
        clients={sampleClients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "kanban"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setView("review")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                view === "review"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Review
              <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full">
                2
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "kanban" && (
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
          )}
          {view === "review" && <ReviewQueue />}
        </div>

        {/* Status bar */}
        <footer className="px-4 py-1.5 border-t border-[#1e293b] bg-[#0f1320] text-xs text-gray-600 flex items-center gap-4 shrink-0">
          <span>
            Mode: {mode === "hybrid" ? "Hybrid (10-80-10)" : mode === "paperclip" ? "Paperclip" : "Polsia 24/7"}
          </span>
          <span className="ml-auto">Aql Digital Agency OS v0.1</span>
        </footer>
      </main>
      <ChatWidget />
    </div>
  );
}
