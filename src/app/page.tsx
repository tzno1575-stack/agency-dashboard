"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ChatWidget from "@/components/ChatWidget";
import ModeSwitcher from "@/components/ModeSwitcher";
import ReviewQueue from "@/components/ReviewQueue";
import ClientDetail from "@/components/ClientDetail";
import { sampleClients, sampleTasks } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Client, Task } from "@/lib/data";

type Mode = "taskforce" | "hybrid" | "nightshift";
type View = "kanban" | "review" | "crm";

export default function Dashboard() {
  const [clients, setClients, clientsLoaded] = useLocalStorage<Client[]>("aqd_clients", sampleClients);
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<Task[]>("aqd_tasks", sampleTasks);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(sampleClients[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [view, setView] = useState<View>("kanban");

  // Filter tasks for the selected client (for CRM detail view)
  const clientTasks = tasks.filter((t) => t.clientId === selectedClientId);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const handleAddClient = () => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: "New Client",
      website: "",
      socials: [],
      email: "",
      billing: { amount: 0, status: "pending" },
      notes: "",
    };
    setClients([...clients, newClient]);
    setSelectedClientId(newClient.id);
    setView("crm");
  };

  const handleSaveClient = (updated: Client) => {
    const exists = clients.find((c) => c.id === updated.id);
    if (exists) {
      setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      setClients([...clients, updated]);
      setSelectedClientId(updated.id);
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    // Also remove tasks for this client
    setTasks(tasks.filter((t) => t.clientId !== id));
    if (selectedClientId === id) {
      setSelectedClientId(clients[0]?.id !== id ? clients[0]?.id : null);
    }
  };

  // Show loading until localStorage is read
  if (!clientsLoaded || !tasksLoaded) {
    return (
      <div className="flex h-screen bg-[#0a0e17] items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0e17] text-gray-200 overflow-hidden">
      <Sidebar
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={(id) => {
          setSelectedClientId(id);
          setView("crm");
        }}
        onAddClient={handleAddClient}
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
              onClick={() => setView("crm")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "crm"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              CRM
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
        <div className="flex-1 overflow-hidden flex">
          {view === "kanban" && (
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
          )}
          {view === "crm" && (
            <div className="flex flex-1 overflow-hidden">
              {/* Client detail panel */}
              <div className="w-80 border-r border-[#1e293b] overflow-y-auto flex flex-col">
                <ClientDetail
                  client={selectedClient}
                  onSave={handleSaveClient}
                  onDelete={handleDeleteClient}
                  onClose={() => setView("kanban")}
                />
              </div>
              {/* Mini task board for this client */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-[#1e293b]">
                  Tasks for {selectedClient?.name || "client"} ({clientTasks.length})
                </div>
                <KanbanBoard
                  tasks={clientTasks}
                  onTasksChange={(updated) => {
                    // Merge: keep non-client tasks, replace client tasks
                    const others = tasks.filter((t) => t.clientId !== selectedClientId);
                    setTasks([...others, ...updated]);
                  }}
                />
              </div>
            </div>
          )}
          {view === "review" && <ReviewQueue />}
        </div>

        {/* Status bar */}
        <footer className="px-4 py-1.5 border-t border-[#1e293b] bg-[#0f1320] text-xs text-gray-600 flex items-center gap-4 shrink-0">
          <span>
            Mode: {mode === "hybrid" ? "Hybrid (10-80-10)" : mode === "taskforce" ? "TaskForce" : "NightShift"}
          </span>
          <span className="ml-auto">Aql Digital Agency OS v0.2</span>
        </footer>
      </main>
      <ChatWidget />
    </div>
  );
}
